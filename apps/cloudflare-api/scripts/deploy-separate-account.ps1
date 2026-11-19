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

$workerDirectory = Split-Path -Parent $PSScriptRoot
$apiDirectory = Join-Path (Split-Path -Parent $workerDirectory) 'api'

$account = (npx wrangler whoami 2>&1 | Out-String)
if ($account -notmatch '4581fc47a2a3cff6543e37c4beb36528') {
  throw 'Refusing deployment: active Cloudflare account is not the separate BuyMe account.'
}

$dbPassword = Read-SecretText 'Enter the Supabase database password'
$encodedPassword = [Uri]::EscapeDataString($dbPassword)
$databaseUrl = "postgresql://postgres.jotqsadhkvwspydcieps:${encodedPassword}@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"

try {
  Push-Location $workerDirectory
  try {
    $existing = npx wrangler hyperdrive list 2>&1 | Out-String
    if ($existing -notmatch 'buyme-supabase') {
      $hyperdriveUrl = "postgresql://postgres.jotqsadhkvwspydcieps:${encodedPassword}@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"
      npx wrangler hyperdrive create buyme-supabase `
        --connection-string $hyperdriveUrl `
        --binding HYPERDRIVE `
        --sslmode require `
        --origin-connection-limit 5 `
        --update-config
      if ($LASTEXITCODE -ne 0) {
        throw 'Could not create the BuyMe Supabase Hyperdrive binding.'
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
    $credentials.demoOtpCode | npx wrangler secret put DEMO_OTP_CODE
    if ($LASTEXITCODE -ne 0) {
      throw 'Could not set DEMO_OTP_CODE.'
    }
    $jwtSecret | npx wrangler secret put JWT_SECRET
    if ($LASTEXITCODE -ne 0) {
      throw 'Could not set JWT_SECRET.'
    }
    npm run deploy
    if ($LASTEXITCODE -ne 0) {
      throw 'BuyMe Worker deployment failed.'
    }
  }
  finally {
    Pop-Location
  }

  $workerUrl = 'https://buyme-api.projectsecond283.workers.dev'
  $health = Invoke-RestMethod "$workerUrl/health"
  if (!$health.success -or $health.data.status -ne 'ok') {
    throw 'The separate-account Worker health check failed.'
  }
  $stores = Invoke-RestMethod "$workerUrl/api/v1/stores"
  $store = @($stores.data.stores | Where-Object { $_.code -eq 'BM-S01' }) | Select-Object -First 1
  if (!$store) {
    throw 'The separate-account Worker did not return BM-S01.'
  }
  $catalog = Invoke-RestMethod "$workerUrl/api/v1/stores/$($store.id)/catalog"
  if (!$catalog.success -or $catalog.data.Count -eq 0) {
    throw 'The separate-account Worker did not return the BM-S01 catalog.'
  }

  Write-Output ''
  Write-Output 'BuyMe staging backend deployed and verified.'
  Write-Output "Worker: $workerUrl"
  Write-Output "Super Admin: admin@buyme.lk"
  Write-Output "Super Admin password: $($credentials.superAdminPassword)"
  Write-Output "Store Admin: manager.bm-s01@buyme.lk"
  Write-Output "Store Admin password: $($credentials.storeAdminPassword)"
  Write-Output "Customer: +94772220001"
  Write-Output "Rider: rider.batti@buyme.lk"
  Write-Output "Demo OTP: $($credentials.demoOtpCode)"
}
finally {
  Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue
  Remove-Item Env:APP_ENV -ErrorAction SilentlyContinue
  $dbPassword = $null
  $encodedPassword = $null
  $databaseUrl = $null
  $jwtSecret = $null
  $credentials = $null
}
