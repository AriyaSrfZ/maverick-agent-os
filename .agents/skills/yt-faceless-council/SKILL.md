---
name: yt-faceless-council
description: "Zero-friction, anti-flag faceless YouTube workflow council based on the One Person Business 2026 algorithm study (Session Time, Channel-as-a-Show, Hybrid Human-AI Commentary, Local Edge-TTS & FFmpeg)."
category: media
risk: safe
tags: "[youtube, faceless, shorts, edge-tts, ffmpeg, anti-flag, compliance, algorithm-2026]"
---

# YouTube Faceless Operations Council (2026 Algorithm & Anti-Flag Engine)

Engineered based on the **"One Person Business" Algorithm Blueprint** ("I Studied 100 Channels To Beat The NEW Algorithm") and YouTube's strict 2025/2026 **Transformative Fair Use / Anti-Reused Content** policies.

---

## 1. Core Algorithm Axioms (The New Paradigm)

1. **Session Time Trumps Subscribers**:
   - Subscriber count is a vanity metric. The algorithm distributes videos based on **Average View Duration (AVD)**, **Relative Retention (RR)**, and whether the viewer stays on YouTube to watch another video (**Session Extension**).
2. **Channel-as-a-Show Architecture**:
   - Treat the channel as a serialized show, not disjointed random uploads.
   - Maintain uniform visual branding: cohesive typography, high-contrast dark color palette (slate/gold/crimson for mysteries), and recognizable frame layout so viewers binge 3–4 videos consecutively.
3. **The Anti-AI-Slop Directive**:
   - Pure automated video generation (stock clips + generic robotic voice) gets crushed by YouTube's classifier.
   - Every video must feature:
     - A distinct point of view / provocative investigative angle.
     - Pacing shifts (fast 3-second hook -> deep evidence drop -> analytical synthesis).
     - Naturalistic neural TTS (`en-US-ChristopherNeural` or `en-US-GuyNeural`) tuned with human pauses.
4. **Optimization for "Ask YouTube" (AI Vector Search)**:
   - Structure descriptions and metadata with clear topical depth. YouTube's conversational AI search rewards content that directly answers obscure, high-curiosity questions.

---

## 2. The 4-Agent Council Framework

| Role | Persona | Key Responsibilities |
| :--- | :--- | :--- |
| **1. SEO & Growth Strategist** | *Audience Architect* | Crafts high-CTR titles using Belief-Validation formulas. Conducts competitor comment-mining to identify high-curiosity gaps. |
| **2. Compliance & Anti-Flag Officer** | *Fair-Use Gatekeeper* | **MANDATORY FILTER.** Enforces the 3-Second Original Hook rule and Hybrid Commentary (35%+ original narration). Prohibits raw clipping to protect YPP monetization eligibility. |
| **3. Script & Voiceover Director** | *Retention Director* | Writes tight 35–50s Short scripts or 8–12m long-form scripts structured around curiosity gaps. Produces lifelike audio via local `edge-tts`. |
| **4. Low-Friction DevOps Executor** | *Local Pipeline Engineer* | Runs 100% local, free CLI commands (`ffmpeg`, `edge-tts`, Playwright with local proxy). Zero paid SaaS, zero fragile cloud wrappers. |

---

## 3. Proven Hook & Title Frameworks

- **The Belief-Validation Hook**: Validate an intuition the viewer secretly suspects:  
  *Example:* *"Why mainstream archaeology refused to measure this 1,200-ton quarry stone."*
- **The Contrast Paradox**:  
  *Example:* *"Modern cranes can't lift this. How did bronze-age builders move it 50 miles?"*
- **The Suppressed Archive**:  
  *Example:* *"The 1924 excavation report that disappeared from university libraries."*

---

## 4. Technical Execution Toolkit (Local & Free)

- **Voice Synthesis (Edge-TTS)**:
  ```bash
  ~/.local/bin/edge-tts --voice en-US-ChristopherNeural --text "..." --write-media voice.mp3
  ```
- **Vertical Formatting & Audio Muxing (FFmpeg)**:
  ```bash
  ~/.local/bin/ffmpeg -i source.mp4 -i voice.mp3 -filter_complex "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[v]" -map "[v]" -map 1:a -c:v libx264 -c:a aac -shortest final_short.mp4
  ```
- **Browser Automation**:
  `node open_youtube_session.js` (Playwright with proxy `127.0.0.1:7897` on debugging port 9223).
