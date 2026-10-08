# CLAUDE.md — Claude Code Harness Adapter

This workspace follows the **Maverick OS Architecture**.

## Immediate Startup Instructions:
1. Always read `AGENTS.md` for operating rules, tone invariants, and safety boundaries.
2. Read `CURRENT.md` to understand active priorities, automated cron status, and recent outputs.
3. Check the relevant domain guide in `workspaces/<domain>/guide.md` before writing domain code.
4. Enforce the **Mandatory Save-at-Completion Rule**:
   - Update `CURRENT.md` and append to `memory.md` upon completing any meaningful task.
   - Run `bash scripts/session_sync.sh` to keep GitHub synchronized across harnesses.
