# Autonomous Faceless Content & Monetization Playbooks
<!-- Ingested from /watch pipeline: Video Extraction and Algorithmic Analysis -->

## Executive Summary
This document codifies the operational mechanics, production pipelines, and algorithmic safeguards extracted from three authoritative video blueprints on AI content creation and multi-platform monetization.

---

## 1. Stickman Animation Pipeline: Persian & Global YouTube Channels
- **Source:** Armin Saneei (`https://youtu.be/ueip8Ocnf6w`)
- **Format:** Stick figure / doodle explainer animation (8 to 12 minutes).
- **Core Value Proposition:** High-RPM historical and cultural storytelling targeting international audiences or diaspora populations without on-camera presence.

### Production Architecture
1. **Research & Scenario Engine:**
   - Uses a 35-page structured master prompt in ChatGPT.
   - Grounded in authoritative historical sources (e.g., Iranianicaonline.org) to prevent shallow AI generation.
   - Example hook analyzed: Ancient Iranian desert ice-making (qanats and yakhchals), blending engineering, survival, and historical intrigue.
2. **Audio Synthesis:**
   - Engine: ElevenLabs v4 (multilingual model).
   - Avoids turbo models to preserve vocal dynamics and eliminate robotic cadence.
   - Consumption profile: Approximately 60 to 70 credits per 8-minute video.
3. **Visual Consistency (Character Anchoring):**
   - Generates an initial master character sheet in ChatGPT / Sunburst or Google Flow (Nono Banana 2 / Pro).
   - Saved and referenced in every subsequent scene prompt as `@signed Image 1`.
   - Eliminates character drift across multi-scene narrative arcs.
4. **Reverse Vision Prompt Engineering:**
   - Generated keyframes are fed back into vision models.
   - The model inspects the visual elements (subjects, structures, lighting) and outputs exact camera motion and character direction prompts for video engines instead of generic camera panning instructions.
5. **Packaging:**
   - Dual-thumbnail generation testing between Google Flow and ChatGPT/Gemini Pro.
   - High-curiosity titles focused on unexpected historical feats.

---

## 2. Meta Content Monetization Program: Original AI Still Photos
- **Source:** Faceless Facebook Creator (`https://youtu.be/2z7ORVBVLzw`)
- **Format:** High-resolution vertical still images (4:5 aspect ratio) on Facebook Pages.
- **Core Value Proposition:** Meta unified in-stream ads, Reels bonuses, and performance pay into the single Content Monetization Program. Static images earn directly from engagement and dwell time.

### Operational Guardrails & Algorithmic Rules
1. **Unoriginal Content Purge:**
   - Meta penalizes scraped content, slight edits, re-uploads, borders, and caption-farming. Over 500,000 accounts penalized since mid-2025.
   - All visual assets must be 100% original AI generations.
2. **Niche Selection Standard:**
   - Single-topic focus per page (Cozy cabins, vintage automobiles, retro technology, microscopic marine life).
   - 0.5-second comprehension rule: The viewer must understand the subject instantly without reading text.
   - Validation criteria: Existing Facebook pages in the niche must command 100,000+ followers.
3. **Prompt Architecture (Anti-Slop):**
   - Bans generic prompts (e.g., "a cozy cabin").
   - Mandates camera angle, atmospheric lighting, time of day, and one narrative human anomaly (e.g., fresh footprints in snow leading to a closed cabin door). The anomaly stops the scroll.
4. **Post-Processing & Aspect Ratio:**
   - Native 4:5 vertical crop to dominate mobile feed screen real estate.
   - Subtle warming and edge contrast adjustment in Canva or basic editors.
5. **The 3-Line Caption Formula:**
   - Line 1: Factual scene context (creates physical grounding).
   - Line 2: Single binary or friction-free question (drives one-word replies).
   - Line 3: Zero hashtags. (Hashtags are ineffective on Facebook and trigger spam flags).
   - Logic: Comments are the highest-weight algorithmic signal.
6. **Execution Cadence:**
   - Exactly 1 post daily at 7:00 PM in the target audience timezone (US, UK, Canada, Australia for maximum RPM).
   - Strict 90-day consistency threshold.
   - Weekly Sunday audit: Compare top 3 posts against bottom 3 posts to isolate visual winning patterns.

---

## 3. High-Throughput Faceless Video Pipeline & Monetization Protection
- **Source:** E'Calm (`https://youtu.be/pQqp7zJZlq8`)
- **Format:** Long-form faceless video automation (History, True Crime, Survival).
- **Core Value Proposition:** Fast-turnaround automated video production with strict fact-checking protocols to prevent algorithmic demonetization.

### Technical & Production Workflow
1. **Channel Setup (Anti-Zero-View Jail):**
   - Mandatory phone verification (`youtube.com/verify`) for intermediate and advanced features.
   - Upload default set to Unlisted for pre-publish processing.
   - Non-Negotiable: Set audience to "No, not made for kids". Marking "made for kids" disables comments, notifications, mini-player, and suppresses general distribution.
   - Enable automatic multi-language dubbing.
2. **Outlier Topic Discovery (vidIQ Engine):**
   - Search high-interest broad categories (History, Survival, True Crime).
   - Filter criteria: Small channels (under 5,000 subscribers), Outlier Score 50+ (or 100x), Views Per Hour (VPH) 50+, minimum 50,000 views.
   - Geographic Arbitrage: Take viral concepts from low-RPM geographies and adapt the script to tier-1 locations (e.g., changing "Homeless Survival in India" to "Homeless Survival in US/UK") to capture 10x higher AdSense RPM.
3. **Scripting & Demonetization Defense:**
   - Storytelling script generation via Claude.
   - Mandatory AI Fact-Check Gate: Claude runs a claim-by-claim audit (identifying true, false, and unverifiable statements).
   - Critical insight: YouTube demonetizes AI channels under "inauthentic content" primarily due to false claims, hallucinated historical facts, and medical/survival misinformation, not AI voice synthesis.
4. **Automated Production (Vsub Platform):**
   - Tool: Vsub (`vsub.io`).
   - Long-form template selection (Ancient Simple / Stick Mix) with custom character styling.
   - Native integration with ElevenLabs v2 (e.g., Liam voice profile).
   - Auto-generates synchronized scenes, motion, sound effects, kinetic subtitles, and zoom transitions.
   - Exports 60fps 1080p MP4 in under 60 minutes.
5. **SEO & Packaging:**
   - Keyword injection from vidIQ high-volume, low-competition tags directly into Claude for metadata generation.
   - Free Canva minimalist channel banner with device safe-zone positioning.
