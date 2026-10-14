# Maverick Agent Harness OS — Automated Session Synchronization Engine (Windows PowerShell)
param (
    [string]$CommitMessage
)

$ErrorActionPreference = "Continue"
if (Test-Path Variable:\PSNativeCommandUseErrorActionPreference) {
    $PSNativeCommandUseErrorActionPreference = $false
}
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$WorkspaceRoot = Split-Path -Parent $ScriptDir

Set-Location $WorkspaceRoot

$Timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz"
if (-not $CommitMessage) {
    $CommitMessage = "chore(session-sync): autonomous state update at $Timestamp"
}

Write-Host "======================================================================"
Write-Host "[$Timestamp] STARTING MAVERICK OS SESSION SYNCHRONIZATION"
Write-Host "Workspace: $WorkspaceRoot"
Write-Host "======================================================================"

# 1. Fetch & rebase
$currentBranch = (git rev-parse --abbrev-ref HEAD).Trim()
Write-Host "Fetching & rebasing from 'origin/$currentBranch'..."
git pull --rebase origin $currentBranch

# 2. Check for tunnel URL argument
if ($CommitMessage -match '^https?://') {
    $tunnelUrl = $CommitMessage
    Write-Host "[SYNC MARKER] Updating SYNC.md with tunnel URL: $tunnelUrl"
    @"
# Sync marker
- **Tunnel URL:** $tunnelUrl
- **Generated at:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
- **Action:** Bi-directional sync across Workstation and Home PC.
"@ | Set-Content -Path "SYNC.md" -Encoding utf8
    $CommitMessage = "chore(bridge): update sync marker with tunnel $tunnelUrl"
}

# 3. Update CURRENT.md reconciliation timestamp
if (Test-Path "CURRENT.md") {
    $content = Get-Content "CURRENT.md" -Raw
    $content = $content -replace '\*\*Last Reconciled:\*\*.*', "**Last Reconciled:** $Timestamp"
    Set-Content -Path "CURRENT.md" -Value $content -Encoding utf8
}

# 4. Stage changes
git add .

# 5. Check if staged changes exist
git diff --staged --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "No unstaged or uncommitted changes detected. Workspace is clean."
} else {
    Write-Host "Staged changes detected. Creating commit..."
    git commit -m $CommitMessage
    Write-Host "Commit created successfully."
}

# 6. Push
Write-Host "Pushing changes to remote 'origin/$currentBranch'..."
git push origin $currentBranch
Write-Host "Push completed successfully."

Write-Host "======================================================================"
Write-Host "SESSION SYNCHRONIZATION COMPLETE"
Write-Host "======================================================================"
