# Deploy the Raqeeb FastAPI to Fly.io (from repo root, PowerShell).
# Requires: flyctl auth login   (already done if `flyctl auth whoami` prints an email)

$ErrorActionPreference = "Stop"
$App = "raqeeb-api"
$Region = "fra"

if (-not (Get-Command flyctl -ErrorAction SilentlyContinue)) {
  Write-Error "Install flyctl: winget install Fly-io.flyctl"
}

$who = flyctl auth whoami 2>$null
if (-not $who) {
  Write-Host "Not logged in. Run: flyctl auth login"
  exit 1
}

$exists = $true
try {
  flyctl status -a $App | Out-Null
} catch {
  $exists = $false
}

if (-not $exists) {
  Write-Host "Creating app $App"
  flyctl apps create $App --org personal
}

$vols = flyctl volumes list -a $App --json | ConvertFrom-Json
if (-not $vols -or @($vols).Count -eq 0) {
  Write-Host "Creating volume raqeeb_data"
  flyctl volumes create raqeeb_data --region $Region --size 1 --app $App --yes
}

$secret = [guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N")
$cors = $env:RAQEEB_CORS_ORIGINS
if (-not $cors) { $cors = "http://localhost:3000,http://127.0.0.1:3000" }

flyctl secrets set -a $App RAQEEB_JWT_SECRET="$secret" CORS_ORIGINS="$cors"
flyctl deploy --remote-only -a $App

Write-Host "API: https://$App.fly.dev/health"
Write-Host "After Vercel, run:"
Write-Host "  flyctl secrets set -a $App CORS_ORIGINS=`"https://YOUR.vercel.app,http://localhost:3000`""
