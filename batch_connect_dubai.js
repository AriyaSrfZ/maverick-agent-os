const { chromium } = require('playwright');

const targets = [
  { name: 'Nour Gamal', vanity: 'nourrgamal', type: 'recruiter' },
  { name: 'Kulsum Siddiqui', vanity: 'kulsum-siddiqui-a1526517b', type: 'recruiter' },
  { name: 'Muhammad Chaudhry', vanity: 'muhammad-chaudhry-4abb11a9', type: 'recruiter' },
  { name: 'Sweta Taparia', vanity: 'sweta-taparia', type: 'recruiter' },
  { name: 'Maithri Alapati', vanity: 'srimaithrialapati', type: 'recruiter' },
  { name: 'Abhishek Deshmukh', vanity: 'abhishek-deshmukh-523b981b3', type: 'recruiter' },
  { name: 'Andisheh Abbasian', vanity: 'andisheh-abbasian', type: 'iranian_tech' },
  { name: 'Arman Khajehvand', vanity: 'arman-khajehvand', type: 'iranian_tech' }
];

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages()[0];

  const results = [];

  for (const target of targets) {
    console.log(`\nProcessing: ${target.name} (${target.vanity})...`);
    const inviteUrl = `https://www.linkedin.com/preload/search-custom-invite/?vanityName=${target.vanity}`;
    
    try {
      await page.goto(inviteUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);

      // Check if modal appeared
      const hasModal = await page.evaluate(() => {
        return document.body.innerText.includes('Add a note to your invitation') || document.body.innerText.includes('Personalize your invitation');
      });

      if (!hasModal) {
        console.log(`Modal did not appear for ${target.name}. Maybe already connected or pending. Skipping.`);
        results.push({ name: target.name, status: 'skipped_or_pending' });
        continue;
      }

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

      if (addNoteClicked) {
        await page.waitForTimeout(1000);
        await page.evaluate(() => {
          const ta = document.querySelector('textarea');
          if (ta) ta.focus();
        });
        await page.waitForTimeout(500);

        const firstName = target.name.split(' ')[0];
        const note = `Hi ${firstName}, I’m Ariya, with 15+ years of experience in payments, fintech technology and operations. I’m expanding my international professional network and would be glad to connect and stay in touch.`;

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

        console.log(`Sent invite to ${target.name}: ${sent}`);
        await page.waitForTimeout(3000);
        results.push({ name: target.name, status: sent ? 'sent_with_note' : 'send_button_failed' });
      } else {
        // Send without note fallback
        const sendDirect = await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.innerText.trim() === 'Send without a note');
          if (btn) {
            btn.click();
            return true;
          }
          return false;
        });
        console.log(`Sent direct invite to ${target.name}: ${sendDirect}`);
        await page.waitForTimeout(3000);
        results.push({ name: target.name, status: sendDirect ? 'sent_without_note' : 'failed' });
      }
    } catch (err) {
      console.error(`Error processing ${target.name}:`, err.message);
      results.push({ name: target.name, status: 'error', error: err.message });
    }
  }

  console.log('\n================ BATCH RESULTS ================');
  console.log(JSON.stringify(results, null, 2));
  require('fs').writeFileSync('/home/aria/Downloads/CV/Linkdin files/batch_connection_results.json', JSON.stringify(results, null, 2));
  process.exit(0);
})();
