const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages()[0];

  console.log('Navigating to feed...');
  await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Scroll down until Pratik Datta is found
  let found = false;
  for (let i = 0; i < 6; i++) {
    found = await page.evaluate(() => {
      const posts = Array.from(document.querySelectorAll('div.feed-shared-update-v2, article'));
      const p = posts.find(el => el.innerText.includes('Pratik Datta'));
      if (p) {
        p.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return true;
      }
      window.scrollBy(0, 1200);
      return false;
    });
    if (found) break;
    await page.waitForTimeout(1500);
  }

  console.log('Found Pratik Datta post:', found);
  if (!found) {
    console.error('Could not locate Pratik Datta post after scrolling.');
    process.exit(1);
  }

  await page.waitForTimeout(2000);

  // Click Comment button on Pratik's post
  const clickedComment = await page.evaluate(() => {
    const posts = Array.from(document.querySelectorAll('div.feed-shared-update-v2, article'));
    const p = posts.find(el => el.innerText.includes('Pratik Datta'));
    if (!p) return false;
    const btn = p.querySelector('button[aria-label*="Comment"], button.comment-button');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });

  console.log('Clicked Comment button:', clickedComment);
  await page.waitForTimeout(2500);

  // Locate comment editor
  const editor = await page.locator('div.editor-content[contenteditable="true"], div.ql-editor[contenteditable="true"], div[role="textbox"][contenteditable="true"]').first();
  await editor.focus();
  await page.waitForTimeout(500);

  const commentText = "Comprehensive breakdown Pratik. If there is one boundary where scaling payment platforms suffer the most friction in production, it is the asynchronous gap between Area 5 (Standards/Messaging) and Area 9 (Reconciliation & Settlement).\n\nWhen an upstream switch drops an acknowledgement or network jitter causes an ISO 8583 timeout, naive ledgers immediately write double balances because the timeout is treated as a failure rather than an indeterminate state.\n\nIn high-concurrency environments, decoupling state validation from batch EOD sweeps and implementing atomic 3-way transactional locks (switch state, internal double-entry ledger, and settlement queue) is the only thing that prevents operations from spending 40 hours a week untangling spreadsheet discrepancies.";

  await page.keyboard.insertText(commentText);
  await page.waitForTimeout(1500);

  // Click Submit comment
  const submitted = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const submitBtn = btns.reverse().find(b => b.innerText.trim() === 'Comment' || b.getAttribute('aria-label') === 'Comment');
    if (submitBtn) {
      submitBtn.click();
      return true;
    }
    return false;
  });

  console.log('Submitted comment on Pratik Datta post:', submitted);
  await page.waitForTimeout(4000);
  process.exit(0);
})();
