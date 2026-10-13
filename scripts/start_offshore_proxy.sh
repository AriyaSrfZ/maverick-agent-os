#!/usr/bin/env bash
# Maverick OS: Start local proxy bridge to offshore VPS
PID_FILE="/tmp/maverick_singbox.pid"

if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    echo "Offshore proxy bridge is already running on port 20808 (PID: $(cat "$PID_FILE"))."
    exit 0
fi

nohup sing-box run -c /home/aria/Downloads/CV/configs/maverick_offshore_singbox.json > /tmp/singbox_proxy.log 2>&1 &
echo $! > "$PID_FILE"
sleep 1

if kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    echo "Offshore proxy bridge started successfully on 127.0.0.1:20808 (PID: $(cat "$PID_FILE"))."
else
    echo "Failed to start offshore proxy bridge. Check /tmp/singbox_proxy.log"
    exit 1
fi
