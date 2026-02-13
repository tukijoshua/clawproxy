import { NextResponse } from 'next/server'

const SCRIPT = `# ─── ClawProxy One-Command Setup (PowerShell) ───
# This script finds your OpenClaw config, backs it up, and patches it
# to route requests through ClawProxy.

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "  ╔═══════════════════════════════════════╗" -ForegroundColor Green
Write-Host "  ║       ClawProxy Setup Script          ║" -ForegroundColor Green
Write-Host "  ╚═══════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# ── Step 1: Ask for API key ──
Write-Host "Step 1: " -NoNewline -ForegroundColor White
Write-Host "Enter your ClawProxy API key"
Write-Host "  (starts with cp_sk_, from your onboarding page)" -ForegroundColor Gray
Write-Host ""
$ApiKey = Read-Host "  API Key"

if ([string]::IsNullOrWhiteSpace($ApiKey)) {
    Write-Host "Error: No API key provided. Exiting." -ForegroundColor Red
    exit 1
}

if (-not $ApiKey.StartsWith("cp_sk_")) {
    Write-Host "Warning: Key doesn't start with cp_sk_ — are you sure this is correct?" -ForegroundColor Yellow
    $confirm = Read-Host "  Continue anyway? (y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Host "Exiting."
        exit 1
    }
}

Write-Host ""

# ── Step 2: Find config file ──
Write-Host "Step 2: " -NoNewline -ForegroundColor White
Write-Host "Looking for OpenClaw config..."
Write-Host ""

$ConfigPaths = @(
    "$env:USERPROFILE\\.openclaw\\openclaw.json",
    "$env:USERPROFILE\\.openclaw\\config.json",
    "$env:USERPROFILE\\.config\\openclaw\\openclaw.json",
    "$env:APPDATA\\openclaw\\openclaw.json"
)

$ConfigFile = $null
foreach ($path in $ConfigPaths) {
    if (Test-Path $path) {
        $ConfigFile = $path
        break
    }
}

if (-not $ConfigFile) {
    Write-Host "Could not auto-detect config file." -ForegroundColor Yellow
    Write-Host "  Common locations:"
    Write-Host "    %USERPROFILE%\\.openclaw\\openclaw.json"
    Write-Host "    %APPDATA%\\openclaw\\openclaw.json"
    Write-Host ""
    $ConfigFile = Read-Host "  Enter full path to your config file"
    if (-not (Test-Path $ConfigFile)) {
        Write-Host "Error: File not found: $ConfigFile" -ForegroundColor Red
        exit 1
    }
}

Write-Host "  Found: $ConfigFile" -ForegroundColor Green
Write-Host ""

# ── Step 3: Back up ──
Write-Host "Step 3: " -NoNewline -ForegroundColor White
Write-Host "Creating backup..."
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = "$ConfigFile.backup.$timestamp"
Copy-Item $ConfigFile $BackupFile
Write-Host "  Backup saved: $BackupFile" -ForegroundColor Green
Write-Host ""

# ── Step 4: Patch config ──
Write-Host "Step 4: " -NoNewline -ForegroundColor White
Write-Host "Patching config with ClawProxy settings..."

try {
    $config = Get-Content $ConfigFile -Raw | ConvertFrom-Json
    $config | Add-Member -NotePropertyName "apiBaseUrl" -NotePropertyValue "https://api.clawproxy.ai/v1" -Force
    $headers = [PSCustomObject]@{ "x-clawproxy-key" = $ApiKey }
    $config | Add-Member -NotePropertyName "customHeaders" -NotePropertyValue $headers -Force
    $config | ConvertTo-Json -Depth 10 | Set-Content $ConfigFile -Encoding UTF8
    Write-Host "  ✓ Patched successfully" -ForegroundColor Green
} catch {
    Write-Host "Error: Failed to patch config: $_" -ForegroundColor Red
    Write-Host "  Restoring backup..." -ForegroundColor Yellow
    Copy-Item $BackupFile $ConfigFile
    exit 1
}

Write-Host ""

# ── Step 5: Verify ──
Write-Host "Step 5: " -NoNewline -ForegroundColor White
Write-Host "Verifying..."
$content = Get-Content $ConfigFile -Raw

if ($content -match "api.clawproxy.ai") {
    Write-Host "  ✓ apiBaseUrl set correctly" -ForegroundColor Green
} else {
    Write-Host "  ✗ apiBaseUrl not found in config" -ForegroundColor Red
    exit 1
}

if ($content -match "x-clawproxy-key") {
    Write-Host "  ✓ API key added to headers" -ForegroundColor Green
} else {
    Write-Host "  ✗ API key not found in config" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "  ════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✓ ClawProxy is now configured!" -ForegroundColor Green
Write-Host "  ════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "  Config file: $ConfigFile" -ForegroundColor Green
Write-Host "  Backup:      $BackupFile" -ForegroundColor Green
Write-Host ""
Write-Host "  Next step: " -NoNewline -ForegroundColor White
Write-Host "Restart your OpenClaw agent:"
Write-Host "    openclaw restart" -ForegroundColor Green
Write-Host ""
Write-Host "  Then go back to ClawProxy onboarding to test the connection."
Write-Host ""
`

export async function GET() {
  return new NextResponse(SCRIPT, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  })
}
