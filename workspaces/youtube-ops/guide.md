# YouTube Operations & Media Council — Domain Guide

## 1. Domain Objective
Scale faceless, high-retention technical and historical content, automated scheduling, and Studio uploads combining the narrative authority of Graham Hancock and the packaging algorithms of Alex Hormozi.

## 2. Key Tools & Skills
- `.agents/skills/yt-faceless-council/`: Strategic media council skill for scripting, narrative pacing, and international monetization.
- `.agents/skills/youtube-studio-upload/`: Persistent Playwright CDP automation for scheduling and uploading video files to YouTube Studio (`studio.youtube.com`).
- `open_youtube_session.js`: Helper script initializing persistent Chrome session on port 9222.
- `youtube-ops/`: Asset directory containing rendered video files, scripts, and visual prompts.

## 3. Operational Rules
- All video uploads must be set to "Unlisted" or "Scheduled" unless explicitly approved for immediate public launch.
- Video files and thumbnails must have EXIF/C2PA metadata stripped using `scripts/sanitize_text_and_media.py`.
