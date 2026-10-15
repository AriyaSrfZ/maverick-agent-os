# Authoritative Directive: Multi-Genre Viral Clipping & Explainer Factory
## Operational Transition from Single-Niche to High-Velocity Multi-Genre Content Engine
**Confirmed By:** Ariya Sarrafzadeh (HaroSS) | Operator Directive  
**Target Platforms:** YouTube Shorts (`UCHtmyFuya1KhO0KdLoZRKLg`), TikTok (`ariyasarrafzadeh`), Instagram Reels (`ariya.sarrafzadeh`)  
**Status:** ACTIVE POLICY (Supersedes previous single-niche archaeological/megalithic constraints)  
**Tone & Style:** Spartan, direct, active voice, zero fluff, zero buzzwords, zero em dashes.  

---

## 1. Directive Confirmation & Strategic Rationale

The previous constraint of limiting YouTube and short-form video production to a single niche (ancient engineering / Forbidden Genesis) is officially dissolved.

### The New Operational Law:
* We do not create slow, speculative text posts.
* We do not confine production to narrow historical topics.
* We ingest high-velocity viral videos across all genres from across the internet:
  * Incredible scientific and physical phenomena.
  * Wild engineering and technological breakthroughs.
  * Mind-bending financial and economic mechanisms.
  * High-status psychology, body language, and negotiation dynamics.
  * Bizarre natural events, cosmic anomalies, and extreme human feats.
  * Engaging fails, comedic timing, and absurd moments.
* We cut the absolute peak engagement moment (15 to 45 seconds).
* We re-frame the asset into vertical 9:16 (1080x1920) format using professional blurred background stacks.
* We overlay bold hook banners and kinetic explainer captions detailing exactly what is occurring.
* We distribute daily across YouTube Shorts, TikTok, and Instagram Reels via Metricool MCP.

---

## 2. The 4-Step Viral Clipping & Explainer Pipeline

```
+-----------------------------------------------------------------------------+
| Step 1: Ingestion (yt-dlp Engine)                                           |
| Input: Any trending viral video URL (YouTube, TikTok, Twitter/X, Reddit)    |
| Tool: yt-dlp pulls highest-resolution source stream instantly               |
+-----------------------------------------------------------------------------+
                                       │
                                       ▼
+-----------------------------------------------------------------------------+
| Step 2: Surgical Cut & Reframing (FFmpeg Filter Graph)                      |
| Cut: Trim the highest-tension 15-45 second segment                          |
| Layout: Background heavily blurred 1080x1920 + sharp centered 1080px video  |
+-----------------------------------------------------------------------------+
                                       │
                                       ▼
+-----------------------------------------------------------------------------+
| Step 3: Kinetic Caption & Hook Overlay (ASS Subtitle Engine)                |
| Top Banner: Bold yellow/black hook ("WHAT ACTUALLY HAPPENED HERE")          |
| Bottom Captions: Kinetic text explaining the action with zero fluff         |
+-----------------------------------------------------------------------------+
                                       │
                                       ▼
+-----------------------------------------------------------------------------+
| Step 4: Autonomous Dual-Stage Deployment                                    |
| Stage A: Instant sync to Stockholm screening room (port 8088)               |
| Stage B: Scheduled via Metricool MCP across YouTube, TikTok, and Instagram  |
+-----------------------------------------------------------------------------+
```

---

## 3. Production Engine: `youtube-ops/viral_clip_summarizer.py`

The pipeline is implemented in a single autonomous CLI utility:

```bash
# Example 1: Ingest URL, cut 25s, overlay hook banner, render & sync to Stockholm
python3 youtube-ops/viral_clip_summarizer.py \
  --url "https://youtube.com/watch?v=EXAMPLE" \
  --start 00:00:20 \
  --duration 25 \
  --banner "HOW HE SOLVED THIS IN 3 SECONDS" \
  --name "Viral_Problem_Solving"

# Example 2: Process local video clip with custom action summary
python3 youtube-ops/viral_clip_summarizer.py \
  --input "youtube-ops/assets/raw_clip.mp4" \
  --start 00:00:10 \
  --duration 30 \
  --banner "THE MOMENT EVERYTHING CHANGED" \
  --name "Viral_Breakthrough"
```

### Technical Specs:
* **Resolution:** 1080 x 1920 (Vertical 9:16).
* **Codec:** H.264 (libx264, preset veryfast, CRF 20, yuv420p).
* **Audio:** AAC 192kbps stereo, preserving authentic ambient/original dialogue.
* **Render Time:** Under 20 seconds per 30-second short on local workstation.
* **Cost:** $0 compute expense.

---

## 4. Why This Model Out-Performs Single-Niche Production

1. **Algorithmic Surface Area:** Multiple topics test multiple audience clusters simultaneously. If historical clips slow down, tech anomalies or psychology hooks carry algorithmic momentum.
2. **Immediate Cash & Growth:** Daily volume on TikTok and YouTube Shorts triggers rapid subscriber gains and audience monetization without creative exhaustion.
3. **Cognitive Relief for Operator:** Eliminates writer's block. The internet produces thousands of viral moments every hour. The agent finds them, trims the core hook, explains the mechanism, and delivers ready-to-publish assets.
