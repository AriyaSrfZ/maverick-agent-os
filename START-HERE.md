# START-HERE.md — Maverick Agent Harness OS
## Autonomous Multi-Harness Operating System & Intelligence Engine

Welcome to the **Maverick Agent Harness OS**, the unified operating environment for **Ariya Sarrafzadeh** (Technical Product Owner & Solutions Architect).

This workspace is engineered to operate seamlessly across all leading agent harnesses:
- **Claude Code** (CLI)
- **Google Antigravity** (IDE / Autonomous Agent)
- **OpenCode & Codex** (Terminal)
- **Cursor / Windsurf** (IDE)
- **Gemini CLI** (CLI)

---

## 1. Quick Orientation Map

| File / Folder | Purpose |
|---|---|
| [`AGENTS.md`](file:///home/aria/Downloads/CV/AGENTS.md) | Universal operating rulebook (< 200 lines). Invariants, safety, and saving rules. |
| [`CLAUDE.md`](file:///home/aria/Downloads/CV/CLAUDE.md) | Adapter for Anthropic Claude Code CLI. |
| [`CURRENT.md`](file:///home/aria/Downloads/CV/CURRENT.md) | Real-time state of the repository, active priorities, cron jobs, and pending work. |
| [`memory.md`](file:///home/aria/Downloads/CV/memory.md) | Historical dated ledger of key architectural and operational decisions. |
| [`docs/maverick-intelligence/`](file:///home/aria/Downloads/CV/docs/maverick-intelligence/) | Master catalog auditing all 36+ Maverick AI guides (Doable vs. Unachievable). |
| [`workspaces/`](file:///home/aria/Downloads/CV/workspaces/) | Domain-isolated workspaces (`linkedin-engine/`, `youtube-ops/`, `agent-harnesses/`, `maverick-intelligence/`). |
| [`scripts/`](file:///home/aria/Downloads/CV/scripts/) | Production automation runners, text/media sanitizers, and session synchronization. |

---

## 2. Core Execution Domains

### Domain 1: LinkedIn Autonomous Acquisition & Authority Engine
* **Location:** [`workspaces/linkedin-engine/`](file:///home/aria/Downloads/CV/workspaces/linkedin-engine/)
* **Capabilities:** 
  - Ban-proof CDP persistent browser automation on port 9222 (`open_linkedin_session.js`).
  - Targeted connection runners for Dubai Proptech, Iranian C-Level executives, and tech leaders.
  - High-converting visual carousel generator (`generate_masterpiece_carousel.js`) producing audit-level PDFs.
  - Automated morning cron (08:00 AM) and feed rotation (02:00/05:00 AM).

### Domain 2: YouTube Faceless Media Council
* **Location:** [`workspaces/youtube-ops/`](file:///home/aria/Downloads/CV/workspaces/youtube-ops/)
* **Capabilities:**
  - Automated YouTube Studio uploads via Playwright over persistent CDP (`youtube-studio-upload` skill).
  - High-retention narrative shorts creation based on Graham Hancock & Alex Hormozi frameworks (`yt-faceless-council`).

### Domain 3: Multi-Agent Harnesses & Skills Matrix
* **Location:** [`workspaces/agent-harnesses/`](file:///home/aria/Downloads/CV/workspaces/agent-harnesses/)
* **Capabilities:**
  - 60+ specialized skills in `.agents/skills/` (OmniRoute, OMC, Drydock, Ponytail, UI/UX Pro Max, Framer Motion).
  - Graphify knowledge graph engine (`graphify-out/`).

### Domain 4: Maverick AI Intelligence Suite
* **Location:** [`docs/maverick-intelligence/`](file:///home/aria/Downloads/CV/docs/maverick-intelligence/)
* **Capabilities:**
  - Master analysis of all Maverick AI guides (Feasibility audit).
  - 100 ChatGPT Secret Codes and cognitive modifiers.
  - $200/Day prompt chain adapted for high-ticket technical product owner advisory.
  - Anti-watermark and AI slop stripping engine (`scripts/sanitize_text_and_media.py`).

---

## 3. Daily Habit: Cross-Harness Workflow

1. **Start any session:**
   Tell the agent:
   ```text
   Read AGENTS.md, CURRENT.md, and the relevant workspace guide. Then help me with: [task description]
   ```
2. **Execute work:**
   The agent operates strictly within the designated domain workspace.
3. **Finish session:**
   The agent saves updates to `CURRENT.md` and `memory.md`, then runs:
   ```bash
   bash scripts/session_sync.sh
   ```
   This commits and pushes state changes to GitHub, ensuring that your other harnesses stay perfectly synchronized.
