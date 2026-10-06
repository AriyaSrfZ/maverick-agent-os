const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];
    
    console.log('Navigating to profile...');
    await page.goto('https://www.linkedin.com/in/ariya-sarrafzadeh/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const title = await page.title();
    console.log('Profile title:', title);

    // Take screenshot
    const screenshotPath = '/home/aria/Downloads/CV/Linkdin files/live_profile_screenshot.png';
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log('Screenshot saved to:', screenshotPath);

    // Extract headline
    const headline = await page.locator('.text-body-medium.break-words').first().textContent().catch(() => '');
    console.log('LIVE HEADLINE:', headline.trim());

    // Extract About
    const aboutLocator = page.locator('#about ~ .display-flex .inline-show-more-text, section:has(#about) .inline-show-more-text');
    const aboutText = await aboutLocator.textContent().catch(() => '');
    console.log('LIVE ABOUT:', aboutText.trim());

    // Extract experience summary
    const expCount = await page.locator('section:has(#experience) li.artdeco-list__item').count();
    console.log('Experience items count:', expCount);

    console.log('Audit inspection complete!');
  } catch (err) {
    console.error('Error in profile inspection:', err);
  }
})();
