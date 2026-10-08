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

# 1. Update CURRENT.md reconciliation timestamp
if [ -f "CURRENT.md" ]; then
    # Update the timestamp line in CURRENT.md
    sed -i "s/\*\*Last Reconciled:\*\*.*/\*\*Last Reconciled:\*\* ${TIMESTAMP} /" CURRENT.md
fi

# 2. Stage changes
git add .

# 3. Check if there are changes to commit
if git diff --staged --quiet; then
    echo "No unstaged or uncommitted changes detected. Workspace is clean."
else
    echo "Staged changes detected. Creating commit..."
    git commit -m "${COMMIT_MSG}"
    echo "Commit created successfully."
fi

# 4. Check for remote 'origin' and push if configured
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
