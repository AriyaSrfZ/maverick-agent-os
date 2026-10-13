const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const targetTopic = process.argv[2] || 'feed';

(async () => {
  let browser;
  try {
    console.log(`\n======================================================`);
    console.log(`[${new Date().toISOString()}] FEED SNIPER & DISCUSSION INTELLIGENCE`);
    console.log(`Topic Target: ${targetTopic}`);
    console.log(`======================================================`);

    browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const context = browser.contexts()[0];
    const page = context.pages()[0] || await context.newPage();

    let navUrl = 'https://www.linkedin.com/feed/';
    if (targetTopic !== 'feed') {
      navUrl = `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(targetTopic)}&sortBy=%22date_posted%22`;
    }

    console.log(`Navigating to: ${navUrl}`);
    await page.goto(navUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(4000);

    for (let s = 0; s < 4; s++) {
      await page.evaluate(() => window.scrollBy(0, 1000));
      await page.waitForTimeout(1500);
    }

    const intel = await page.evaluate(() => {
      const posts = [];
      const commentBtns = Array.from(document.querySelectorAll('button[aria-label="Comment"], button[aria-label*="Comment"]'));

      for (let i = 0; i < commentBtns.length; i++) {
        const btn = commentBtns[i];
        let card = btn;
        for (let l = 0; l < 4; l++) {
          if (card.parentElement) card = card.parentElement;
        }
        if (!card) continue;

        const text = card.innerText || '';
        if (text.length < 80) continue;

        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        const author = lines[1] || lines[0] || 'Unknown';
        const title = lines[2] || '';

        // Extract reactions and comments count
        const reactionMatch = text.match(/(\d[\d,]*)\s*(?:reactions?|likes?)/i) || text.match(/\n(\d[\d,]*)\n.*reactions/);
        const reactions = reactionMatch ? parseInt(reactionMatch[1].replace(/,/g, ''), 10) : 0;

        const commentsMatch = text.match(/(\d[\d,]*)\s*comments?/i);
        const comments = commentsMatch ? parseInt(commentsMatch[1].replace(/,/g, ''), 10) : 0;

        // Check if author asks a question
        const hasQuestion = text.includes('?') || text.includes('؟');

        // Extract author profile link if present
        const authorLink = card.querySelector('a[href*="/in/"]');
        const authorUrl = authorLink ? authorLink.href.split('?')[0] : '';

        posts.push({
          index: i + 1,
          author,
          title: title.slice(0, 120),
          authorUrl,
          snippet: text.replace(/\s+/g, ' ').slice(0, 400),
          reactions,
          comments,
          hasQuestion,
          discussionScore: (reactions * 0.4) + (comments * 1.5) + (hasQuestion ? 20 : 0)
        });
      }

      // Sort by discussion opportunity score
      return posts.sort((a, b) => b.discussionScore - a.discussionScore);
    });

    console.log(`\nDiscovered ${intel.length} discussion opportunities:`);
    console.log(JSON.stringify(intel.slice(0, 5), null, 2));

    const outFile = path.join(__dirname, 'data', `sniper_intel_${Date.now()}.json`);
    fs.writeFileSync(outFile, JSON.stringify(intel, null, 2), 'utf8');
    console.log(`\nIntelligence saved to: ${outFile}`);

  } catch (err) {
    console.error('Feed sniper error:', err.message);
  } finally {
    process.exit(0);
  }
})();
