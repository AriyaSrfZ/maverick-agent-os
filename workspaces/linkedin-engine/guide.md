# LinkedIn Autonomous Engine — Domain Guide

## 1. Domain Objective
Run autonomous, ban-proof networking, high-authority thought leadership, and inbound client acquisition on LinkedIn for Ariya Sarrafzadeh.

## 2. Key Scripts & Runners
- `run_morning_automation.js`: Main morning cron runner (08:00 AM daily). Connects to persistent Chrome over CDP (port 9222) and publishes scheduled thought leadership posts.
- `run_rotation_automation.js`: Discovers trending posts, evaluates sentiment, and posts authoritative comments (02:00 AM & 05:00 AM).
- `generate_masterpiece_carousel.js`: Generates high-converting PDF carousels (e.g. `the-midnight-ledger-leak-v3-masterpiece.pdf`).
- `batch_connect_dubai.js`, `batch_connect_proptech.js`, `follow_and_connect_iranian_c_level.js`: Targeted connection invitation senders.
- `execute_connection_followups.js`: Automated follow-up sender for accepted connections.

## 3. Voice & Copy Rules
- Strict adherence to [`Linkdin files/voice.md`](file:///home/aria/Downloads/CV/Linkdin%20files/voice.md).
- Banned words: "delve", "leverage", "robust", "seamless", "game-changer", "synergy".
- All output strings must pass through `scripts/sanitize_text_and_media.py`.
- No outbound message or post may be triggered without explicit human verification.
