export type Product = {
  handle: string;
  title: string;
  subtitle: string;
  notes: string;
  price: number;
  /** 主图（= images[0]），列表卡与购物车使用 */
  image: string;
  /** 图集，第一张为封面 */
  images?: string[];
  badge?: string;
  categories: string[];
  sizes: { label: string; price: number }[];
  blurb: string;
  origin: string;
  caffeine: string;
  ingredients: string;
  preparation: string;
  story: string;
};

export const products: Product[] = [
  {
    handle: 'earl-grey-supreme',
    title: 'Earl Grey Supreme',
    subtitle: 'Organic Black Tea Blend',
    notes: 'Rich | Citrusy | Floral',
    price: 18.9,
    image: '/img/p-earl-grey.jpg',
    images: ['/img/p-earl-grey.jpg', '/img/pdp-hero.jpg', '/img/botanical-green.jpg'],
    badge: 'Best Seller',
    categories: ['black'],
    sizes: [
      { label: '4 oz loose leaf', price: 18.9 },
      { label: '1 lb loose leaf', price: 62.0 },
      { label: '50 sachets', price: 24.0 },
    ],
    blurb:
      'Bergamot pressed in Calabria meets a high-grown Ceylon and a whisper of blue cornflower. A tea that tastes like the first hour of a good morning.',
    origin: 'Ceylon and Calabria, Italy',
    caffeine: 'Medium',
    ingredients: 'Organic black tea, organic bergamot oil, organic cornflower petals',
    preparation: '1 tsp per 8 oz · 205°F · steep 3–4 minutes',
    story:
      'We blend the bergamot separately and rest the leaf for eleven days, so the citrus settles into the tea instead of sitting on top of it.',
  },
  {
    handle: 'jade-cloud',
    title: 'Jade Cloud',
    subtitle: 'Organic Green Tea',
    notes: 'Savory | Floral | Toasty',
    price: 20.0,
    image: '/img/p-jade-cloud.jpg',
    images: ['/img/p-jade-cloud.jpg', '/img/pdp-hero.jpg', '/img/botanical-green.jpg'],
    badge: 'Best Seller',
    categories: ['green'],
    sizes: [
      { label: '4 oz loose leaf', price: 20.0 },
      { label: '1 lb loose leaf', price: 68.0 },
      { label: '50 sachets', price: 26.0 },
    ],
    blurb:
      'A spring-harvest green from the hills above Enshi, pan-fired by hand. Bright snap pea, a lift of orchid, and a finish that stays sweet.',
    origin: 'Enshi, Hubei, China',
    caffeine: 'Low–Medium',
    ingredients: 'Organic green tea',
    preparation: '1 tsp per 8 oz · 175°F · steep 2–3 minutes',
    story:
      'Picked in the two weeks after Qingming, when the buds are still tight. The farmer, Mr. Li, fires each batch in a wood-fed wok he has used since 1994.',
  },
  {
    handle: 'iron-goddess',
    title: 'Iron Goddess',
    subtitle: 'Organic Oolong Tea',
    notes: 'Creamy | Orchid | Honey',
    price: 24.0,
    image: '/img/p-iron-goddess.jpg',
    images: ['/img/p-iron-goddess.jpg', '/img/pdp-hero.jpg', '/img/editorial-brew.jpg'],
    categories: ['oolong'],
    sizes: [
      { label: '3 oz loose leaf', price: 24.0 },
      { label: '8 oz loose leaf', price: 56.0 },
    ],
    blurb:
      'Tieguanyin rolled into tight emerald nuggets that open across five or six infusions, each one a little more honeyed than the last.',
    origin: 'Anxi, Fujian, China',
    caffeine: 'Medium',
    ingredients: 'Organic oolong tea',
    preparation: '1 tsp per 6 oz · 195°F · steep 45s, add 15s per infusion',
    story:
      'Charcoal-roasted in the traditional Anxi method, then rested six weeks. The roast is a background note, not the headline.',
  },
  {
    handle: 'silver-needle',
    title: 'Silver Needle',
    subtitle: 'Organic White Tea',
    notes: 'Delicate | Melon | Silky',
    price: 32.0,
    image: '/img/p-silver-needle.jpg',
    images: ['/img/p-silver-needle.jpg', '/img/pdp-hero.jpg', '/img/botanical-green.jpg'],
    badge: 'New',
    categories: ['white'],
    sizes: [
      { label: '2 oz loose leaf', price: 32.0 },
      { label: '8 oz loose leaf', price: 96.0 },
    ],
    blurb:
      'Only the downy spring buds, withered in the sun and dried slow. Pale gold in the cup with a texture closer to silk than to tea.',
    origin: 'Fuding, Fujian, China',
    caffeine: 'Low',
    ingredients: 'Organic white tea buds',
    preparation: '1 tbsp per 8 oz · 180°F · steep 3–5 minutes',
    story:
      'A single picking, ten days in March. We buy the whole lot each year from one family and never blend it.',
  },
  {
    handle: 'ceremonial-matcha',
    title: 'Ceremonial Matcha',
    subtitle: 'Organic Japanese Green Tea Powder',
    notes: 'Umami | Sweet | Vibrant',
    price: 28.0,
    image: '/img/p-matcha.jpg',
    images: ['/img/p-matcha.jpg', '/img/promo-matcha.jpg', '/img/pdp-hero.jpg'],
    badge: 'Best Seller',
    categories: ['matcha', 'green'],
    sizes: [
      { label: '30 g tin', price: 28.0 },
      { label: '100 g pouch', price: 76.0 },
    ],
    blurb:
      'Stone-milled shade-grown tencha from Yame, ground at 30 g an hour. Vivid jade, thick foam, and a sweetness that arrives before the bitterness does.',
    origin: 'Yame, Fukuoka, Japan',
    caffeine: 'High',
    ingredients: 'Organic Japanese green tea powder',
    preparation: '2 g per 2 oz water · 175°F · whisk 20 seconds',
    story:
      'Grown under 90% shade for three weeks before harvest, which is what builds the theanine behind that long, clean sweetness.',
  },
  {
    handle: 'masala-chai',
    title: 'Masala Chai',
    subtitle: 'Organic Black Tea Blend',
    notes: 'Spicy | Zesty | Fragrant',
    price: 17.5,
    image: '/img/p-masala-chai.jpg',
    images: ['/img/p-masala-chai.jpg', '/img/editorial-brew.jpg', '/img/promo-winter.jpg'],
    categories: ['black', 'chai'],
    sizes: [
      { label: '4 oz loose leaf', price: 17.5 },
      { label: '1 lb loose leaf', price: 58.0 },
      { label: '50 sachets', price: 22.0 },
    ],
    blurb:
      'Assam broken leaf with whole cardamom, cinnamon bark, clove and star anise — the proportions a Kolkata chai wallah would actually use.',
    origin: 'Assam, India',
    caffeine: 'High',
    ingredients:
      'Organic black tea, organic green cardamom, organic cinnamon, organic clove, organic star anise, organic black pepper',
    preparation: '1 tbsp per 8 oz · simmer with milk and sugar 5 minutes',
    story:
      'The blend is deliberately built to be boiled — a tea that gets better, not bitter, when you cook it with milk.',
  },
  {
    handle: 'jasmine-pearl',
    title: 'Jasmine Pearl',
    subtitle: 'Organic Scented Green Tea',
    notes: 'Fresh | Floral | Elegant',
    price: 22.0,
    image: '/img/p-jasmine-pearl.jpg',
    images: ['/img/p-jasmine-pearl.jpg', '/img/botanical-jasmine.jpg', '/img/pdp-hero.jpg'],
    categories: ['green'],
    sizes: [
      { label: '3 oz loose leaf', price: 22.0 },
      { label: '8 oz loose leaf', price: 52.0 },
    ],
    blurb:
      'Green tea rolled by hand into pearls, then scented seven nights running with fresh jasmine blossoms laid on top of the leaf.',
    origin: 'Hengxian, Guangxi, China',
    caffeine: 'Low–Medium',
    ingredients: 'Organic green tea, organic jasmine blossoms',
    preparation: '1 tsp per 8 oz · 175°F · steep 2–3 minutes',
    story:
      'The blossoms are picked at dawn and layered with the tea that evening. Each night, the spent flowers are picked out and replaced.',
  },
  {
    handle: 'chamomile-blossoms',
    title: 'Chamomile Blossoms',
    subtitle: 'Organic Caffeine-Free Pure Botanical',
    notes: 'Honey | Fruity | Sweet',
    price: 17.5,
    image: '/img/p-chamomile.jpg',
    images: ['/img/p-chamomile.jpg', '/img/botanical-jasmine.jpg', '/img/editorial-brew.jpg'],
    badge: 'Best Seller',
    categories: ['botanical'],
    sizes: [
      { label: '3 oz loose', price: 17.5 },
      { label: '50 sachets', price: 20.0 },
    ],
    blurb:
      'Whole Egyptian chamomile flowers, not the dust, with an unexpectedly apple-fruity middle. The most reliable evening cup we sell.',
    origin: 'Nile Delta, Egypt',
    caffeine: 'None',
    ingredients: 'Organic chamomile flowers',
    preparation: '1 tbsp per 8 oz · 205°F · steep 5 minutes',
    story:
      'We buy only whole flowers, which is why the dry leaf smells of cut apple rather than hay.',
  },
  {
    handle: 'houjicha-roast',
    title: 'Houjicha Roast',
    subtitle: 'Organic Japanese Green Tea',
    notes: 'Toasted | Nutty | Smooth',
    price: 19.0,
    image: '/img/p-houjicha.jpg',
    images: ['/img/p-houjicha.jpg', '/img/pdp-hero.jpg', '/img/editorial-brew.jpg'],
    categories: ['green'],
    sizes: [
      { label: '4 oz loose leaf', price: 19.0 },
      { label: '1 lb loose leaf', price: 62.0 },
    ],
    blurb:
      'Green tea roasted over charcoal until the leaf turns copper. Low caffeine, high comfort — tastes like the last ten minutes of a meal.',
    origin: 'Shizuoka, Japan',
    caffeine: 'Low',
    ingredients: 'Organic roasted green tea',
    preparation: '1 tbsp per 8 oz · 195°F · steep 2 minutes',
    story:
      'Roasted in small drums at the end of each season, which is how the batch absorbs the smoke without turning acrid.',
  },
  {
    handle: 'ancient-puer',
    title: 'Ancient Pu’er',
    subtitle: 'Organic Dark Tea',
    notes: 'Earthy | Camphor | Deep',
    price: 26.0,
    image: '/img/p-puer.jpg',
    images: ['/img/p-puer.jpg', '/img/editorial-brew.jpg', '/img/promo-winter.jpg'],
    categories: ['dark', 'black'],
    sizes: [
      { label: '3 oz loose leaf', price: 26.0 },
      { label: '250 g cake', price: 88.0 },
    ],
    blurb:
      'A 2019 vintage from Menghai, aged in a dry warehouse. Forest floor, camphor, and a finish that keeps going long after you set the cup down.',
    origin: 'Menghai, Yunnan, China',
    caffeine: 'Medium–High',
    ingredients: 'Organic fermented dark tea',
    preparation: '1 tbsp per 6 oz · 212°F · steep 30s, many infusions',
    story:
      'Pressed from old-growth leaf and rested five years before release. We buy it by the tong.',
  },
  {
    handle: 'tin-duo-sampler',
    title: 'Tin Duo Sampler',
    subtitle: 'Tea Sampler',
    notes: 'Assorted | Seasonal',
    price: 34.0,
    image: '/img/p-tin-duo.jpg',
    images: ['/img/p-tin-duo.jpg', '/img/p-gift-set.jpg', '/img/editorial-brew.jpg'],
    categories: ['gifts', 'sampler'],
    sizes: [{ label: 'Two 1.5 oz tins', price: 34.0 }],
    blurb:
      'Two of our most-loved teas in pocket tins, boxed for gifting. Swap the pair each season or let us choose.',
    origin: 'Blended in Milwaukee',
    caffeine: 'Varies',
    ingredients: 'Depends on selection',
    preparation: 'See each tin for its own brewing guide',
    story:
      'The tins are designed to be refilled from a larger pouch, which is how most of our regulars buy.',
  },
  {
    handle: 'glass-brew-teapot',
    title: 'Glass Brew Teapot',
    subtitle: 'Teaware',
    notes: 'Borosilicate | 500 ml',
    price: 42.0,
    image: '/img/p-teapot.jpg',
    images: ['/img/p-teapot.jpg', '/img/editorial-brew.jpg', '/img/pdp-hero.jpg'],
    categories: ['gifts', 'ware'],
    sizes: [{ label: '500 ml', price: 42.0 }],
    blurb:
      'A clear borosilicate pot with a bamboo handle and a fine stainless strainer — the easiest way to watch a rolled oolong open.',
    origin: 'Hangzhou, China',
    caffeine: 'None',
    ingredients: 'Borosilicate glass, bamboo, stainless steel',
    preparation: 'Hand wash. Not for stovetop use.',
    story:
      'We have sold the same pot for nine years because nothing we have tested pours more cleanly.',
  },
  {
    handle: 'discovery-gift-set',
    title: 'Tea Discovery Gift Set',
    subtitle: 'Gift Set',
    notes: 'Five teas | Wooden scoop',
    price: 48.0,
    image: '/img/p-gift-set.jpg',
    images: ['/img/p-gift-set.jpg', '/img/p-tin-duo.jpg', '/img/editorial-brew.jpg'],
    badge: 'Best Seller',
    categories: ['gifts', 'sampler'],
    sizes: [{ label: 'Five 0.5 oz tins', price: 48.0 }],
    blurb:
      'Five small tins across black, green, oolong, botanical and matcha, with a cherry scoop, in a magnetic-closure box.',
    origin: 'Blended in Milwaukee',
    caffeine: 'Varies',
    ingredients: 'Depends on selection',
    preparation: 'Each tin carries its own brewing guide',
    story:
      'Built as the first order for someone who does not yet know what they like — which is most of us at the start.',
  },
];

export const collections = [
  {
    handle: 'all',
    title: 'All Teas',
    intro: 'Every tea and botanical we make, in one place.',
    image: '/img/editorial-brew.jpg',
  },
  {
    handle: 'black',
    title: 'Black & Red',
    intro:
      'Full-bodied, malty, and generous with milk — the teas that open the morning.',
    image: '/img/p-earl-grey.jpg',
  },
  {
    handle: 'green',
    title: 'Green',
    intro:
      'Pan-fired, steamed, and roasted greens from China and Japan, picked in the first weeks of spring.',
    image: '/img/p-jade-cloud.jpg',
  },
  {
    handle: 'matcha',
    title: 'Matcha',
    intro: 'Stone-milled shade-grown tencha, from ceremonial grade to barista.',
    image: '/img/p-matcha.jpg',
  },
  {
    handle: 'oolong',
    title: 'Oolong',
    intro: 'Rolled, roasted, and built to be brewed again and again.',
    image: '/img/p-iron-goddess.jpg',
  },
  {
    handle: 'botanical',
    title: 'Botanical',
    intro: 'Caffeine-free flowers, roots, and barks for the quieter hours.',
    image: '/img/p-chamomile.jpg',
  },
  {
    handle: 'gifts',
    title: 'Gifts & Teaware',
    intro: 'Boxes, tins, and the tools that make brewing easier.',
    image: '/img/p-gift-set.jpg',
  },
];

export function getCollection(handle: string) {
  return collections.find((c) => c.handle === handle);
}

export function productsIn(handle: string): Product[] {
  if (handle === 'all') return products;
  return products.filter((p) => p.categories.includes(handle));
}

export function getProduct(handle: string) {
  return products.find((p) => p.handle === handle);
}

/** 图集：没有 images 时回落到单张主图 */
export function productImages(product: Product): string[] {
  return product.images && product.images.length > 0 ? product.images : [product.image];
}
