---
type: feedback
name: remote_session_vpn_safety
title: Never Kill Active Host VPN or Proxy Daemons in Remote Session
created: 2026-10-14
---

# Never Kill Active Host VPN or Proxy Daemons in Remote Session

## The Constraint
Never kill, terminate, or restart the active host VPN or proxy daemon (Clash Verge, verge-mihomo, WireGuard, sing-box) from within the agent execution loop on a remote workstation.

## Why
1. The human operator connects remotely to this workstation across the network.
2. The agent harness itself relies on the active proxy tunnel for model API requests and outbound connectivity.
3. Terminating the active VPN daemon drops the network interface instantly, severing both the operator's remote connection and the agent's active pipe.

## Required Protocol for VPN and Proxy Changes
1. **Passive Configuration Only:** When updating VPN nodes, write and update the configuration files on disk (YAML/JSON).
2. **Never Execute Process Kills:** Do NOT run `kill`, `pkill`, or restart commands on active proxy processes (`clash-verge`, `mihomo`, `wireguard`).
3. **Hand Over to Operator:** Provide the operator with the single next action to toggle or restart the profile cleanly from their local GUI or when physically present.
