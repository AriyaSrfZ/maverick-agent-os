const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages()[0];

  console.log('Navigating to recent activity...');
  await page.goto('https://www.linkedin.com/in/ariya-sarrafzadeh/recent-activity/all/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Find all posts by Ariya
  const posts = await page.$$('div.feed-shared-update-v2');
  console.log(`Found ${posts.length} feed updates.`);

  let featuredCount = 0;
  for (let i = 0; i < Math.min(posts.length, 3); i++) {
    const post = posts[i];
    const textSnippet = await post.evaluate(el => el.innerText.substring(0, 100).replace(/\n+/g, ' '));
    console.log(`\nInspecting post #${i + 1}: ${textSnippet}`);

    const controlBtn = await post.$('button[aria-label*="control menu"], button[aria-label*="more options"], button.feed-shared-control-menu__trigger');
    if (!controlBtn) {
      console.log('No control button found for post.');
      continue;
    }

    await controlBtn.click();
    await page.waitForTimeout(1500);

    const featureClicked = await page.evaluate(() => {
      const dropdownItems = Array.from(document.querySelectorAll('.artdeco-dropdown__item, div[role="menuitem"], li, span'));
      const item = dropdownItems.find(el => el.innerText && el.innerText.trim() === 'Feature on top of profile');
      if (item) {
        item.click();
        return true;
      }
      return false;
    });

    console.log(`Clicked "Feature on top of profile" for post #${i + 1}: ${featureClicked}`);
    if (featureClicked) featuredCount++;
    await page.waitForTimeout(2000);
  }

  console.log(`\nSuccessfully featured ${featuredCount} posts on profile!`);
  process.exit(0);
})();
