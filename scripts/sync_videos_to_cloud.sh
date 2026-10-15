#!/usr/bin/env bash
# ==============================================================================
# Maverick OS: Video Cloud Delivery Pipeline
# Automatically deploys master videos to:
#  1. Stockholm High-Speed Screening Room (http://109.120.131.224:8088)
#  2. Google Drive (via rclone remote 'gdrive:')
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
VIDEOS_DIR="${REPO_ROOT}/youtube-ops"
STOCKHOLM_IP="109.120.131.224"

echo "======================================================================"
echo "[$(date --iso-8601=seconds)] INITIATING VIDEO CLOUD DELIVERY"
echo "======================================================================"

# 1. Sync to Stockholm Web Screening Portal (Instant Playback & Download)
echo "[1/2] Syncing master videos to Stockholm web portal (${STOCKHOLM_IP}:8088)..."
ssh -o BatchMode=yes -o ConnectTimeout=5 "root@${STOCKHOLM_IP}" "mkdir -p /root/videos"

scp -o BatchMode=yes -o ConnectTimeout=5 \
    "${VIDEOS_DIR}"/*Master*.mp4 \
    "root@${STOCKHOLM_IP}:/root/videos/"

echo "SUCCESS: Master videos delivered to Stockholm."
echo "Live screening URL: http://${STOCKHOLM_IP}:8088/"

# 2. Sync to Google Drive via rclone
echo ""
echo "[2/2] Checking Google Drive integration (rclone)..."
if rclone listremotes 2>/dev/null | grep -q "^gdrive:"; then
    echo "Uploading master videos to Google Drive folder 'Forbidden_Genesis_Videos'..."
    rclone copy "${VIDEOS_DIR}/" "gdrive:Forbidden_Genesis_Videos/" \
        --include "*Master*.mp4" \
        --progress
    echo "SUCCESS: Uploaded to Google Drive."
else
    echo "NOTICE: 'gdrive' remote is not yet linked in rclone."
    echo "To link Google Drive, run this once in a desktop terminal:"
    echo "  rclone config create gdrive drive scope=drive"
    echo "Chrome will open for one-click authorization."
fi

echo "======================================================================"
echo "DELIVERY PIPELINE COMPLETE"
echo "======================================================================"
