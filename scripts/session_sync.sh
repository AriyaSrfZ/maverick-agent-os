#!/usr/bin/env bash
# ==============================================================================
# Maverick Agent Harness OS — Automated Session Synchronization Engine
# Synchronizes local workspace state, updates CURRENT.md, commits, and pushes to GitHub.
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${WORKSPACE_ROOT}"

TIMESTAMP="$(date --iso-8601=seconds)"
COMMIT_MSG="${1:-"chore(session-sync): autonomous state update at ${TIMESTAMP}"}"

echo "======================================================================"
echo "[${TIMESTAMP}] STARTING MAVERICK OS SESSION SYNCHRONIZATION"
echo "Workspace: ${WORKSPACE_ROOT}"
echo "======================================================================"

# 1. Fetch & rebase remote changes first to prevent push conflicts
if git remote | grep -q "^origin$"; then
    CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
    echo "Fetching & rebasing from 'origin/${CURRENT_BRANCH}'..."
    HAS_LOCAL_CHANGES="$(git status --porcelain || true)"
    if [ -n "${HAS_LOCAL_CHANGES}" ]; then
        git stash --include-untracked -q 2>/dev/null || true
    fi
    git pull --rebase origin "${CURRENT_BRANCH}" || {
        echo "[WARNING] Rebase failed or had conflicts; aborting auto-rebase."
        git rebase --abort 2>/dev/null || true
    }
    if [ -n "${HAS_LOCAL_CHANGES}" ]; then
        git stash pop -q 2>/dev/null || true
    fi
fi

# 2. Check for sync marker argument (URL or commit message)
if [[ "${1:-}" =~ ^https?:// ]]; then
    TUNNEL_URL="$1"
    echo "[SYNC MARKER] Updating SYNC.md with tunnel URL: ${TUNNEL_URL}"
    cat <<EOF > SYNC.md
# Sync marker
- **Tunnel URL:** ${TUNNEL_URL}
- **Generated at:** $(date '+%Y-%m-%d %H:%M:%S')
- **Action:** Bi-directional sync across Workstation and Home PC.
EOF
    COMMIT_MSG="chore(bridge): update sync marker with tunnel ${TUNNEL_URL}"
fi

# 3. Read active SYNC.md marker if present
if [ -f "SYNC.md" ]; then
    MARKER_URL="$(grep -io 'https\?://[^ ]*' SYNC.md | head -n1 || true)"
    if [ -n "${MARKER_URL}" ]; then
        echo "[SYNC MARKER DETECTED] Active Tunnel URL: ${MARKER_URL}"
    fi
fi

# 4. Update CURRENT.md reconciliation timestamp
if [ -f "CURRENT.md" ]; then
    sed -i "s/\*\*Last Reconciled:\*\*.*/\*\*Last Reconciled:\*\* ${TIMESTAMP} /" CURRENT.md
fi

# 5. Stage changes
git add .

# 6. Check if there are changes to commit
if git diff --staged --quiet; then
    echo "No unstaged or uncommitted changes detected. Workspace is clean."
else
    echo "Staged changes detected. Creating commit..."
    git commit -m "${COMMIT_MSG}"
    echo "Commit created successfully."
fi

# 7. Check for remote 'origin' and push if configured
if git remote | grep -q "^origin$"; then
    CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
    echo "Pushing changes to remote 'origin/${CURRENT_BRANCH}'..."
    git push origin "${CURRENT_BRANCH}"
    echo "Push completed successfully."
else
    echo "[NOTICE] No remote 'origin' configured yet. Local commit preserved."
fi

echo "======================================================================"
echo "SESSION SYNCHRONIZATION COMPLETE"
echo "======================================================================"
