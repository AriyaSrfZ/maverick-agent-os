const { chromium } = require('playwright');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];

    const vanity = 'reza%D9%80rahnama%D9%80ac';
    const message = 'سلام رضا عزیز، ممنون از قبول ارتباط. خیلی خوشحال می‌شم با هم در ارتباط باشیم و از تجربیاتت در بازارپی و توسعه زیرساخت‌های پرداخت بشنوم.';

    console.log('Navigating to profile:', vanity);
    await page.goto(`https://www.linkedin.com/in/${vanity}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const composeHref = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('a')).find(b => b.innerText.trim() === 'Message');
      return btn ? btn.getAttribute('href') : null;
    });

    console.log('Compose Href:', composeHref);
    if (!composeHref) {
      throw new Error('Compose href not found');
    }

    await page.goto(`https://www.linkedin.com${composeHref}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const inputSelector = 'div.msg-form__contenteditable[contenteditable="true"]';
    await page.waitForSelector(inputSelector, { timeout: 10000 });

    const input = await page.$(inputSelector);
    await input.click();
    await page.waitForTimeout(500);

    // Insert text safely via keyboard
    await page.keyboard.insertText(message);
    await page.waitForTimeout(1500);

    const sendBtnSelector = 'button.msg-form__send-button';
    const sendBtn = await page.$(sendBtnSelector);
    if (!sendBtn) {
      throw new Error('Send button not found');
    }

    const isDisabled = await page.evaluate(el => el.disabled, sendBtn);
    console.log('Send button disabled?', isDisabled);

    if (!isDisabled) {
      await sendBtn.click();
      console.log('Clicked Send button!');
      await page.waitForTimeout(3000);

      // Verify last sent message in thread
      const lastMsg = await page.evaluate(() => {
        const msgs = Array.from(document.querySelectorAll('.msg-s-event-listitem__body, .msg-s-message-listitem'));
        return msgs.length > 0 ? msgs[msgs.length - 1].innerText.trim() : null;
      });
      console.log('Verified sent message:', lastMsg);
    } else {
      console.error('Send button is disabled after inserting text');
    }

  } catch (err) {
    console.error('Execution error:', err);
  } finally {
    process.exit(0);
  }
})();
