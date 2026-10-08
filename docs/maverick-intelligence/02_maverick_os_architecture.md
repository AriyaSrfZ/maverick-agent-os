# Maverick OS: Universal File System & Memory Architecture
## Persistent, Portable Local Operating System for AI Agent Harnesses

> "You do not need a more complicated prompt every time you open AI. You need a place for the useful information to live. One folder, readable text files, and an assistant that starts with your context." — Maverick Maltin

---

## 1. Architectural Philosophy

Traditional AI interactions suffer from **State Amnesia**:
1. Every new chat session starts from zero context.
2. Built-in cloud memory features (e.g. ChatGPT Memory, Claude Projects) are opaque, vendor-locked, non-portable, and prone to hallucinations.
3. Multiple coding harnesses (Claude Code, Antigravity, Codex, OpenCode) cannot communicate or share working state.

**Maverick OS** solves this by establishing a **Local Markdown File System**:
- All operating rules, active priorities, domain knowledge, and work logs live in standard, human-readable `.md` files.
- Any agent harness connected to the workspace reads the same canonical state on initialization.
- Every completed task concludes with a mandatory **Save-and-Verify** disk write, guaranteeing that state compounds across sessions.

---

## 2. Directory Hierarchy

```text
<Workspace-Root>/
├── START-HERE.md            # Entry point for human operator and agent harnesses
├── AGENTS.md                # Universal operating rulebook (< 200 lines, source of truth)
├── CLAUDE.md                # Harness adapter for Claude Code (imports AGENTS.md)
├── CURRENT.md               # Reconciled live state, active objectives, immediate next steps
├── memory.md                # Cross-domain historical ledger of key architectural decisions
├── docs/                    # Deep reference documentation and analytical guides
│   └── maverick-intelligence/
├── workspaces/              # Modular task domains (isolated context)
│   ├── linkedin-engine/     # LinkedIn connection, outreach, comment sniper, and carousels
│   │   ├── guide.md         # Domain runbook and execution rules
│   │   ├── CURRENT.md       # Live automation status and pending tasks
│   │   ├── memory.md        # Work log and engagement metrics
│   │   ├── resources/       # Copy templates, voice guides, connection lists
│   │   └── outputs/         # Generated carousels (PDF), drafted posts, logs
│   ├── youtube-ops/         # YouTube Faceless Council & Studio automation
│   │   ├── guide.md         # Video production and upload runbook
│   │   ├── CURRENT.md       # Episode schedule and upload queue
│   │   ├── memory.md        # Published logs and view tracking
│   │   ├── resources/       # Visual prompts, audio files, narrative hooks
│   │   └── outputs/         # Rendered shorts, master video files
│   ├── agent-harnesses/     # Multi-agent tools, OmniRoute, MCPs, and skills
│   │   ├── guide.md         # Harness installation and interoperability guide
│   │   ├── CURRENT.md       # Active skills matrix and MCP status
│   │   └── memory.md        # Config changes and performance metrics
│   └── maverick-intelligence/ # Maverick guides, prompt libraries, and de-slopping tools
└── scripts/                 # Executable automation runners and sync utilities
    ├── session_sync.sh      # Automated Git commit and push scheduler
    └── sanitize_text_and_media.py # De-watermarking, metadata stripping & slop cleaner
```

---

## 3. The Canonical File Definitions

### A. `AGENTS.md` (The Universal Rulebook)
- Must remain concise (< 200 lines).
- Specifies **Source Precedence**: Explicit user instruction > `CURRENT.md` > Domain `guide.md` > General model knowledge.
- Defines **Hard Safety Boundaries**:
  - Never send outbound messages, publish content, or make purchases without explicit confirmation.
  - Never overwrite files blindly; inspect existing code first.
  - Keep sensitive credentials and personal data out of commit logs and public outputs.
- Defines the **Mandatory Save-at-Completion Rule**.

### B. `CURRENT.md` (The Live Operational Snapshot)
- Single source of truth for the current session.
- Sections:
  1. *Active Priorities:* What is being executed right now.
  2. *Automated Cron & Background Status:* Health of background tasks (e.g. morning cron, rotation).
  3. *Recent Key Outputs:* File paths of newly created artifacts.
  4. *Immediate Next Steps:* What the next agent turn or session must pick up.

### C. `memory.md` (The Chronological Ledger)
- Appends dated bullet points for meaningful architectural milestones, design choices, or strategic corrections.
- Never overwritten; only appended to.

### D. `CLAUDE.md` (Harness Adapter)
- Specifically formatted for Anthropic's Claude Code CLI.
- Instructs Claude Code to read `AGENTS.md` and `CURRENT.md` upon every invocation.

---

## 4. The Mandatory Save-at-Completion Rule

Every agent operating within Maverick OS must adhere to this standing instruction:

```markdown
### Standing Operating Instruction: Save & Verify
1. Before declaring any task complete or returning your final response:
   - Check if any decision, architectural shift, or code artifact was created.
   - Update `CURRENT.md` with the new status and output file paths.
   - Append a dated 1-line summary to `memory.md` (or the domain's `memory.md`).
2. Read back the updated files from disk to verify the write operation succeeded.
3. If interrupted or leaving work incomplete, write a `_session-handoff.md` with:
   - Exactly what was done.
   - Exactly what remains.
   - The single next command to run.
```

---

## 5. Cross-Harness Interoperability Matrix

| Harness | Primary Entrypoint | Configuration / Startup Command | State Persistence Method |
|---|---|---|---|
| **Claude Code** | Terminal CLI | Reads `CLAUDE.md` automatically in root | Reads/writes root `.md` files; git commits |
| **Google Antigravity** | Agent IDE / App | Reads `AGENTS.md` + System Prompt | Artifacts directory + workspace disk tools |
| **OpenCode / Codex** | Terminal CLI | Reads `AGENTS.md` or `config.toml` profile | Direct local filesystem access |
| **Cursor / Windsurf** | IDE / Rules | `.cursorrules` / `.windsurfrules` pointing to `AGENTS.md` | Workspace context indexing |
| **Gemini CLI** | Terminal CLI | System instruction referencing `START-HERE.md` | Local disk tool execution |
