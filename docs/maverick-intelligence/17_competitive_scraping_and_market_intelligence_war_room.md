# Competitive Scraping & Market Intelligence War Room
## Turning Commercial Data Gathering into Market Dominance ("Business Wolves" Operating Model)
**Curated For:** Ariya Sarrafzadeh (HaroSS) | Maverick Agent OS  
**Application Scope:** High-Ticket E-Commerce Consulting, Arbitrage Engines, Aggressive Market Penetration  
**Tone & Style:** Spartan, direct, active voice, zero fluff, zero buzzwords, zero em dashes.  

---

## 1. The Realpolitik of Commercial Competition

Relying on organic luck or passive marketing leads to slow commercial death. In high-stakes e-commerce, market share is taken by operators who treat data gathering as tactical reconnaissance.

We build systems for aggressive operators who do not wait for customers to stumble upon them. We build systems for operators who map competitor margins, track inventory exhaustion, and intercept buyer demand before competitors realize what happened.

---

## 2. The 4 Tactical Data Warfare Vectors

### Vector 1: Wholesale & Distressed Inventory Arbitrage
* **Objective:** Find underpriced merchandise across classifieds and secondary marketplaces before other buyers spot them.
* **The Mechanism:**
  * Ingest real-time listing feeds using `tools/divar-listing-ingestor` and `tools/iran_scraper_engine`.
  * Title normalization strips noise (warranties, cosmetic packaging, seller prefixes) to match items against canonical product catalogs.
  * Statistical Anomaly Pipeline calculates running median prices. Any listing posted at > 2σ below median triggers an instant alert via Telegram or webhook.
* **Commercial Value:** Immediate cash generation through buy-low / sell-high arbitrage on high-liquidity electronics, industrial gear, and luxury goods.

### Vector 2: Competitor Stock Depletion & Price Conquesting
* **Objective:** Exploit competitor supply vulnerabilities.
* **The Mechanism:**
  * Asynchronously monitor competitor storefront inventory levels via automated cart probes or API metadata.
  * When a competitor's stock falls below critical thresholds (< 5 units remaining):
    * Trigger dynamic repricing on our/client storefront to capture premium margins.
    * Deploy targeted conquest search keywords capturing customers fleeing the out-of-stock competitor.
* **Commercial Value:** Maximizes revenue during competitor supply chain stockouts.

### Vector 3: Counterfeit Detection & Brand Protection as a High-Ticket Service
* **Objective:** Monetize market cleanliness for brand owners and legal teams.
* **The Mechanism:**
  * Run `iran-scraper` to scan online marketplaces for trademarked brand items.
  * The counterfeit detection module evaluates price outliers, unauthorized seller tax IDs, unverified serial numbers, and suspicious review clusters.
  * Generates an automated, legally admissible evidence package: seller URLs, timestamps, price deltas, and violation logs.
* **Commercial Value:** B2B brand protection retainers ($1,000 to $2,500/month) sold directly to consumer brands and intellectual property legal practices.

### Vector 4: Grey Area Intelligence & Buyer Interception
* **Objective:** Capture buyer demand directly from competitors' public interactions.
* **The Mechanism:**
  * Scrape public comment sections, review dissatisfaction threads, and social inquiries across competitor storefronts.
  * Extract common product complaints (e.g., late shipping, poor packaging, missing accessories).
  * Package alternative offers addressing those exact defects and deliver direct outbound messaging.
* **Commercial Value:** Acquires proven buyers who have already demonstrated willingness to pay.

---

## 3. Tooling Integration within Maverick Agent OS

| Component | Repository Path | Function |
| :--- | :--- | :--- |
| **Marketplace Scraper** | `tools/iran_scraper_engine` | Asynchronous crawler, proxy rotator, dual-currency parser (IRR/IRT/USD), 2σ anomaly detector. |
| **Listing Ingestor** | `tools/divar-listing-ingestor` | Ingests raw marketplace listings, deduplicates multi-posts, normalizes prices. |
| **Agent Skill** | `.agents/skills/ecom-competitive-scraper` | Agentic interface allowing autonomous invocations via CLI or tool calls. |
| **E-Commerce Consulting Playbook** | `docs/maverick-intelligence/15_ecommerce_ai_product_consulting_framework.md` | PRD and delivery templates sold to enterprise clients ($1,500 to $3,500). |
| **Stockholm Portal** | `http://109.120.131.224:8088/` | Live client-facing portal showcasing AI E-Commerce Architecture and Media Screening Room. |

---

## 4. Next Operational Step

1. **Deploy Seed List:** Create `tools/iran_scraper_engine/seeds.txt` containing target competitor category URLs.
2. **Execute Sample Crawl:** Run `python3 -m iran_scraper.cli crawl` to generate the first baseline pricing database.
3. **Offer High-Ticket Audit:** Pitch one e-commerce brand or distributor a free 1-page competitor price discrepancy audit, converting the finding into a $1,500 implementation contract.
