# Maverick AI (MavGPT) Complete Intelligence & Guide Catalog
## Comprehensive Analysis: The Doable vs. Unachievable Matrix for Modern Agent Harnesses

> **Context:** Maverick Maltin ([mavgpt.ai](https://mavgpt.ai)) has built one of the most widely followed AI educational repositories (3M+ followers, 250K+ subscribers). His material spans prompt formulas, local file system operating structures, MCP tool installations, workflow automations, and privacy lockdowns.
> 
> This document audits and captures **every major guide and framework** from his repository, evaluating each with engineering rigor: what is genuinely **DOABLE** with modern agent harnesses (Claude Code, Antigravity, OpenCode, Codex, Gemini CLI), and what is **UNACHIEVABLE** (marketing simplification, statistical impossibility, or theoretical hype).

---

## Executive Summary: The "Doable vs. Unachievable" Breakdown

| # | Maverick Guide / System | Practical Feasibility | Doable Aspect (What Actually Works) | Unachievable / Hype Aspect (What Fails / Limits) |
|---|---|:---:|---|---|
| **01** | **Maverick OS File System** | **100% DOABLE** | Plain Markdown files (`AGENTS.md`, `CURRENT.md`, `memory.md`, `workspaces/`), structured context, read-save-readback check. Works natively across all CLI harnesses. | None. This is sound software engineering and context management principles applied to LLM prompting. |
| **02** | **10 Must-Have Claude Skills** | **95% DOABLE** | Installing UI/UX Pro Max, Anthropic frontend-design, TDD Guard, Context Engineering, OWASP security into `.claude/skills` or `.agents/skills`. | Claims that skills grant "complete autonomous operation without human oversight"; some skills have overlapping or conflicting instructions if installed simultaneously. |
| **03** | **4 Supercharged MCPs** | **90% DOABLE** | Playwright (browser control), Firecrawl (clean markdown scraping), Composio (OAuth API gateway), Perplexity (cited web search). | Composio's multi-app sprawl creates huge tool-definition token overhead that degrades LLM attention; Playwright sessions can break on aggressive bot-mitigation (Cloudflare/DataDome). |
| **04** | **Remove Claude Watermarks** | **PARTIAL (40% DOABLE / 60% HYPOTHETICAL)** | **Doable:** Layer A (stripping zero-width unicode & bidi characters) and Layer C (stripping C2PA, EXIF, and XMP metadata).<br>**Doable:** Cross-model paraphrasing shifts stylistic cadence. | **Unachievable:** Claiming 100% mathematical undetectability against official internal watermarking keys (EU AI Act token-distribution nudging). The internal secret key detector cannot be bypassed deterministically without severe semantic distortion. |
| **05** | **100 ChatGPT Secret Codes** | **95% DOABLE** | Systemic prompt macros (`/human`, `TLDR`, `SCAMPER`, `OODA`, `KILLCRITIC`, `NEXTSTEP`) that force specific LLM attention heads and output formats. | They are prompt instructions, not hardcoded OpenAI system commands; older or small models can ignore them if context is crowded. |
| **06** | **The $200/Day Prompt Chain** | **70% DOABLE** | 4-step Socratic progression (Offer -> Competitor Blueprint -> 7-Day Action Plan -> 48h Constraint Coaching). Eliminates generic AI advice. | Push-button income generation. AI provides market clarity and tactical roadmaps, but client acquisition still requires real outbound outreach, trust, and verified delivery. |
| **07** | **Claude Connectors (11 Native)** | **85% DOABLE** | Native integration with Google Drive, Notion, Slack, Gmail, Zoom, Canva via Claude Pro/Team UI. | Lacks fine-grained permission control; read operations work well, write/action operations frequently trigger validation errors or require tedious multi-step manual confirmation. |
| **08** | **AI Job Seeker & Auto-Apply** | **40% DOABLE / 60% UNFEASIBLE** | Resume optimization, tailored cover letter drafting, interview simulation, reverse-matching job descriptions against skills. | "Auto-apply to 20 jobs with one prompt" fails in production: CAPTCHAs, ATS bot-blockers, multi-factor logins, and inconsistent form schemas cause fragile automated browser scripts to crash. |
| **09** | **ChatGPT Privacy Lockdown** | **100% DOABLE** | Disabling "Improve the model for everyone" toggle, wiping chat history, using temporary chats, inspecting memory bank for hallucinations. | Local privacy vs Cloud AI: Your data is still transmitted over TLS to OpenAI/Anthropic servers; "private mode" means retention exemptions, not zero-knowledge local encryption. |
| **10** | **Find Unclaimed Money with AI** | **50% DOABLE** | Generating search checklists, drafting state claim letters, locating official state unclaimed property registries (e.g., NAUPA / missingmoney.com). | "Claude finds the money and does the paperwork for free": Claude cannot query state databases requiring official SSN/TIN authentication or bypass manual notarization requirements. |

---

## Detailed Guide Audits: Specifications, Prompts & Harness Mechanics

### 1. Maverick OS File System
* **Concept:** A persistent, localized Markdown-based memory architecture housed in a dedicated workspace folder. Rather than relying on volatile chat memory or proprietary cloud storage, the system structures information into clear, verifiable text files:
  - `START-HERE.md`: The entry point for any human or agent.
  - `AGENTS.md`: Universal operating rulebook (< 200 lines) with source precedence and non-negotiables.
  - `CLAUDE.md`: Harness adapter pointing to `AGENTS.md` and active priorities.
  - `CURRENT.md`: Live status, active objectives, and immediate next actions.
  - `memory.md`: Dated historical ledger of architectural and operational decisions.
  - `workspaces/<domain>/`: Modular domain isolation (`guide.md`, `CURRENT.md`, `memory.md`, `resources/`, `outputs/`).
* **The "Doable" Reality:**
  - Highly robust. Because it relies on standard POSIX filesystem reads and writes, it works identically in Claude Code, Antigravity, OpenCode, Codex, or raw terminal shell scripts.
  - Solves context drift: Agents read only the relevant domain files rather than loading hundreds of thousands of irrelevant tokens.
  - Read-Save-Readback verification ensures that state changes are committed to disk before a turn concludes.
* **The "Unachievable" Reality:**
  - None. This is architectural discipline, not model-dependent magic.

---

### 2. 10 Must-Have Claude Skills
* **The 10 Curated Skills:**
  1. `ui-ux-pro-max`: Design intelligence engine (50+ styles, 97 palettes, 57 font pairings).
  2. `blader/humanizer`: Strips 24 AI writing patterns (em dashes, promotional vocabulary, trite triads).
  3. `frontend-design` (Anthropic): Production-grade interface standards, bold styling, anti-template CSS.
  4. `claude-seo`: 19 sub-skills covering technical SEO, E-E-A-T audits, and GEO/AEO optimization.
  5. `marketingskills` (Corey Haines): Direct-response copywriting, CRO, email nurture funnels.
  6. `owasp-security`: OWASP Top 10:2025, ASVS 5.0, agentic security checklists.
  7. `tdd-guard`: Strict Red-Green-Refactor test cycle enforcement.
  8. `context-engineering-kit`: Compaction, caching, masking, and memory degradation guards.
  9. `claude-scientific-skills`: 136 data analysis, statistical modeling, and visualization skills.
  10. `claude-mem`: Cross-session memory persistence via automated AI session summaries.
* **The "Doable" Reality:**
  - All 10 skills follow the open `SKILL.md` format supported by Claude Code and Antigravity.
  - They can be placed directly in `.claude/skills/` or `.agents/skills/` to provide specialized domain intelligence on demand.
* **The "Unachievable" Reality:**
  - Loading too many skills simultaneously blows past prompt cache budgets and causes model confusion. Skills must be invoked modularly or filtered via tools like OmniRoute/RTK.

---

### 3. The 4 Supercharged MCPs
* **The Selected 4:**
  1. `Playwright` (`npx @playwright/mcp@latest`): Local browser automation over CDP.
  2. `Firecrawl` (`https://mcp.firecrawl.dev/v2/mcp`): LLM-optimized web scraping and markdown conversion.
  3. `Composio` (`https://connect.composio.dev/mcp`): Unified OAuth gateway to 1,000+ business APIs.
  4. `Perplexity` (`https://api.perplexity.ai/mcp`): Real-time web research engine with source citations.
* **The "Doable" Reality:**
  - Playwright and Firecrawl provide indispensable capabilities that plain LLM chat cannot touch: live DOM interaction, screenshots, and clean markdown extraction.
  - Perplexity provides fast, referenced retrieval without scraping raw HTML.
* **The "Unachievable" Reality:**
  - Composio sounds miraculous ("1,000 apps with one connector"), but passing hundreds of tool schemas into an LLM context drastically increases latency and cost while causing tool-selection hallucination. Connecting 3-5 specific tools directly is far more reliable.
  - Playwright headless browsing is blocked by Cloudflare Turnstile, Akamai, and LinkedIn bot defenses unless running in non-headless mode with a persistent user profile and humanized delays.

---

### 4. Remove Claude Watermarks (EU AI Act & Statistical Steganography)
* **The 3 Layers:**
  - **Layer A (Invisible Unicode):** Zero-width spaces (`\u200B`), zero-width joiners (`\u200D`), byte order marks (`\uFEFF`), and bidirectional override characters.
  - **Layer B (Statistical Watermark):** Token-level probability distribution bias injected by Anthropic (Sonnet 3.7/5.5, Opus 3.5/5.5) using a cryptographic secret pseudo-random seed.
  - **Layer C (File Metadata):** C2PA Content Credentials, EXIF, XMP metadata embedded in PNG, SVG, PDF, and DOCX files.
* **The "Doable" Reality:**
  - **Layer A is 100% solvable:** A simple regex script strips all non-printable Unicode characters instantaneously.
  - **Layer C is 100% solvable:** Running `exiftool -all=`, PyMuPDF sanitizers, or Sharp/Canvas re-renders purges all C2PA and provenance metadata from images and PDFs.
  - **Cross-Model Rewriting:** Passing Claude-generated text through a different model family (e.g. Gemini 3.8 Flash or GPT-4o) with instructions to restructure sentence clauses disrupts statistical token cadence.
* **The "Unachievable" Reality:**
  - **The Myth of 100% Guaranteed Watermark Removal:** Anthropic’s statistical watermark is embedded in the green/red token selection probability distribution. Only Anthropic holds the secret PRNG key. While rewriting alters the sequence, heavy paraphrasing also degrades clarity, voice, and nuances. Claims that any tool "guarantees zero detection" are mathematically untrue.

---

### 5. 100 ChatGPT Secret Codes
* **Structure:** 100 prompt keywords organized across 8 categories:
  - *Writing & Style:* `/human`, `/rewrite`, `/improve`, `/shorten`, `/expand`, `/simplify`.
  - *Thinking Systems:* `DELTR`, `OODA`, `KILLCRITIC`, `LENSSTACK`, `X10THINK`, `HIDDENASSUMPTIONS`, `FRACTAL`, `BLACKSWAN`, `REVERSEENGINEER`.
  - *Analysis & Strategy:* `PROSCONS`, `SWOT`, `RISKMAP`, `SECONDORDER`, `REDTEAM`, `DECIDE`, `PARETO`, `FACTCHECK`.
  - *Output Formats:* `TLDR`, `TABLE`, `CHECKLIST`, `STEPS`, `QUIZME`, `FEYNMAN`.
* **The "Doable" Reality:**
  - These prompt keywords act as concise system directives that activate latent reasoning personas and structured output formats.
  - Combining codes (e.g., `HIDDENASSUMPTIONS + NEXTSTEP` or `REDTEAM + PARETO`) forces rigorous multi-perspective evaluation.
* **The "Unachievable" Reality:**
  - They are not magic firmware commands or API-level toggles; they are semantic prompt instructions. If provided without sufficient context or in an overloaded prompt, the LLM will fall back to default behavior.

---

### 6. The $200/Day Prompt Chain
* **The 4-Step Chain:**
  1. *Prompt 1 (Offer & Channel):* Enforces a single offer and single channel based on user skills, rejecting generic lists.
  2. *Prompt 2 (Reverse-Engineering Blueprint):* Identifies an existing operator successfully running that exact model and breaks down their client acquisition, pricing, and delivery mechanics.
  3. *Prompt 3 (7-Day Action Plan under $100):* Converts the blueprint into a 7-day tactical checklist requiring zero paid software or overhead.
  4. *Prompt 4 (Socratic Block Coaching):* Diagnoses the user's specific hesitation (imposter syndrome, pricing fear, tech overwhelm) and prescribes an immediate 48-hour proving test.
* **The "Doable" Reality:**
  - Exceptionally effective for strategic clarity. Banning multi-option answers and enforcing the < $100 constraint forces LLMs away from corporate fluff toward tactical execution.
* **The "Unachievable" Reality:**
  - The chain creates the roadmap, but human outreach, sales conversation handling, and actual contract closure must still be executed. AI cannot substitute for real market feedback.

---

### 7. AI File System & Harness Cross-Compatibility
* **The Challenge:** How to maintain state across different harnesses (Claude Code in CLI, Antigravity in IDE, OpenCode, Codex, Gemini CLI).
* **The Solution:** A unified filesystem root where every harness reads `AGENTS.md` and `CURRENT.md` on startup, writes updates to `memory.md`, and runs an automated session sync script to push state changes to a centralized GitHub repository.
