const { chromium } = require('playwright');

const followups = [
  {
    name: 'Ramin Fazli',
    vanity: 'ramin-fazli',
    message: "Hi Ramin, thanks so much for connecting! Truly glad to be in touch with fellow compatriots leading product in the UAE. Hope you have a productive week ahead."
  },
  {
    name: 'Nisha Hafiz',
    vanity: 'nisha-hafiz',
    message: "Hi Nisha, thank you for connecting! Really glad to stay in touch and keep an eye on your tech and real estate hiring updates in Dubai. Hope you have a great week."
  },
  {
    name: 'Ala Kiani',
    vanity: 'alakiani',
    message: "Hi Ala, thank you for connecting! Really appreciate staying in touch with experienced engineering leaders in Dubai. Wishing you a great rest of the week."
  }
];

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages()[0];

  for (const item of followups) {
    console.log(`\nSending Step 2 follow-up to ${item.name}...`);
    // Navigate to their messaging thread directly via profile message button or messaging URL
    await page.goto(`https://www.linkedin.com/in/${item.vanity}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Click Message button on their profile
    const msgBtnClicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, a'));
      const btn = btns.find(b => b.innerText.trim() === 'Message' || b.getAttribute('aria-label')?.includes('Message'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    console.log(`Clicked Message button on ${item.name}'s profile:`, msgBtnClicked);
    await page.waitForTimeout(2000);

    // Find the message input
    const sent = await page.evaluate(async (msgText) => {
      const activeInput = document.querySelector('div.msg-form__contenteditable[contenteditable="true"], div[role="textbox"][contenteditable="true"]');
      if (!activeInput) return { success: false, reason: 'No active input' };

      activeInput.focus();
      document.execCommand('insertText', false, msgText);

      // Find and click send button
      const sendBtns = Array.from(document.querySelectorAll('button'));
      const sendBtn = sendBtns.find(b => b.innerText.trim() === 'Send' || b.getAttribute('aria-label') === 'Send');
      if (sendBtn) {
        sendBtn.click();
        return { success: true };
      }
      return { success: false, reason: 'Send button not found' };
    }, item.message);

    console.log(`Result for ${item.name}:`, sent);
    await page.waitForTimeout(4000);
  }

  process.exit(0);
})();
