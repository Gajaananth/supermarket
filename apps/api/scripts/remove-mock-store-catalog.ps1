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

$apiDirectory = $PSScriptRoot | Split-Path -Parent
$dbPassword = Read-SecretText 'Enter the Supabase database password'
$encodedPassword = [Uri]::EscapeDataString($dbPassword)
$databaseUrl = "postgresql://postgres.jotqsadhkvwspydcieps:${encodedPassword}@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"

try {
  $env:DATABASE_URL = $databaseUrl
  $env:APP_ENV = 'staging'
  Push-Location $apiDirectory
  try {
    node '.\scripts\remove-mock-store-catalog.cjs'
    if ($LASTEXITCODE -ne 0) {
      throw 'Mock catalog removal failed.'
    }
  }
  finally {
    Pop-Location
  }
}
finally {
  Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue
  Remove-Item Env:APP_ENV -ErrorAction SilentlyContinue
  $dbPassword = $null
  $encodedPassword = $null
  $databaseUrl = $null
}
