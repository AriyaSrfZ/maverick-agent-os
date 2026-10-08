const { chromium } = require('playwright');

const targets = [
  {
    name: 'Dmitry Horbik',
    vanity: 'dmitryhorbik',
    message: 'Hi Dmitry, thank you for connecting. Really glad to connect with fellow platform and delivery leaders. Wishing you a great rest of the week.'
  },
  {
    name: 'Sonali Gupta',
    vanity: 'sonali9213',
    message: 'Hi Sonali, thank you for connecting. Truly glad to connect and stay in touch with fellow delivery and operations leaders.'
  }
];

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];

    for (const target of targets) {
      console.log(`\nChecking: ${target.name}`);
      await page.goto('https://www.linkedin.com/in/' + target.vanity + '/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);

      const composeHref = await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('a')).find(b => b.innerText.trim() === 'Message');
        return btn ? btn.getAttribute('href') : null;
      });

      if (!composeHref) {
        console.log(`No Message button for ${target.name}`);
        continue;
      }

      await page.goto('https://www.linkedin.com' + composeHref, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(4000);

      const threadHistory = await page.evaluate(() => {
        const msgs = Array.from(document.querySelectorAll('.msg-s-event-listitem__body, .msg-s-message-listitem'));
        return msgs.map(m => m.innerText.trim()).filter(Boolean);
      });

      if (threadHistory.length > 0) {
        console.log(`Existing thread detected for ${target.name}:`, threadHistory[threadHistory.length - 1]);
        continue;
      }

      const inputRect = await page.evaluate(() => {
        const input = document.querySelector('div.msg-form__contenteditable[contenteditable="true"]');
        if (!input) return null;
        const rect = input.getBoundingClientRect();
        return { x: rect.x + 20, y: rect.y + 20 };
      });

      if (!inputRect) continue;

      await page.mouse.click(inputRect.x, inputRect.y);
      await page.waitForTimeout(600);
      await page.keyboard.insertText(target.message);
      await page.waitForTimeout(1200);

      const sendBtnInfo = await page.evaluate(() => {
        const btn = document.querySelector('button.msg-form__send-button, button[type="submit"]');
        if (!btn) return null;
        const rect = btn.getBoundingClientRect();
        return { disabled: btn.disabled, x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
      });

      if (sendBtnInfo && !sendBtnInfo.disabled) {
        await page.mouse.click(sendBtnInfo.x, sendBtnInfo.y);
        console.log(`[SENT] to ${target.name}`);
        await page.waitForTimeout(3000);
      }
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
})();
