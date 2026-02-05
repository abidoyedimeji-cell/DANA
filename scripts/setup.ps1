# DANA setup – run from repo root in PowerShell
# If pnpm is not found, run once: npm i -g pnpm

Set-Location $PSScriptRoot\..

Write-Host "Step A: Installing root dependencies..." -ForegroundColor Cyan
pnpm install
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Step A: Building shared package..." -ForegroundColor Cyan
pnpm shared:build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Step C prep: Installing mobile dependencies..." -ForegroundColor Cyan
Set-Location mobile
pnpm install
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Set-Location ..

Write-Host "Setup done. To run web: pnpm dev" -ForegroundColor Green
Write-Host "To run mobile: pnpm mobile  (or cd mobile; pnpm start)" -ForegroundColor Green
