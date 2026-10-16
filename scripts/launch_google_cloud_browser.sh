#!/usr/bin/env bash
# launch_google_cloud_browser.sh: Opens an isolated clean Google Chrome session
# routed exclusively through the verified Stockholm fixed IP (109.120.131.224)

/home/aria/Downloads/CV/scripts/run_stockholm_proxy.sh start

mkdir -p /tmp/chrome_stockholm_profile

echo "Launching Google Chrome routed via 109.120.131.224..."
google-chrome \
  --proxy-server="socks5://127.0.0.1:19808" \
  --user-data-dir="/tmp/chrome_stockholm_profile" \
  --no-first-run \
  --no-default-browser-check \
  "https://api.ipify.org" \
  "https://cloud.google.com/free" \
  "https://policies.google.com/country-association-form" >/dev/null 2>&1 &

echo "Chrome launched. Tab 1 verifies IP 109.120.131.224; Tab 2 opens Google Cloud $300 Credit signup; Tab 3 opens Country Association form."
