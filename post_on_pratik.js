const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages()[0];

  const searchUrl = 'https://www.linkedin.com/search/results/content/?keywords=Pratik%20Datta%20%22HOW%20TO%20LEARN%20PAYMENTS%22&origin=GLOBAL_SEARCH_HEADER';
  console.log('Navigating to:', searchUrl);
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Click Comment button
  const clickedComment = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const commentBtn = btns.find(b => {
      const aria = (b.getAttribute('aria-label') || '').toLowerCase();
      const txt = b.innerText.trim().toLowerCase();
      return aria === 'comment' || txt === 'comment';
    });
    if (commentBtn) {
      commentBtn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked comment button:', clickedComment);
  await page.waitForTimeout(2000);

  // Focus TipTap ProseMirror editor
  const focused = await page.evaluate(() => {
    const editor = document.querySelector('div.tiptap.ProseMirror[role="textbox"], div.editor-content, div[contenteditable="true"]');
    if (editor) {
      editor.focus();
      return true;
    }
    return false;
  });
  console.log('Focused TipTap editor:', focused);
  await page.waitForTimeout(1000);

  const commentText = "Comprehensive breakdown Pratik. If there is one boundary where scaling payment platforms suffer the most friction in production, it is the asynchronous gap between Area 5 (Standards/Messaging) and Area 9 (Reconciliation & Settlement).\n\nWhen an upstream switch drops an acknowledgement or network jitter causes an ISO 8583 timeout, naive ledgers immediately write double balances because the timeout is treated as a failure rather than an indeterminate state.\n\nIn high-concurrency environments, decoupling state validation from batch EOD sweeps and implementing atomic 3-way transactional locks (switch state, internal double-entry ledger, and settlement queue) is the only thing that prevents operations from spending 40 hours a week untangling spreadsheet discrepancies.";

  await page.keyboard.insertText(commentText);
  await page.waitForTimeout(1500);

  // Submit via DOM click
  const submitted = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const submitBtn = btns.reverse().find(b => {
      const t = b.innerText.trim();
      const aria = b.getAttribute('aria-label') || '';
      return (t === 'Comment' || t === 'Post') && !aria.includes('Open') && !b.disabled;
    });
    if (submitBtn) {
      submitBtn.click();
      return { success: true, text: submitBtn.innerText };
    }
    return { success: false };
  });

  console.log('Submitted comment:', submitted);
  await page.waitForTimeout(4000);
  console.log('FINISHED PRATIK COMMENT!');
  process.exit(0);
})();
