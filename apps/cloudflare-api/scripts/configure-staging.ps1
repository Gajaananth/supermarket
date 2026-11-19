$ErrorActionPreference = 'Stop'

function Read-SecretText([string]$Prompt) {
  $secureValue = Read-Host -Prompt $Prompt -AsSecureString
  if ($secureValue.Length -eq 0) {
    throw "$Prompt is required."
  }

  $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureValue)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
  }
  finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
  }
}

function Set-WorkerSecret([string]$Name, [string]$Value) {
  $Value | npx wrangler secret put $Name
  if ($LASTEXITCODE -ne 0) {
    throw "Could not set the Cloudflare Worker secret $Name."
  }
}

function Set-VercelProductionVariable([string]$Name, [string]$Value) {
  $Value | npx vercel env add $Name --environment production --sensitive --force --yes
  if ($LASTEXITCODE -ne 0) {
    throw "Could not set the Vercel production variable $Name."
  }
}

function Invoke-PortalPost([string]$BaseUrl, [string]$Path, [object]$Body, $Session) {
  $response = Invoke-WebRequest `
    -Uri "$BaseUrl$Path" `
    -Method Post `
    -ContentType 'application/json' `
    -Headers @{ Origin = $BaseUrl } `
    -Body ($Body | ConvertTo-Json -Compress) `
    -WebSession $Session
  return $response.Content | ConvertFrom-Json
}

function Assert-Role([string]$Name, $Response, [string]$ExpectedRole) {
  if (!$Response.user -or $Response.user.role -ne $ExpectedRole) {
    throw "$Name login did not return the expected $ExpectedRole account."
  }
}

$workspace = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))
$apiDirectory = Join-Path $workspace 'apps\api'
$workerDirectory = Split-Path -Parent $PSScriptRoot
$webDirectory = Join-Path $workspace 'apps\admin_web'
$baseUrl = 'https://supermarket-admin-web.vercel.app'
$apiBaseUrl = 'https://buyme-api.acceseries.workers.dev'
$dbPassword = Read-SecretText 'Enter the Supabase database password'
$encodedPassword = [Uri]::EscapeDataString($dbPassword)
$databaseUrl = "postgresql://postgres.jotqsadhkvwspydcieps:${encodedPassword}@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"
$temporaryFiles = New-Object System.Collections.Generic.List[string]
$credentials = $null

try {
  Push-Location $workerDirectory
  try {
    $wranglerConfig = Get-Content 'wrangler.jsonc' -Raw
    if ($wranglerConfig -notmatch '"binding"\s*:\s*"HYPERDRIVE"') {
      $hyperdriveUrl = "postgresql://postgres.jotqsadhkvwspydcieps:${encodedPassword}@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"
      npx wrangler hyperdrive create buyme-supabase `
        --connection-string $hyperdriveUrl `
        --binding HYPERDRIVE `
        --sslmode require `
        --origin-connection-limit 5 `
        --update-config
      if ($LASTEXITCODE -ne 0) {
        throw 'Could not create the Supabase Hyperdrive binding.'
      }
    }
  }
  finally {
    Pop-Location
  }

  $env:DATABASE_URL = $databaseUrl
  $env:APP_ENV = 'staging'
  Push-Location $apiDirectory
  try {
    $credentialOutput = & node '.\scripts\reset-staging-demo-credentials.cjs'
    if ($LASTEXITCODE -ne 0) {
      throw 'Could not update the seeded BM-S01 demo account credentials.'
    }
    $credentials = ($credentialOutput -join "`n") | ConvertFrom-Json
  }
  finally {
    Pop-Location
    Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue
    Remove-Item Env:APP_ENV -ErrorAction SilentlyContinue
  }

  $jwtBytes = New-Object byte[] 32
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try {
    $rng.GetBytes($jwtBytes)
    $jwtSecret = [Convert]::ToBase64String($jwtBytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
  }
  finally {
    $rng.Dispose()
  }

  Push-Location $workerDirectory
  try {
    Set-WorkerSecret 'JWT_SECRET' $jwtSecret
    Set-WorkerSecret 'DEMO_OTP_CODE' $credentials.demoOtpCode
    npm run deploy
    if ($LASTEXITCODE -ne 0) {
      throw 'Cloudflare Worker deployment failed.'
    }
  }
  finally {
    Pop-Location
  }

  Push-Location $webDirectory
  try {
    Set-VercelProductionVariable 'BUYME_API_BASE_URL' $apiBaseUrl
    Set-VercelProductionVariable 'BUYME_JWT_SECRET' $jwtSecret
    npx vercel --prod --yes
    if ($LASTEXITCODE -ne 0) {
      throw 'Vercel production deployment failed.'
    }
  }
  finally {
    Pop-Location
  }

  $health = Invoke-RestMethod "$apiBaseUrl/health"
  if (!$health.success -or $health.data.status -ne 'ok') {
    throw 'The deployed Worker health check failed.'
  }

  $stores = Invoke-RestMethod "$apiBaseUrl/api/v1/stores"
  $mainStore = @($stores.data.stores | Where-Object { $_.code -eq 'BM-S01' }) | Select-Object -First 1
  if (!$mainStore) {
    throw 'The deployed API did not return the seeded BM-S01 store.'
  }
  $catalog = Invoke-RestMethod "$apiBaseUrl/api/v1/stores/$($mainStore.id)/catalog"
  if (!$catalog.success -or $catalog.data.Count -eq 0) {
    throw 'The deployed API did not return the BM-S01 catalog.'
  }

  $adminSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
  $adminLogin = Invoke-PortalPost $baseUrl '/api/auth/admin/login' @{
    email = 'admin@buyme.lk'
    password = $credentials.superAdminPassword
  } $adminSession
  if (!$adminLogin.requires2fa -or !$adminLogin.demoCode) {
    throw 'Super Admin password login did not reach the 2FA step.'
  }
  $adminVerified = Invoke-PortalPost $baseUrl '/api/auth/admin/verify-2fa' @{
    email = 'admin@buyme.lk'
    code = $adminLogin.demoCode
  } $adminSession
  Assert-Role 'Super Admin' $adminVerified 'SUPER_ADMIN'
  $adminProfile = Invoke-RestMethod "$baseUrl/api/auth/session" -WebSession $adminSession
  Assert-Role 'Super Admin session' $adminProfile 'SUPER_ADMIN'

  $storeAdminSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
  $storeAdminLogin = Invoke-PortalPost $baseUrl '/api/auth/store-admin/login' @{
    email = 'manager.bm-s01@buyme.lk'
    password = $credentials.storeAdminPassword
  } $storeAdminSession
  Assert-Role 'Store Admin' $storeAdminLogin 'STORE_ADMIN'
  $storeAdminProfile = Invoke-RestMethod "$baseUrl/api/auth/session" -WebSession $storeAdminSession
  Assert-Role 'Store Admin session' $storeAdminProfile 'STORE_ADMIN'

  $customerSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
  $customerRequest = Invoke-PortalPost $baseUrl '/api/auth/customer/otp-request' @{
    phone = '+94772220001'
  } $customerSession
  $customerLogin = Invoke-PortalPost $baseUrl '/api/auth/customer/otp-verify' @{
    phone = '+94772220001'
    code = $customerRequest.demoCode
  } $customerSession
  Assert-Role 'Customer' $customerLogin 'CUSTOMER'

  $riderSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
  $riderRequest = Invoke-PortalPost $baseUrl '/api/auth/rider/otp-request' @{
    destination = 'rider.batti@buyme.lk'
  } $riderSession
  $riderLogin = Invoke-PortalPost $baseUrl '/api/auth/rider/otp-verify' @{
    destination = 'rider.batti@buyme.lk'
    code = $riderRequest.demoCode
  } $riderSession
  Assert-Role 'Rider' $riderLogin 'RIDER'

  Write-Output ''
  Write-Output 'All production staging checks passed: Worker health, BM-S01 catalog, and all four login flows.'
  Write-Output "Super Admin: https://supermarket-admin-web.vercel.app/admin/login | admin@buyme.lk | $($credentials.superAdminPassword)"
  Write-Output "Store Admin: https://supermarket-admin-web.vercel.app/store-admin/login | manager.bm-s01@buyme.lk | $($credentials.storeAdminPassword)"
  Write-Output "Customer: https://supermarket-admin-web.vercel.app/customer/login | +94772220001 | OTP is shown on the login page"
  Write-Output "Rider: https://supermarket-admin-web.vercel.app/rider/login | rider.batti@buyme.lk | OTP is shown on the login page"
}
finally {
  Pop-Location -ErrorAction SilentlyContinue
  foreach ($temporaryFile in $temporaryFiles) {
    Remove-Item $temporaryFile -ErrorAction SilentlyContinue
  }
  Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue
  Remove-Item Env:APP_ENV -ErrorAction SilentlyContinue
  $dbPassword = $null
  $encodedPassword = $null
  $databaseUrl = $null
  $hyperdriveUrl = $null
  $jwtSecret = $null
  $credentials = $null
}
