import puppeteer from 'puppeteer-core';

const BASE = process.env.BASE_URL || 'http://localhost:3210';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ' :: ' + detail : ''}`);
};

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage', `--user-data-dir=/tmp/e2e-${Date.now()}`],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1000 });
const consoleErrors = [];
page.on('pageerror', (e) => consoleErrors.push(e.message.slice(0, 120)));

// 1. Home
await page.goto(`${BASE}/`, { waitUntil: 'networkidle2', timeout: 45000 });
check('home renders brand', (await page.title()).includes('INAUE'));

// 2. Add to cart from PDP
await page.goto(`${BASE}/products/earl-grey-supreme`, { waitUntil: 'networkidle2' });
const addBtn = await page.$$('button');
let clicked = false;
for (const b of addBtn) {
  const t = await page.evaluate((el) => el.textContent, b);
  if (t && t.includes('Add to Cart')) {
    await b.click();
    clicked = true;
    break;
  }
}
check('add-to-cart button clicked', clicked);
await new Promise((r) => setTimeout(r, 1200));
const drawerText = (await page.evaluate(() => document.body.innerText)).toUpperCase();
check('cart drawer shows line item', drawerText.includes('EARL GREY SUPREME') && drawerText.includes('SUBTOTAL'), drawerText.match(/SUBTOTAL[^\n]*/)?.[0]);
await page.screenshot({ path: '/tmp/e2e-cart.png' });

// 3. Cart API reflects server state
const cartJson = await page.evaluate(async () => (await fetch('/api/cart')).json());
check('cart persisted server-side', cartJson?.cart?.lines?.length === 1, JSON.stringify(cartJson?.cart?.lines?.[0]?.title));

// 4. Checkout
await page.goto(`${BASE}/checkout`, { waitUntil: 'networkidle2' });
const onCheckout = page.url().includes('/checkout');
check('checkout reachable with items', onCheckout);
await page.type('#email', 'demo@inaue.com');
await page.type('#name', 'Ada Lovelace');
await page.type('#address', '12 Garden Row');
await page.type('#city', 'Portland');
await page.type('#postalCode', '97209');
await page.click('button[type="submit"]');
await page.waitForFunction(() => location.pathname.includes('/checkout/success'), { timeout: 20000 }).catch(() => {});
const successText = await page.evaluate(() => document.body.innerText);
check('order confirmation reached', page.url().includes('/checkout/success'), page.url());
check('order shows thank-you + total', successText.includes('Thank you') && /\$|€|£/.test(successText));
await page.screenshot({ path: '/tmp/e2e-success.png' });

// ---------- product gallery ----------
await page.goto(`${BASE}/products/earl-grey-supreme`, { waitUntil: 'networkidle2' });
const thumbCount = await page.$$eval('[aria-label^="查看第"]', (els) => els.length);
check('商品图集有多个缩略图', thumbCount >= 3, String(thumbCount));

const srcBefore = await page.$eval('[data-gallery-main]', (el) => el.getAttribute('src'));
await page.click('[aria-label="查看第 2 张"]');
await new Promise((r) => setTimeout(r, 400));
const srcAfter = await page.$eval('[data-gallery-main]', (el) => el.getAttribute('src'));
check('点击缩略图切换主图', srcBefore !== srcAfter, `${srcBefore} -> ${srcAfter}`);

// 5. Currency switch
await page.evaluate(async () => {
  await fetch('/api/currency', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currency: 'EUR' }) });
});
await page.goto(`${BASE}/products/early-grey-supreme`.replace('early', 'earl'), { waitUntil: 'networkidle2' });
const eurText = await page.evaluate(() => document.body.innerText);
check('currency switch to EUR', eurText.includes('€'), eurText.match(/from €[0-9.]+/)?.[0] ?? '');

// reset currency
await page.evaluate(async () => {
  await fetch('/api/currency', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currency: 'USD' }) });
});

// 6. Search
await page.goto(`${BASE}/search?q=matcha`, { waitUntil: 'networkidle2' });
const searchText = await page.evaluate(() => document.querySelector('main')?.innerText ?? '');
check('search returns results', /result/i.test(searchText) && searchText.includes('Matcha'));

// 7. Filters
await page.goto(`${BASE}/collections/all?caffeine=none`, { waitUntil: 'networkidle2' });
const filterText = await page.evaluate(() => document.querySelector('main')?.innerText ?? '');
const shown = filterText.match(/(\d+)\s*PRODUCTS/i);
const onlyFree = !filterText.includes('Earl Grey Supreme');
check('caffeine filter narrows grid', Boolean(shown && Number(shown[1]) < 13 && onlyFree), shown?.[0]);

check('no page errors', consoleErrors.length === 0, consoleErrors.join(' | '));

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
