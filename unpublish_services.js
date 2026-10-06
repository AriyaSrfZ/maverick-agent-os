const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages()[0];
  
  console.log('Navigating to services edit page...');
  await page.goto('https://www.linkedin.com/in/ariya-sarrafzadeh/opportunities/services/edit/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  console.log('Clicking Unpublish button...');
  const unpublishBtn = page.locator('button:has-text("Unpublish")');
  if (await unpublishBtn.count() > 0) {
    await unpublishBtn.click();
    await page.waitForTimeout(1500);

    // Look for confirm button in modal
    const confirmBtn = page.locator('dialog button:has-text("Unpublish"), div[role="dialog"] button:has-text("Unpublish")').last();
    if (await confirmBtn.count() > 0) {
      await confirmBtn.click();
      console.log('Confirmed Unpublish!');
      await page.waitForTimeout(3000);
    }
  }

  // Go back to profile
  await page.goto('https://www.linkedin.com/in/ariya-sarrafzadeh/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  console.log('Returned to profile.');
  process.exit(0);
})();
