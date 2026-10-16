---
type: project
title: Cross-Device and Hardware Grid
created: 2026-10-16
tags: [hardware, grid, sync, workstation, surface, stockholm, telecommunication]
---

# Cross-Device and Hardware Grid

## Three-Node Infrastructure Grid
1. **Primary Workstation (Debian Linux):**
   - Environment: KDE Plasma on X11 / Wayland, Python 3.11+, Node.js v20+.
   - Headless & Persistent Daemons: Persistent Chrome CDP on port 9222 (`/home/aria/.config/linkedin-browser-profile`), user systemd services, automated cron jobs.
   - Purpose: Primary orchestration center, media generation, code development, and network proxy bridging.

2. **Windows Client (Surface / DESKTOP-9CHILR0):**
   - Path: `C:\Projects\maverick-agent-os`.
   - Synchronization: `scripts/session_sync.ps1` for bidirectional Git synchronization.
   - Network Interfaces: SSH bound to `192.168.3.49` for direct access to `smart-db` (`192.168.1.136`) and Samba network share (`Z:\Aria Sarrafzadeh\`).

3. **Offshore Cloud VPS (Stockholm Node):**
   - IP: `109.120.131.224`.
   - Services: VLESS Reality (ports 443, 8443), Nginx media streaming portal (ports 80, 8088), Cloudflare tunnel ingress.
   - Purpose: Zero-DPI European egress, cloud rendering, and mobile video distribution.

## State Synchronization Protocol
- **Cross-Harness Git Sync:** Automated commits and pulls via `scripts/session_sync.sh` and `scripts/session_sync.ps1`.
- **Supported Harnesses:** Antigravity, Claude Code, OpenCode, Codex, Gemini CLI.
- **Rule:** Save-at-Completion protocol strictly enforced before concluding turns.

## Connectivity and Verified Identity Assets
- **US Telephony:** Permanent Tello US Delaware eSIM (Area Code 302) deployed on Samsung Galaxy S23 Ultra with Wi-Fi calling and E911 address in Wilmington, DE (19801).
- **Google Account:** Google AI Pro (5 TB storage) active on `ariasg2002@gmail.com`.
- **Payment Card:** US Virtual Visa card deployed for unblocked international developer services.
