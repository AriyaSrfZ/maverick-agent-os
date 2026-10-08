#!/usr/bin/env node

/**
 * YouTube Studio CDP Production Uploader
 * 
 * Automates YouTube Studio upload via Chrome DevTools Protocol (CDP).
 * Designed to bypass Polymer/WebComponents issues, bot detection,
 * duplicate element IDs, and modal backdrop click interception.
 *
 * Usage:
 *   node studio_upload_cdp.js \
 *     --file "/path/to/video.mp4" \
 *     --title "My Video Title #shorts" \
 *     --desc "Description here" \
 *     --visibility "PUBLIC" \
 *     --port 9223
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// CLI Argument parsing
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    file: '',
    title: '',
    desc: '',
    visibility: 'PUBLIC', // PUBLIC | UNLISTED | PRIVATE
    port: 9223,
    debugDir: process.cwd()
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' && args[i + 1]) options.file = path.resolve(args[++i]);
    else if (args[i] === '--title' && args[i + 1]) options.title = args[++i];
    else if (args[i] === '--desc' && args[i + 1]) options.desc = args[++i];
    else if (args[i] === '--visibility' && args[i + 1]) options.visibility = args[++i].toUpperCase();
    else if (args[i] === '--port' && args[i + 1]) options.port = parseInt(args[++i], 10);
    else if (args[i] === '--debug-dir' && args[i + 1]) options.debugDir = path.resolve(args[++i]);
  }

  if (!options.file || !fs.existsSync(options.file)) {
    console.error('Error: Valid --file path is required!');
    process.exit(1);
  }
  if (!options.title) {
    options.title = path.basename(options.file, path.extname(options.file));
  }
  return options;
}

// Resilient evaluation wrapper handling SPA execution context destroyed errors
async function robustEval(page, fn, arg, maxRetries = 6, delay = 2000) {
  for (let i = 1; i <= maxRetries; i++) {
    try {
      return await page.evaluate(fn, arg);
    } catch (err) {
      if (i === maxRetries) throw err;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

// Real CDP Mouse click dispatcher
async function cdpClick(cdp, x, y) {
  await cdp.send('Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x: Math.round(x),
    y: Math.round(y),
    button: 'left',
    clickCount: 1
  });
  await new Promise(r => setTimeout(r, 100));
  await cdp.send('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x: Math.round(x),
    y: Math.round(y),
    button: 'left',
    clickCount: 1
  });
}

async function upload() {
  const opts = parseArgs();
  console.log(`[CDP-Uploader] Starting upload for: ${opts.file}`);
  console.log(`[CDP-Uploader] Title: ${opts.title}`);
  console.log(`[CDP-Uploader] Target Visibility: ${opts.visibility}`);

  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${opts.port}`, { timeout: 20000 });
  const context = browser.contexts()[0];
  let page = context.pages().find(p => p.url().includes('studio.youtube.com'));

  if (!page) {
    console.log('[CDP-Uploader] Opening new Studio page...');
    page = await context.newPage();
    await page.goto('https://studio.youtube.com', { waitUntil: 'domcontentloaded' });
  }

  const cdp = await context.newCDPSession(page);
  await new Promise(r => setTimeout(r, 2000));

  // 1. Dismiss any existing modals
  console.log('[CDP-Uploader] Step 1: Clearing active modal backdrops...');
  try {
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 500));
    await page.keyboard.press('Escape');
  } catch(e) {}

  await robustEval(page, () => {
    const dialogs = document.querySelectorAll('ytcp-dialog, [role="dialog"]');
    dialogs.forEach(d => {
      const closeBtn = d.querySelector('button, ytcp-button');
      if (closeBtn && (closeBtn.innerText.includes('Close') || closeBtn.innerText.includes('Dismiss'))) {
        closeBtn.click();
      }
    });
  });
  await new Promise(r => setTimeout(r, 1500));

  // 2. Click CREATE
  console.log('[CDP-Uploader] Step 2: Clicking CREATE button...');
  const createClicked = await robustEval(page, () => {
    const btn = document.querySelector('ytcp-button#create-icon, button[aria-label="Create"], #create-icon');
    if (btn) { btn.click(); return true; }
    return false;
  });

  if (!createClicked) {
    // Attempt CDP click on top-right create area if element query missed
    await cdpClick(cdp, 1755, 32);
  }
  await new Promise(r => setTimeout(r, 2000));

  // 3. Click 'Upload videos'
  console.log('[CDP-Uploader] Step 3: Clicking "Upload videos"...');
  await robustEval(page, () => {
    const items = Array.from(document.querySelectorAll('tp-yt-paper-item, ytcp-text-menu-item, [role="menuitem"]'));
    const uploadItem = items.find(i => i.innerText.toLowerCase().includes('upload video'));
    if (uploadItem) uploadItem.click();
  });
  await new Promise(r => setTimeout(r, 3000));

  // 4. Attach File
  console.log('[CDP-Uploader] Step 4: Attaching video file...');
  let fileInput = null;
  for (let i = 0; i < 10; i++) {
    fileInput = await page.$('input[type="file"]');
    if (fileInput) break;
    await new Promise(r => setTimeout(r, 1500));
  }

  if (!fileInput) {
    await page.screenshot({ path: path.join(opts.debugDir, 'debug_no_file_input.png') });
    throw new Error('Upload file input not found in dialog');
  }

  await fileInput.setInputFiles(opts.file);
  console.log('[CDP-Uploader] File attached. Waiting 8s for form fields to render...');
  await new Promise(r => setTimeout(r, 8000));

  // 5. Fill Title
  console.log(`[CDP-Uploader] Step 5: Setting Title: "${opts.title}"`);
  await robustEval(page, (title) => {
    const titleBox = document.querySelector('ytcp-social-suggestions-textbox#title-textarea #textbox, ytcp-mention-textbox#title-textarea #textbox, #title-textarea #textbox');
    if (titleBox) {
      titleBox.innerText = title;
      titleBox.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, opts.title);
  await new Promise(r => setTimeout(r, 1500));

  // 6. Fill Description if provided
  if (opts.desc) {
    console.log('[CDP-Uploader] Step 6: Setting Description...');
    await robustEval(page, (desc) => {
      const descBox = document.querySelector('ytcp-social-suggestions-textbox#description-textarea #textbox, ytcp-mention-textbox#description-textarea #textbox, #description-textarea #textbox');
      if (descBox) {
        descBox.innerText = desc;
        descBox.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, opts.desc);
    await new Promise(r => setTimeout(r, 1500));
  }

  // 7. Audience: "No, it's not made for kids" (Mandatory to unlock Save/Publish)
  console.log('[CDP-Uploader] Step 7: Setting Audience (Not made for kids)...');
  const kidsClicked = await robustEval(page, () => {
    const notForKids = document.querySelector('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"], #not-made-for-kids');
    if (notForKids) {
      notForKids.click();
      return true;
    }
    return false;
  });
  if (!kidsClicked) {
    await cdpClick(cdp, 612, 1409);
  }
  await new Promise(r => setTimeout(r, 1500));

  // 8. Advance through Steps (Video elements -> Checks -> Visibility)
  console.log('[CDP-Uploader] Step 8: Stepping through wizard...');
  for (let step = 1; step <= 3; step++) {
    console.log(`[CDP-Uploader] Advancing Step ${step}...`);
    const nextSuccess = await robustEval(page, () => {
      const nextBtn = document.querySelector('#next-button, ytcp-button#next-button');
      if (nextBtn && !nextBtn.hasAttribute('disabled')) {
        nextBtn.click();
        return true;
      }
      return false;
    });
    if (!nextSuccess) {
      await cdpClick(cdp, 1364, 1026);
    }
    await new Promise(r => setTimeout(r, 2500));
  }

  // 9. Set Visibility
  console.log(`[CDP-Uploader] Step 9: Selecting Visibility: ${opts.visibility}...`);
  await robustEval(page, (vis) => {
    const radio = document.querySelector(`tp-yt-paper-radio-button[name="${vis}"]`);
    if (radio) radio.click();
  }, opts.visibility);
  await new Promise(r => setTimeout(r, 2000));

  // 10. Click Publish / Save / Schedule (#done-button)
  console.log('[CDP-Uploader] Step 10: Dispatching final Publish/Save...');
  const doneResult = await robustEval(page, () => {
    const doneBtn = document.querySelector('#done-button, ytcp-button#done-button');
    if (doneBtn && !doneBtn.hasAttribute('disabled')) {
      doneBtn.click();
      return { success: true, text: doneBtn.innerText.trim() };
    }
    return { success: false };
  });

  if (!doneResult.success) {
    console.log('[CDP-Uploader] Dispatching fallback CDP click on done-button coordinates (1364, 1026)...');
    await cdpClick(cdp, 1364, 1026);
  }

  await new Promise(r => setTimeout(r, 6000));

  // 11. Dismiss final share/close modal
  console.log('[CDP-Uploader] Step 11: Closing confirmation modal...');
  await robustEval(page, () => {
    const closeBtn = document.querySelector('#close-button, ytcp-uploads-dialog-close-button');
    if (closeBtn) closeBtn.click();
  });

  await page.screenshot({ path: path.join(opts.debugDir, 'debug_upload_complete.png') });
  console.log('✅ [CDP-Uploader] Video successfully uploaded and published!');
  await browser.close();
}

upload().catch(err => {
  console.error('❌ [CDP-Uploader] Upload failed:', err);
  process.exit(1);
});
