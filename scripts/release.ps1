param(
  [string]$Branch = "main",
  [string]$Message = ""
)

$ErrorActionPreference = "Stop"

$legacyVercelProjectId = "prj_zjTdEX1n3ztYAlBl1Yk0UtFKsD2B"
$legacyVercelTeamId = "team_Od4IiIaMTFI1i7jYCni8Q38d"
$expectedVercelProjectId = "prj_cjrjn48ITrflxbcKs8C9PJ6O9RKO"
$expectedVercelTeamId = "team_ZKmv6uQSU9QUyP08mxAr2YDI"
$vercelLinkPath = ".\.vercel\project.json"

if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
  throw "Vercel CLI not found. Install with: npm i -g vercel"
}

if (-not (Test-Path $vercelLinkPath)) {
  throw "Vercel project is not linked. Link and verify the new Vercel project before release."
}

$vercelLink = Get-Content -Raw $vercelLinkPath | ConvertFrom-Json
if (
  $vercelLink.projectId -eq $legacyVercelProjectId -or
  $vercelLink.orgId -eq $legacyVercelTeamId
) {
  throw "Release blocked: this repository is still linked to the retired Vercel target."
}

if (
  $vercelLink.projectId -ne $expectedVercelProjectId -or
  $vercelLink.orgId -ne $expectedVercelTeamId
) {
  throw "Release blocked: linked Vercel project/team does not match the approved production target."
}

powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\sync-github.ps1" -Branch $Branch -Message $Message
if ($LASTEXITCODE -ne 0) {
  throw "GitHub sync failed. Release aborted."
}

Write-Host "Deploying to Vercel production..."
vercel deploy --prod
if ($LASTEXITCODE -ne 0) {
  throw "Vercel deploy failed."
}

Write-Host "Release completed."
