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

$apiDirectory = Split-Path -Parent $PSScriptRoot
$workspace = Split-Path -Parent $apiDirectory
$csvPath = 'C:\Users\gajaa\Downloads\dairy_products_with_images_extracted\dairy_products.csv'
$imagesSource = 'C:\Users\gajaa\Downloads\dairy_products_with_images_extracted\images'
$publicImages = Join-Path $workspace 'apps\admin_web\public\images\dairy'

if (!(Test-Path $csvPath)) {
  throw "Dairy CSV not found at $csvPath"
}

New-Item -ItemType Directory -Force -Path $publicImages | Out-Null
Get-ChildItem -LiteralPath $imagesSource -File |
  Where-Object { $_.DirectoryName -notlike '*unused_extra_photos*' } |
  Copy-Item -Destination $publicImages -Force

$dbPassword = Read-SecretText 'Enter the Supabase database password'
$encodedPassword = [Uri]::EscapeDataString($dbPassword)
$databaseUrl = "postgresql://postgres.jotqsadhkvwspydcieps:${encodedPassword}@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"

try {
  $env:DATABASE_URL = $databaseUrl
  $env:APP_ENV = 'staging'
  Push-Location $apiDirectory
  try {
    node '.\scripts\import-dairy-products.cjs' $csvPath $publicImages
    if ($LASTEXITCODE -ne 0) {
      throw 'Dairy product import failed.'
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
