---
type: reference
title: Network Security and DPI Routing
created: 2026-10-16
tags: [network, vpn, vless, reality, proxy, dpi, stockholm]
---

# Network Security and DPI Routing

## Critical Operating Invariant (Non-Negotiable)
- **Do Not Terminate VPN Daemons:** Never kill, terminate, or restart active VPN, proxy, or tunnel daemons (`clash-verge`, `verge-mihomo`, `sing-box`, `wireguard`) from a remote agent session.
- **Consequence:** Killing the active network daemon immediately severs the remote pipeline and locks the agent out.
- **Rule:** All VPN, proxy, and routing adjustments must be written passively to disk for human operator execution.

## Offshore Node Infrastructure
- **Stockholm Cloud VPS:** Dedicated AMD Ryzen node on Aéza (`109.120.131.224`, Ubuntu 24.04, 4GB RAM, NVMe).
- **VLESS Reality Ports:** Port 443 and Port 8443 running Xray with `www.samsung.com` SNI masquerade and client-side TLS fragmentation to bypass Iranian DPI (Irancell/MCI return packet drops).
- **Streaming Portal:** Nginx 1.24 listening on port 80 and port 8088 (`/var/www/videos`) supporting HTTP 206 Partial Content byte streaming for iOS Safari and Android Chrome.

## Local Workstation Routing Topology
- **Primary Daemon:** Background Mihomo daemon (`/usr/local/bin/mihomo -d /etc/mihomo`, port 7890) with DIRECT domestic Iran bypass and European egress via WireGuard-Server-DE (`91.99.125.45`).
- **Encrypted SOCKS5 Tunnel:** Persistent SOCKS5 tunnel (`scripts/run_stockholm_proxy.sh`) listening on `0.0.0.0:19808`.
- **LAN Surface Proxy:** Dedicated systemd service `surface-proxy.service` on `0.0.0.0:19809` routing Surface/Windows PC traffic through Stockholm VPS over LAN, bypassing Iranian DPI WireGuard UDP blocking.
