#!/usr/bin/env bash
# run_stockholm_proxy.sh: Persistent SOCKS5 Proxy to Stockholm VPS (109.120.131.224)
# Bypasses Iranian DPI via encrypted SSH tunnel
# Listens on 0.0.0.0:19808 (accessible to localhost and LAN devices on 192.168.3.64:19808)

PID_FILE="/tmp/stockholm_socks.pid"

stop_tunnel() {
  if [ -f "$PID_FILE" ]; then
    kill "$(cat "$PID_FILE")" 2>/dev/null || true
    rm -f "$PID_FILE"
  fi
  pkill -f "ssh.*19808.*109.120.131.224" 2>/dev/null || true
}

start_tunnel() {
  stop_tunnel
  ssh -g -f -N -D 0.0.0.0:19808 \
    -o ServerAliveInterval=15 \
    -o ServerAliveCountMax=3 \
    -o ExitOnForwardFailure=yes \
    -o StrictHostKeyChecking=accept-new \
    root@109.120.131.224
  
  sleep 1
  SS_PID=$(pgrep -f "ssh.*19808.*109.120.131.224" | head -n 1)
  if [ -n "$SS_PID" ]; then
    echo "$SS_PID" > "$PID_FILE"
    echo "Stockholm SOCKS5 Proxy is LIVE on 0.0.0.0:19808 (PID: $SS_PID)"
    return 0
  else
    echo "ERROR: Failed to establish Stockholm SOCKS5 tunnel." >&2
    return 1
  fi
}

case "$1" in
  start)
    start_tunnel
    ;;
  stop)
    stop_tunnel
    echo "Stockholm SOCKS5 Proxy stopped."
    ;;
  status)
    if ss -tulpn | grep -q ":19808"; then
      echo "Stockholm SOCKS5 Proxy is RUNNING."
      curl -s -m 5 --socks5-hostname 127.0.0.1:19808 https://api.ipify.org && echo " (Verified Stockholm Egress)"
    else
      echo "Stockholm SOCKS5 Proxy is NOT running."
      exit 1
    fi
    ;;
  *)
    start_tunnel
    ;;
esac
