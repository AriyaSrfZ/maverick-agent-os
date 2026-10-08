# Dual-Device Bridge & Local Harness Integration Blueprint
<!-- Maverick OS Architecture: Work PC <-> Home PC Synchronization -->

## 1. The Token Conservation Reality
- **Current State:** Antigravity token allowance is at 24% on Day 1 of the 5-day cycle.
- **Rule of Engagement:** Antigravity serves strictly as the High-Level Systems Architect (planning, architectural validation, high-stakes verification). 
- **Execution Offloading:** Heavy drafting, code iteration, and script generation must be shifted immediately to Codex, Claude Code, and local GGUF models via OmniRoute to stop cloud token erosion.

---

## 2. Bridging Work PC and Home PC (Censorship & NAT Resilient)

Since WireGuard profiles are constrained and direct IP connections across Iranian ISPs are frequently throttled, rely on a two-tier architecture:

### Tier 1: Asynchronous State Bridge (Git — Zero Latency, 100% Reliable)
Both machines synchronize state via the private GitHub repository (`git@github.com:AriyaSrfZ/maverick-agent-os.git`).
- **Before leaving Work PC:** Run `bash scripts/session_sync.sh` (or `git push`).
- **When sitting at Home PC:** Run `git pull origin master`.
- **What is synced:** `CURRENT.md` (live state), `memory.md` (architectural ledger), `youtube-ops/backlog/` (scripts & audio), and all workspace configurations.

### Tier 2: Real-Time API Tunneling (Cloudflare Tunnel / OmniRoute)
If Home PC needs to call Work PC's OmniRoute daemon directly (or vice versa):
1. **Free Cloudflare Tunnel (No Public IP / No Port Forwarding required):**
   ```bash
   # Install cloudflared on the host machine
   curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflare-utils/releases/latest/download/cloudflared-linux-amd64.deb
   sudo dpkg -i cloudflared.deb

   # Expose local OmniRoute port 20128 through an ephemeral encrypted tunnel:
   cloudflared tunnel --url http://localhost:20128
   ```
2. Cloudflare will print an encrypted tunnel URL (e.g., `https://random-words.trycloudflare.com`).
3. Set that URL as the `OPENAI_BASE_URL` on the other machine.

---

## 3. Configuring Codex CLI with OmniRoute

Codex connects directly to OmniRoute as an OpenAI-compatible provider:

### Step 1: Environment Variables
Add to `~/.bashrc` or `~/.zshrc`:
```bash
export OPENAI_BASE_URL="http://localhost:20128/v1"
export OPENAI_API_KEY="omniroute-local-token"
```

### Step 2: Codex Configuration (`~/.codex/config.toml`)
```toml
default_model = "omniroute/auto"

[profiles.local]
base_url = "http://localhost:20128/v1"
model = "ollama/qwen2.5-14b"
api_key = "omniroute-local-token"

[profiles.fast]
base_url = "http://localhost:20128/v1"
model = "omniroute/fast"
api_key = "omniroute-local-token"
```

---

## 4. Configuring Claude Code with OmniRoute

Claude Code uses Anthropic-compatible endpoints. OmniRoute translates Anthropic schemas directly to local or cloud models:

```bash
export ANTHROPIC_BASE_URL="http://localhost:20128/v1"
export ANTHROPIC_API_KEY="omniroute-local-token"
```
Run `claude` in your terminal. All requests flow through OmniRoute, applying token compression (RTK/Caveman) and routing to local Ollama models when offline.

---

## 5. Ingesting Gemini Chat Memories

To bring existing memory dumps into the unified system:
1. Export or copy text from Gemini Chat into:
   `docs/imported-memories/gemini_history_raw.md`
2. Run our local parser to distill key technical insights directly into `memory.md` without consuming Antigravity tokens.
