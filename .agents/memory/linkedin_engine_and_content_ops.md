---
type: project
title: LinkedIn Engine and Content Operations
created: 2026-10-16
tags: [linkedin, automation, content, carousel, cdp, outreach]
---

# LinkedIn Engine and Content Operations

## Engine Architecture
- **Persistent Session:** Native Playwright CDP running on port 9222 with dedicated user data directory (`/home/aria/.config/linkedin-browser-profile`) and event-loop keep-alive.
- **Display Configuration:** `DISPLAY=:0` on X11 / Wayland for stable headless or windowed rendering without crash on session detach.

## Quality Standards and Detection Thresholds
- **AI Fingerprint Audit:** All public drafts, comments, and connection notes must pass `scripts/sanitize_text_and_media.py` and score 70 or higher on `detect.py`.
- **Stylistic Bans:** Zero em dashes, zero formulaic openers ("Spot on", "Great post"), zero corporate jargon ("synergy", "delve", "robust"), and zero narcissistic resume cliches.
- **Humanized Voice:** Peer-to-peer operator tone, short sentences, technical depth, and direct assertions.

## Autonomous Cadence and Scripts
- **Morning Automation:** `run_morning_automation.js` at 08:00 AM daily with dynamic post queueing and deduplication against `Linkdin files/published_posts.json`.
- **Feed Rotation:** `run_rotation_automation.js` running every 3 hours (`0 */3 * * *`) for targeted peer comments.
- **Carousel Generation:** Automated 8-slide 1080x1350 technical PDF Document Posts generated via Playwright Chrome.

## Outbound Outreach Guardrail
- **No Visa Sponsorship Requests:** Never ask for or mention visa sponsorship in connection notes, messages, or strategy documents. Ariya executes independent self-sponsored relocation.
