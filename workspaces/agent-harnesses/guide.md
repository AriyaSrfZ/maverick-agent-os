# Multi-Agent Harnesses & Skills — Domain Guide

## 1. Domain Objective
Maintain seamless compatibility, tool discovery, and memory sync across Claude Code, Antigravity, OpenCode, Codex, and Gemini CLI.

## 2. Infrastructure Components
- `.agents/skills/`: Unified skill library with 60+ specialized skills (OmniRoute, OMC, Drydock, Ponytail, UI/UX Pro Max, Framer Motion).
- `graphify-out/`: Knowledge graph generated from codebase ASTs, providing queryable subgraphs for architecture questions.
- `scripts/session_sync.sh`: Git synchronization engine that keeps all harnesses updated to the same commit.

## 3. Cross-Harness Invariants
- `AGENTS.md` is the universal parent rulebook.
- `CLAUDE.md` and `.cursorrules` point to `AGENTS.md`.
- No harness may overwrite shared files without a read-and-verify check.
