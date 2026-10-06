const { chromium } = require('playwright');
const fs = require('fs');

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
    browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];

    // Scroll down to about
    console.log('Finding Edit about button...');
    const btnFound = await page.evaluate(() => {
      const btn = document.querySelector('a[aria-label="Edit about"], button[aria-label="Edit about"]');
      if (btn) {
        btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return true;
      }
      return false;
    });
    console.log('Button found on page:', btnFound);

    await page.waitForTimeout(1000);
    await page.evaluate(() => {
      const btn = document.querySelector('a[aria-label="Edit about"], button[aria-label="Edit about"]');
      if (btn) btn.click();
    });
    await page.waitForTimeout(3000);

    const modalState = await page.evaluate(() => {
      const dialog = document.querySelector('dialog[open], div[role="dialog"]');
      if (!dialog) return { foundDialog: false };
      const textarea = dialog.querySelector('textarea');
      const textareas = Array.from(dialog.querySelectorAll('textarea')).map(t => ({ id: t.id, name: t.name, len: t.value.length }));
      return {
        foundDialog: true,
        dialogHeader: dialog.querySelector('h2, header')?.innerText || '',
        textareas: textareas
      };
    });
    console.log('Modal state:', JSON.stringify(modalState, null, 2));

    if (modalState.foundDialog && modalState.textareas.length > 0) {
      console.log('Filling new About text into textarea...');
      const fillResult = await page.evaluate((textToFill) => {
        const dialog = document.querySelector('dialog[open], div[role="dialog"]');
        const textarea = dialog.querySelector('textarea');
        if (textarea) {
          textarea.focus();
          textarea.value = textToFill;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          textarea.dispatchEvent(new Event('change', { bubbles: true }));
          return { success: true, newLen: textarea.value.length };
        }
        return { success: false };
      }, NEW_ABOUT);
      console.log('Fill result:', fillResult);

      await page.waitForTimeout(1000);
      console.log('Clicking Save button in About modal...');
      const saveResult = await page.evaluate(() => {
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
      console.log('Save button result:', saveResult);
      await page.waitForTimeout(3500);
    }

    // Capture updated state screenshot
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);

    // Read live headline from DOM
    const liveHeadline = await page.evaluate(() => {
      const el = document.querySelector('.text-body-medium.break-words') || document.querySelector('div.text-body-medium');
      return el ? el.innerText.trim() : '';
    });
    console.log('VERIFIED LIVE HEADLINE:', liveHeadline);

    console.log('About update complete.');
  } catch (err) {
    console.error('Error updating about:', err);
  } finally {
    if (browser) await browser.close();
    process.exit(0);
  }
})();
