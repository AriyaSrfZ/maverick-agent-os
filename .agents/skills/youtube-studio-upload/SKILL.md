---
name: youtube-studio-upload
description: Reliably automate video uploads and scheduling on YouTube Studio (studio.youtube.com) using persistent real Chrome, Playwright over CDP, and Polymer-resilient mouse dispatching.
---

# YouTube Studio Upload Skill (2026 CDP Production Standard)

This skill provides a battle-tested automation pipeline for uploading, configuring, and publishing videos to YouTube Studio (`studio.youtube.com`).

---

## 1. Why Standard Browser Automation Fails on YouTube Studio

YouTube Studio is one of the most hostile web applications for generic automation:
1. **Polymer / Custom Web Components & Shadow DOM**: Standard `click()` calls on `<ytcp-button>` often hit outer wrappers and never trigger the internal event listeners.
2. **Duplicate Element IDs**: YouTube Studio reuses IDs like `#save-button`, `#done-button`, and `#close-button` across multiple hidden dialogs.
3. **Modal Backdrop Interception**: When upload wizards open, `<tp-yt-paper-dialog>` or modal backdrops intercept pointer events, throwing click errors.
4. **SPA Frame & Execution Context Invalidation**: Studio constantly updates state via client-side routing. Any standard `page.evaluate()` during a route change throws `Execution context was destroyed`.
5. **Bot Detection**: Automated Chromium binaries launched without profiles are flagged by Google with *"This browser or app may not be secure"*.
6. **Hidden Validation Dependencies**: The `#done-button` / Save button remains permanently disabled until specific nested fields (most notably the Audience radio: `"No, it's not made for kids"`) are explicitly set.

---

## 2. Production Architecture

This skill solves all the above problems using a 4-pillar architecture:

```
[Real Google Chrome Profile]
       │
       ▼ (Remote Debugging Port: 9223)
[Playwright via CDP] ──► Connect via `chromium.connectOverCDP()`
       │
       ├──► DOM.setFileInputFiles / input[type="file"] (Direct Local Path)
       ├──► Resilient Evaluate Retry Loop (Recovers from SPA context churn)
       ├──► Explicit Mandatory Field Enforcement (Audience MFK / Tags / Title)
       └──► CDP Mouse Dispatching (Input.dispatchMouseEvent on visible BoundingBox)
```

---

## 3. Prerequisites

### A. Persistent Chrome Instance
Launch your main Google Chrome session with a dedicated user data directory and remote debugging port:
```bash
/usr/bin/google-chrome \
  --user-data-dir=/home/aria/.config/youtube-browser-profile \
  --remote-debugging-port=9223 \
  --no-first-run \
  --no-default-browser-check &
```

### B. Environment & Permissions
Ensure your environment allowlist includes:
- `studio.youtube.com`
- `youtube.com`
- `accounts.google.com`

---

## 4. Usage & Automation Scripts

### Script Location
`scripts/studio_upload_cdp.js`

### Execution Syntax
```bash
node scripts/studio_upload_cdp.js \
  --file "/absolute/path/to/video.mp4" \
  --title "Video Title #shorts" \
  --desc "Full description with hashtags and CTA" \
  --visibility "PUBLIC" \
  --port 9223
```

### Supported Parameters
- `--file <path>`: Absolute path to the MP4/MOV file. (Required)
- `--title <string>`: Video title (up to 100 characters). Supports emojis and `#shorts`.
- `--desc <string>`: Video description text, including links, chapters, and hashtags.
- `--visibility <PUBLIC|UNLISTED|PRIVATE>`: Publish state (Default: `PUBLIC`).
- `--port <number>`: Remote debugging port for Chrome (Default: `9223`).
- `--debug-dir <path>`: Directory to dump screenshots on failure (Default: cwd).

---

## 5. Standard Step Sequence

1. **Clear Backdrops**: Press `Escape` twice and click any active modal close buttons.
2. **Open Create Dialog**: Click `ytcp-button#create-icon` -> `Upload videos`.
3. **Attach File**: Inject local path directly into `input[type="file"]`.
4. **Form Wait**: Sleep 8s while YouTube parses metadata and calculates initial checks.
5. **Populate Title & Description**: Write into `#title-textarea #textbox` and dispatch input events.
6. **Set Audience**: Select `tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]`.
7. **Advance Stepper**: Click `#next-button` across Details, Video Elements, and Checks.
8. **Set Visibility**: Select target radio (`PUBLIC`, `UNLISTED`, or `PRIVATE`).
9. **Dispatch Save**: Calculate visible bounding box of `#done-button` and dispatch `Input.dispatchMouseEvent`.
10. **Dismiss Result**: Close the share modal and confirm table update.

---

## 6. Debugging & Diagnostics

When debugging upload failures:
1. **Context Errors**: Wrap DOM queries in a retry helper:
   ```javascript
   async function robustEval(page, fn, arg, maxRetries = 6, delay = 2000) {
     for (let i = 1; i <= maxRetries; i++) {
       try { return await page.evaluate(fn, arg); }
       catch (err) {
         if (i === maxRetries) throw err;
         await new Promise(r => setTimeout(r, delay));
       }
     }
   }
   ```
2. **Visual Inspection**: If a button click fails, take a screenshot:
   ```javascript
   await page.screenshot({ path: 'debug_studio_state.png' });
   ```
3. **Port Check**:
   ```bash
   curl -s http://127.0.0.1:9223/json/version
   ```
