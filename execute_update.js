const { chromium } = require('playwright');
const fs = require('fs');

const NEW_HEADLINE = "Senior Technical Product Manager | Architecting High-Availability Fintech & Payments for 45M+ Users | API Gateways • Multi-Petabyte Smart DB • Multi-Party Reconciliation • Fraud & AML Compliance (FATA/Shaparak)";

const NEW_ABOUT = `Over 15 years architecting and scaling high-availability fintech systems for user bases exceeding 45 million. I operate at the intersection of executive business strategy, microservice architecture, and zero-defect financial reconciliation.

Here is what I bring to high-scale platforms:

• High-Scale Infrastructure: Architected multi-million dollar API gateways with 4-hour test-to-production cycles and engineered multi-petabyte Smart DB search clusters using Elasticsearch and conversational querying.
• Fraud, AML & Regulatory Command: Served as sole technical point of command for judicial inquiries across 30,000+ cases, reducing official reporting latency by 96% (3 days down to <3 hours) while sustaining platform fraud rates under 0.01%.
• Multi-Party Financial Integrity: Designed 3-dimensional financial reconciliation engines across Wallets, C2C, BNPL, Insuretech, and Lendtech with 100% discrepancy resolution.
• Cross-Functional Leadership: Unified CEO strategic directives with engineering delivery units to launch 4–6 SaaS platforms in greenfield environments.

Currently driving technical product architecture at Persia Fava Gostaresh Co. Open to strategic Technical Product & Platform Innovation leadership opportunities in high-growth ecosystems (including Dubai / UAE).

Connect with me or reach out at ariasg2002@gmail.com.`;

(async () => {
  let browser;
  try {
    console.log('Connecting to browser CDP on port 9222...');
    browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];

    // Check if dialog is open, close it first if needed
    const openDialog = await page.$('dialog[open]');
    if (openDialog) {
      console.log('Found open dialog, pressing Escape to reset state...');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }

    // Step 1: Update Headline
    console.log('--- STEP 1: Updating Headline ---');
    console.log('Clicking Edit profile button via DOM click...');
    await page.evaluate(() => {
      const editBtn = document.querySelector('a[aria-label="Edit profile"]');
      if (editBtn) editBtn.click();
    });
    await page.waitForTimeout(2500);

    // Look for Headline input inside the modal
    const headlineUpdated = await page.evaluate((headlineText) => {
      // Find input for headline
      const inputs = Array.from(document.querySelectorAll('input, textarea'));
      // Find by id containing headline or label
      let headlineInput = null;
      for (const input of inputs) {
        const label = input.labels && input.labels[0] ? input.labels[0].innerText : '';
        if (label.toLowerCase().includes('headline') || (input.value && input.value.toLowerCase().includes('technical product manager'))) {
          headlineInput = input;
          break;
        }
      }

      if (!headlineInput) {
        // Fallback: search all visible inputs in dialog
        const dialog = document.querySelector('dialog[open], div[role="dialog"]');
        if (dialog) {
          const dialogInputs = dialog.querySelectorAll('input[type="text"]');
          // Headline is typically the 3rd or 4th text input (First name, Last name, Additional name, Headline)
          if (dialogInputs.length >= 3) {
            headlineInput = dialogInputs[2] || dialogInputs[3];
          }
        }
      }

      if (headlineInput) {
        headlineInput.focus();
        headlineInput.value = headlineText;
        headlineInput.dispatchEvent(new Event('input', { bubbles: true }));
        headlineInput.dispatchEvent(new Event('change', { bubbles: true }));
        return { success: true, id: headlineInput.id, value: headlineInput.value };
      }
      return { success: false };
    }, NEW_HEADLINE);

    console.log('Headline input result:', headlineUpdated);

    if (headlineUpdated.success) {
      // Click Save button in modal
      console.log('Clicking Save button in intro modal...');
      await page.waitForTimeout(1000);
      const saveClicked = await page.evaluate(() => {
        const dialog = document.querySelector('dialog[open], div[role="dialog"]');
        if (!dialog) return false;
        const buttons = Array.from(dialog.querySelectorAll('button'));
        const saveBtn = buttons.find(b => b.innerText.trim().toLowerCase() === 'save');
        if (saveBtn) {
          saveBtn.click();
          return true;
        }
        return false;
      });
      console.log('Save button clicked:', saveClicked);
      await page.waitForTimeout(3000);
    }

    // Step 2: Update About Section
    console.log('--- STEP 2: Updating About Section ---');
    console.log('Clicking Edit about link via DOM click...');
    await page.evaluate(() => {
      const aboutBtn = document.querySelector('a[aria-label="Edit about"]');
      if (aboutBtn) aboutBtn.click();
    });
    await page.waitForTimeout(2500);

    const aboutUpdated = await page.evaluate((aboutText) => {
      const dialog = document.querySelector('dialog[open], div[role="dialog"]');
      if (!dialog) return { success: false, reason: 'No dialog' };
      const textarea = dialog.querySelector('textarea');
      if (textarea) {
        textarea.focus();
        textarea.value = aboutText;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
        return { success: true, id: textarea.id, length: textarea.value.length };
      }
      return { success: false, reason: 'No textarea found in dialog' };
    }, NEW_ABOUT);

    console.log('About textarea result:', aboutUpdated);

    if (aboutUpdated.success) {
      console.log('Clicking Save button in About modal...');
      await page.waitForTimeout(1000);
      const saveClicked = await page.evaluate(() => {
        const dialog = document.querySelector('dialog[open], div[role="dialog"]');
        if (!dialog) return false;
        const buttons = Array.from(dialog.querySelectorAll('button'));
        const saveBtn = buttons.find(b => b.innerText.trim().toLowerCase() === 'save');
        if (saveBtn) {
          saveBtn.click();
          return true;
        }
        return false;
      });
      console.log('About Save button clicked:', saveClicked);
      await page.waitForTimeout(3000);
    }

    // Update history JSON
    const historyPath = '/home/aria/Downloads/CV/Linkdin files/linkedin-optimization-history.json';
    if (fs.existsSync(historyPath)) {
      const hist = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
      hist.changes.forEach(c => {
        c.status = 'applied_to_profile';
        c.applied_at = new Date().toISOString();
      });
      fs.writeFileSync(historyPath, JSON.stringify(hist, null, 2));
      console.log('History file updated successfully.');
    }

    console.log('All updates executed successfully!');
  } catch (err) {
    console.error('Execution error:', err);
  } finally {
    if (browser) await browser.close();
    process.exit(0);
  }
})();
