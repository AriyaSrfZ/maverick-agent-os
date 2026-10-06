const { chromium } = require('playwright');

async function sendConnectionRequest(page, profileUrl, personName, noteText) {
  console.log(`\n--- Attempting connection to: ${personName} (${profileUrl}) ---`);
  await page.goto(profileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);

  // Check if already connected or pending
  const pageStatus = await page.evaluate(() => {
    const text = document.body.innerText;
    if (text.includes('Pending') || text.includes('Invitation sent')) return 'pending';
    if (text.includes('Remove connection') || text.includes('1st degree connection')) return 'connected';
    return 'available';
  });

  if (pageStatus !== 'available') {
    console.log(`Status for ${personName} is already: ${pageStatus}. Skipping.`);
    return { success: false, reason: pageStatus };
  }

  // 1. Look for direct Connect button
  let connectClicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const directBtn = btns.find(b => {
      const aria = (b.getAttribute('aria-label') || '').toLowerCase();
      const txt = b.innerText.trim().toLowerCase();
      return (txt === 'connect' || aria.includes('invite') && aria.includes('connect')) && !aria.includes('more');
    });
    if (directBtn) {
      directBtn.click();
      return true;
    }
    return false;
  });

  // 2. If not found, look in "More" dropdown
  if (!connectClicked) {
    console.log('Direct Connect button not visible. Checking More menu...');
    const moreOpened = await page.evaluate(() => {
      const moreBtn = Array.from(document.querySelectorAll('button')).find(b => {
        const aria = b.getAttribute('aria-label') || '';
        return aria === 'More' || aria.includes('More actions');
      });
      if (moreBtn) {
        moreBtn.click();
        return true;
      }
      return false;
    });

    if (moreOpened) {
      await page.waitForTimeout(1500);
      connectClicked = await page.evaluate(() => {
        const allItems = Array.from(document.querySelectorAll('div[role="menu"] div, div[role="menu"] span, .artdeco-dropdown__content span'));
        const connItem = allItems.find(e => e.innerText.trim() === 'Connect');
        if (connItem) {
          connItem.click();
          return true;
        }
        return false;
      });
    }
  }

  console.log('Connect action triggered:', connectClicked);
  if (!connectClicked) {
    console.log(`Could not find Connect option for ${personName}.`);
    return { success: false, reason: 'connect_not_found' };
  }

  await page.waitForTimeout(2000);

  // 3. Check for the connection modal
  const modalHandled = await page.evaluate(async (note) => {
    // Check if dialog with 'Add a note' or 'Send' is open
    const modal = document.querySelector('dialog[open], div[role="dialog"]');
    if (!modal) return { handled: false, reason: 'no_modal' };

    // Check for "Add a note" button
    const addNoteBtn = Array.from(modal.querySelectorAll('button')).find(b => {
      const txt = b.innerText.trim().toLowerCase();
      const aria = (b.getAttribute('aria-label') || '').toLowerCase();
      return txt.includes('add a note') || aria.includes('add a note');
    });

    if (addNoteBtn && note) {
      addNoteBtn.click();
      return { handled: true, step: 'clicked_add_note' };
    }

    // Or if "Send without a note" or direct "Send" exists
    const sendBtn = Array.from(modal.querySelectorAll('button')).find(b => {
      const txt = b.innerText.trim().toLowerCase();
      const aria = (b.getAttribute('aria-label') || '').toLowerCase();
      return txt === 'send' || txt.includes('send without') || aria.includes('send invitation');
    });

    if (sendBtn) {
      sendBtn.click();
      return { handled: true, step: 'clicked_send_direct' };
    }

    return { handled: false, reason: 'no_action_button' };
  }, noteText);

  console.log('Modal handle step 1:', modalHandled);
  await page.waitForTimeout(1500);

  // 4. If clicked 'Add a note', type the note and click Send
  if (modalHandled.step === 'clicked_add_note') {
    const textarea = page.locator('textarea#custom-message, textarea[name="message"], div[role="dialog"] textarea').first();
    if (await textarea.count() > 0) {
      await textarea.focus();
      await page.keyboard.insertText(noteText);
      await page.waitForTimeout(1000);

      // Click Send
      const sendModalBtn = page.locator('div[role="dialog"] button:has-text("Send"), button[aria-label*="Send invitation"]').last();
      if (await sendModalBtn.count() > 0) {
        await sendModalBtn.click();
        await page.waitForTimeout(2500);
        console.log(`Successfully sent connection invite with note to ${personName}!`);
        return { success: true, withNote: true };
      }
    }
  }

  // Final check if pending
  await page.waitForTimeout(2000);
  const finalStatus = await page.evaluate(() => {
    return document.body.innerText.includes('Pending') || document.body.innerText.includes('Invitation sent');
  });

  return { success: finalStatus, withNote: false };
}

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages()[0];

  const note = "Hi Nour, I'm Ariya. After 15 years in tech-ops and payment systems in Tehran, I'm looking to relocate to Dubai and open to any technical, operational, or integration role with visa sponsorship. Truly appreciate connecting with you.";

  const res = await sendConnectionRequest(page, 'https://www.linkedin.com/in/nourrgamal/', 'Nour Gamal', note);
  console.log('FINAL RESULT:', JSON.stringify(res, null, 2));
  process.exit(0);
})();
