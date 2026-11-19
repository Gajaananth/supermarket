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

function New-DemoPassword {
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  $bytes = New-Object byte[] 24
  try {
    $rng.GetBytes($bytes)
    return [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
  }
  finally {
    $rng.Dispose()
  }
}

$dbPassword = Read-SecretText 'Enter the Supabase database password'
$encodedPassword = [Uri]::EscapeDataString($dbPassword)
$databaseUrl = "postgresql://postgres.jotqsadhkvwspydcieps:${encodedPassword}@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"
$superAdminPassword = New-DemoPassword
$storeAdminPassword = New-DemoPassword
$otpBytes = New-Object byte[] 6
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
try {
  $rng.GetBytes($otpBytes)
  $demoOtpCode = -join ($otpBytes | ForEach-Object { [string]($_ % 10) })
}
finally {
  $rng.Dispose()
}

$apiDirectory = Split-Path -Parent $PSScriptRoot
$environment = @{
  DATABASE_URL = $databaseUrl
  APP_ENV = 'staging'
  NODE_ENV = 'production'
  ALLOW_DEMO_SEED = 'true'
  DEMO_OTP_ENABLED = 'true'
  DEMO_OTP_CODE = $demoOtpCode
  SEED_SUPER_ADMIN_PASSWORD = $superAdminPassword
  SEED_STORE_ADMIN_PASSWORD = $storeAdminPassword
}

foreach ($key in $environment.Keys) {
  Set-Item -Path "Env:$key" -Value $environment[$key]
}

Push-Location $apiDirectory
try {
  npm run prisma:migrate:deploy
  if ($LASTEXITCODE -ne 0) {
    throw 'Prisma migrations failed; demo seeding was not run.'
  }

  npm run prisma:seed
  if ($LASTEXITCODE -ne 0) {
    throw 'Demo seeding failed. Review the error before retrying.'
  }

  Write-Output ''
  Write-Output 'BM-S01 demo credentials (save these; they will not be shown again):'
  Write-Output "Super Admin admin@buyme.lk password: $superAdminPassword"
  Write-Output "Store Admin manager.bm-s01@buyme.lk password: $storeAdminPassword"
  Write-Output "Customer +94772220001 demo OTP: $demoOtpCode"
  Write-Output "Rider +94771110001 demo OTP: $demoOtpCode"
}
finally {
  Pop-Location
  foreach ($key in $environment.Keys) {
    Remove-Item -Path "Env:$key" -ErrorAction SilentlyContinue
  }
  $databaseUrl = $null
  $dbPassword = $null
  $encodedPassword = $null
  $superAdminPassword = $null
  $storeAdminPassword = $null
  $demoOtpCode = $null
  $environment = $null
}
