# Supercharging Agents with MCPs and Connectors
## Complete Engineering Specification for Model Context Protocol & Native Tool Integrations

> "Plain Claude is powerful. Claude with the right MCP connectors is a completely different animal. It can run deep research, read any website, drive a browser, and plug into hundreds of your apps." — Maverick Maltin

---

## 1. The 4 Essential MCPs (Model Context Protocol)

Maverick identifies four cornerstone MCP servers that transform a text-only LLM into an autonomous execution engine:

### 1. Playwright MCP (Browser Automation & Visual Verification)
* **Purpose:** Drives headless and headful Chromium/Firefox/WebKit browsers. Enables clicking, filling forms, taking screenshots, evaluating DOM elements, and operating internal dashboards without public APIs.
* **Why it matters:** Crucial for web testing, automated form submission, and interacting with platforms that lack open REST endpoints (e.g. LinkedIn, YouTube Studio, local SPAs).
* **Installation:**
  ```bash
  # In Claude Code / Antigravity terminal:
  claude mcp add playwright npx @playwright/mcp@latest
  ```
* **Production Caveat:** Running naive Playwright instances will be flagged by modern bot-detection (Cloudflare Turnstile, DataDome, LinkedIn security). In production, connect Playwright over CDP to a running persistent Chrome instance (`http://127.0.0.1:9222`) rather than launching cold browser instances.

---

### 2. Firecrawl MCP (Clean Markdown Web Extraction)
* **Purpose:** Bypasses JavaScript-heavy hydration, paywalls, and messy HTML clutter to return clean, LLM-optimized Markdown directly from any public URL.
* **Why it matters:** Passing raw HTML into an LLM wastes thousands of tokens on CSS, scripts, and navigation menus. Firecrawl extracts only the semantic text, headings, and tables.
* **Installation (Native Connector or MCP):**
  - **Native:** Accessible via Claude Connector directory (`claude.ai/directory/connectors/firecrawl`).
  - **Custom MCP:**
    ```bash
    claude mcp add --transport http firecrawl https://mcp.firecrawl.dev/v2/mcp --header "Authorization: Bearer <FIRECRAWL_API_KEY>"
    ```
* **Test Prompt:**
  ```text
  "Use Firecrawl to pull the pricing and feature comparison from these 3 competitor landing pages into a Markdown table."
  ```

---

### 3. Composio MCP (The Unified Multi-App Gateway)
* **Purpose:** A single gateway connecting an LLM to 1,000+ software services (Gmail, Slack, GitHub, Jira, Notion, HubSpot, Salesforce, Linear) using managed OAuth.
* **Why it matters:** Eliminates the need to build individual custom API clients for common SaaS tools.
* **Installation:**
  - Added via custom connector URL: `https://connect.composio.dev/mcp`
* **Critical Engineering Warning (The Token Bloat Hazard):**
  - Maverick highlights that Composio can connect to hundreds of apps simultaneously.
  - **However, in agent harnesses**, registering hundreds of tools loads excessive JSON tool schemas into every prompt, consuming 15,000+ context tokens before any conversation begins and causing the LLM to hallucinate or call the wrong tool.
  - **Best Practice:** Authorize only 2 to 4 active apps (e.g., Slack + Google Calendar) per session.

---

### 4. Perplexity MCP (Deep Real-Time Search & Source Verification)
* **Purpose:** Connects the LLM directly to Perplexity's online search engine for real-time fact retrieval with verifiable citations.
* **Why it matters:** Fixes model hallucination for current events, fresh documentation, market pricing, and API updates.
* **Installation:**
  ```bash
  claude mcp add --transport http perplexity https://api.perplexity.ai/mcp --header "Authorization: Bearer <PERPLEXITY_API_KEY>"
  ```
* **Test Prompt:**
  ```text
  "Use Perplexity to research the latest changes in the EU AI Act enforcement for Q3 2026, cite official regulatory sources, and format as bullet points."
  ```

---

## 2. The "One Prompt" Automated Setup

To configure all four tools in a single command turn in Claude Code:

```text
Set up these 4 MCP servers for me. Run everything yourself and only ask me when you need something:
1. Playwright - npx @playwright/mcp@latest (free)
2. Composio - https://connect.composio.dev/mcp (I'll sign in when you tell me to)
3. Firecrawl - https://mcp.firecrawl.dev/v2/mcp (ask me for my free API key from firecrawl.dev)
4. Perplexity - https://api.perplexity.ai/mcp (paid key from perplexity.ai - ask if I want it or want to skip it)
Confirm each one is connected before moving to the next, then give me a test prompt for each.
```

---

## 3. Native Connectors vs. MCP Comparison

| Dimension | Native Connectors (Claude Directory) | Model Context Protocol (MCP) |
|---|---|---|
| **Setup Friction** | Zero-code (Click "Connect" + OAuth login) | Command-line or JSON configuration |
| **Hosting** | Hosted entirely in Anthropic Cloud | Local machine (stdio) or remote HTTPS |
| **Local File Access** | No (restricted to cloud storage) | **Yes** (via local stdio MCP servers) |
| **Custom Code Execution** | Sandbox only | Full local shell execution permissions |
| **API Key Privacy** | Managed by Anthropic OAuth | Direct user API keys stored in local config |

---

## 4. Architectural Integration in this Workspace

In this workspace, we avoid bloated external MCP gateways by using:
1. **Local Persistent Playwright over CDP:** Direct automation of Chrome (port 9222) for ban-proof LinkedIn and YouTube operations.
2. **OmniRoute MCP Server:** 110+ high-performance tools covering routing, model fallback, RTK prompt compression, and memory.
3. **Graphify MCP:** Knowledge graph querying and dependency analysis over local codebase ASTs.
