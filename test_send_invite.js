const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages()[0];
  
  console.log('On Maryam Azhdari invite modal...');
  // Click Add a note
  const addNoteClicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText.trim() === 'Add a note');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });

  console.log('Clicked Add a note:', addNoteClicked);
  await page.waitForTimeout(1500);

  // Focus textarea
  const focused = await page.evaluate(() => {
    const ta = document.querySelector('textarea');
    if (ta) {
      ta.focus();
      return true;
    }
    return false;
  });
  console.log('Focused textarea:', focused);

  const note = "Hi Maryam, following your work on fintech and payment infrastructure in the UAE. Would be glad to connect and stay in touch.";

  await page.keyboard.insertText(note);
  await page.waitForTimeout(1000);

  // Click Send
  const sent = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const sendBtn = btns.reverse().find(b => b.innerText.trim() === 'Send' || b.getAttribute('aria-label') === 'Send invitation');
    if (sendBtn) {
      sendBtn.click();
      return true;
    }
    return false;
  });

  console.log('Send clicked:', sent);
  await page.waitForTimeout(3000);

  console.log('SUCCESS! Invitation with note sent to Maryam Azhdari!');
  process.exit(0);
})();
