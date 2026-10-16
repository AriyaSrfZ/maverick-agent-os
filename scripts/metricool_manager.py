#!/usr/bin/env python3
"""
metricool_manager.py
Command-Line & Agent Interface for Metricool MCP Server.
Provides autonomous scheduling, best-time discovery, and analytics auditing across:
- YouTube (Forbidden Genesis / Multi-genre)
- Instagram Reels (ariya.sarrafzadeh)
- TikTok (ariyasarrafzadeh)
- Threads & Facebook
- Pinterest (Architecture Blueprints & System Cheatsheets)
- Reddit (Technical Discussion & Rep Grinder Pipeline)
"""

import sys
import json
import subprocess
from datetime import datetime, timedelta

MCP_CMD = ["npx", "-y", "mcp-remote", "https://ai.metricool.com/mcp"]

def call_mcp_tool(tool_name, arguments=None):
    """Executes a JSON-RPC tool call against the authenticated Metricool MCP server."""
    if arguments is None:
        arguments = {}
        
    p = subprocess.Popen(MCP_CMD, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    
    # 1. Initialize
    init_req = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "maverick-agent", "version": "1.0"}
        }
    }
    p.stdin.write(json.dumps(init_req) + "\n")
    p.stdin.flush()
    p.stdout.readline() # init response
    
    # 2. Notification
    p.stdin.write(json.dumps({"jsonrpc": "2.0", "method": "notifications/initialized", "params": {}}) + "\n")
    p.stdin.flush()
    
    # 3. Call Tool
    call_req = {
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/call",
        "params": {
            "name": tool_name,
            "arguments": arguments
        }
    }
    p.stdin.write(json.dumps(call_req) + "\n")
    p.stdin.flush()
    
    resp_line = p.stdout.readline()
    p.terminate()
    
    try:
        data = json.loads(resp_line)
        content = data.get("result", {}).get("content", [])
        if content and content[0].get("type") == "text":
            return json.loads(content[0]["text"])
        return data.get("result")
    except Exception as e:
        return {"error": str(e), "raw": resp_line}

def get_status():
    """Retrieves brand profile and connected networks."""
    res = call_mcp_tool("getBrandSettings")
    if "data" in res and res["data"]:
        brand = res["data"][0]
        print("=======================================================")
        print(f"METRICOOL BRAND: {brand.get('label')} (ID: {brand.get('id')})")
        print(f"Timezone: {brand.get('timezone')}")
        print("Connected Channels:")
        networks = brand.get("networksData", {})
        for k, v in networks.items():
            print(f"  * {k.replace('Data', '').upper()}: {v}")
        print("=======================================================")
        return brand
    else:
        print("Failed to retrieve brand status:", res)
        return None

def get_best_hours(network="youtube"):
    """Queries optimal posting times for a specific network."""
    brand = get_status()
    if not brand:
        return
    brand_id = str(brand.get("id"))
    tz = brand.get("timezone", "Asia/Tehran")
    now = datetime.now()
    from_date = now.strftime("%Y-%m-%dT00:00:00+03:30")
    to_date = (now + timedelta(days=6)).strftime("%Y-%m-%dT23:59:59+03:30")
    args = {
        "brandId": brand_id,
        "socialNetwork": network.lower(),
        "fromDate": from_date,
        "toDate": to_date,
        "timezone": tz
    }
    print(f"\nQuerying optimal posting windows for {network.upper()} ({from_date} to {to_date})...")
    res = call_mcp_tool("getBestTimeToPostByNetwork", args)
    print(json.dumps(res, indent=2))

def get_scheduled():
    """Lists scheduled posts."""
    brand = get_status()
    if not brand:
        return
    brand_id = str(brand.get("id"))
    tz = brand.get("timezone", "Asia/Tehran")
    now = datetime.now()
    from_date = now.strftime("%Y-%m-%dT00:00:00+03:30")
    to_date = (now + timedelta(days=7)).strftime("%Y-%m-%dT23:59:59+03:30")
    args = {
        "brandId": brand_id,
        "fromDate": from_date,
        "toDate": to_date,
        "timezone": tz
    }
    print(f"\nRetrieving scheduled posts for brand {brand_id}...")
    res = call_mcp_tool("getScheduledPosts", args)
    print(json.dumps(res, indent=2))

def main():
    if len(sys.argv) < 2:
        print("Usage: metricool_manager.py [status | best-hours <network> | scheduled]")
        sys.exit(1)
        
    cmd = sys.argv[1].lower()
    if cmd == "status":
        get_status()
    elif cmd in ("best-hours", "hours"):
        net = sys.argv[2] if len(sys.argv) > 2 else "youtube"
        get_best_hours(net)
    elif cmd in ("scheduled", "posts"):
        get_scheduled()
    else:
        print(f"Unknown command: {cmd}")

if __name__ == "__main__":
    main()
