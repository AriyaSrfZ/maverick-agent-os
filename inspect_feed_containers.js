const { chromium } = require('playwright');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];

    const result = await page.evaluate(() => {
      // Find element containing 'Soheil Pourjozi' or other author
      const allEls = Array.from(document.querySelectorAll('*'));
      const textMatch = allEls.find(el => el.innerText && el.innerText.includes('Soheil Pourjozi') && el.children.length === 0);
      
      let chain = [];
      let cur = textMatch;
      while (cur && cur !== document.body) {
        chain.push({
          tag: cur.tagName.toLowerCase(),
          className: cur.className,
          id: cur.id,
          role: cur.getAttribute('role'),
          dataAttr: Array.from(cur.attributes).filter(a => a.name.startsWith('data-')).map(a => `${a.name}="${a.value}"`).join(' ')
        });
        cur = cur.parentElement;
      }

      // Check all elements with aria-label containing Comment or like
      const commentBtns = Array.from(document.querySelectorAll('button')).filter(b => (b.innerText || '').includes('Comment') || (b.getAttribute('aria-label') || '').includes('Comment'));

      return {
        chain: chain.slice(0, 10),
        commentBtnsFound: commentBtns.length,
        firstBtnInfo: commentBtns[0] ? { text: commentBtns[0].innerText, aria: commentBtns[0].getAttribute('aria-label'), class: commentBtns[0].className } : null
      };
    });

    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
})();
