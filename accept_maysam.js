const { chromium } = require('playwright');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];

    console.log('Current page title:', await page.title());

    // Find and click the Accept button for Maysam Keihani
    const result = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => {
        const a = b.getAttribute('aria-label') || '';
        return a.toLowerCase().includes('maysam') && a.toLowerCase().includes('accept');
      });
      if (btn) {
        btn.click();
        return { success: true, label: btn.getAttribute('aria-label') };
      }
      return { success: false, available: btns.map(b => b.getAttribute('aria-label')).filter(Boolean) };
    });

    console.log('Accept result:', result);
    await page.waitForTimeout(3000);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
})();
