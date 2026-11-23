import type { DictKey } from '@/lib/i18n/dictionaries/en';

export const site = {
  name: 'INAUE',
  tagline: 'Tea & Botanicals',
};

export type NavItem = { key?: DictKey; label?: string; href: string };
export type NavGroup = { key: DictKey; href: string; items: NavItem[] };

export const nav: NavGroup[] = [
  {
    key: 'nav.shop',
    href: '/collections/all',
    items: [
      { key: 'nav.looseLeaf', href: '/collections/green' },
      { key: 'nav.matchaPowders', href: '/collections/matcha' },
      { key: 'nav.sachets', href: '/collections/all' },
      { key: 'nav.botanical', href: '/collections/botanical' },
      { key: 'nav.giftsTeaware', href: '/collections/gifts' },
      { key: 'nav.shopAll', href: '/collections/all' },
    ],
  },
  {
    key: 'nav.discover',
    href: '/#story',
    items: [
      { key: 'nav.ourStory', href: '/#story' },
      { key: 'nav.directTrade', href: '/#story' },
      { key: 'nav.brewingGuides', href: '/#brew' },
      { key: 'nav.journal', href: '/#journal' },
    ],
  },
  { key: 'nav.quiz', href: '/#quiz', items: [] },
  { key: 'nav.holiday', href: '/collections/gifts', items: [] },
];

export const footerNav: { titleKey: DictKey; links: NavItem[] }[] = [
  {
    titleKey: 'footer.shop',
    links: [
      { key: 'nav.looseLeaf', href: '/collections/green' },
      { key: 'nav.matchaPowders', href: '/collections/matcha' },
      { key: 'nav.botanical', href: '/collections/botanical' },
      { key: 'nav.giftsTeaware', href: '/collections/gifts' },
      { key: 'nav.shopAll', href: '/collections/all' },
    ],
  },
  {
    titleKey: 'footer.discover',
    links: [
      { key: 'nav.ourStory', href: '/#story' },
      { key: 'nav.directTrade', href: '/#story' },
      { key: 'nav.journal', href: '/#journal' },
      { key: 'nav.brewingGuides', href: '/#brew' },
    ],
  },
  {
    titleKey: 'footer.support',
    links: [
      { key: 'footer.trackOrder', href: '#' },
      { key: 'footer.shippingReturns', href: '#' },
      { key: 'footer.faq', href: '#' },
      { key: 'footer.contact', href: '#' },
    ],
  },
  {
    titleKey: 'footer.social',
    links: [
      { label: 'Instagram', href: '#' },
      { label: 'Pinterest', href: '#' },
      { label: 'YouTube', href: '#' },
      { label: 'LinkedIn', href: '#' },
    ],
  },
];

export const press = ['Bon Appétit', 'Kinfolk', 'The New York Times', 'Condé Nast Traveler', 'Food & Wine', 'Monocle'];

export const reviews = [
  {
    quote:
      'This is by far the best Earl Grey I have had. I drink a lot of tea and only this one tastes like the bergamot is real.',
    name: 'Marshall',
    product: 'Earl Grey Supreme',
    rating: 5,
  },
  {
    quote:
      'I do not believe there is a better green tea you can get in a bag. The evidence is in the bright, even, grassy color of the liquor.',
    name: 'Jo',
    product: 'Jade Cloud',
    rating: 5,
  },
  {
    quote:
      'I love this tea — the richness of it, the way it relaxes me with the ginger and turmeric. Such a winner.',
    name: 'Alya',
    product: 'Masala Chai',
    rating: 5,
  },
  {
    quote:
      'This tea is amazing! I feel the uplifting effects of the matcha the whole morning. It has become the center of my routine.',
    name: 'Tia',
    product: 'Ceremonial Matcha',
    rating: 5,
  },
];

export const benefits: { titleKey: DictKey; bodyKey: DictKey; image: string }[] = [
  { titleKey: 'benefits.organic.title', bodyKey: 'benefits.organic.body', image: '/img/botanical-green.jpg' },
  { titleKey: 'benefits.direct.title', bodyKey: 'benefits.direct.body', image: '/img/editorial-origin.jpg' },
  { titleKey: 'benefits.ingredients.title', bodyKey: 'benefits.ingredients.body', image: '/img/botanical-jasmine.jpg' },
];

export const exploreTeas: { key: DictKey; handle: string; quote: string }[] = [
  {
    key: 'explore.black',
    handle: 'black',
    quote:
      '"Black Tea," as it is called in the West, or Hong Cha, "Red Tea," in China, takes its reddish liquor from pigments that develop as the leaf is rolled and oxidised.',
  },
  {
    key: 'explore.botanical',
    handle: 'botanical',
    quote:
      'Flowers, roots, bark and fruit — brewed for what they do to the body and the hour, not for the caffeine they carry.',
  },
  {
    key: 'explore.chai',
    handle: 'black',
    quote:
      'Built to be boiled with milk and sugar. The spice blend matters less than the fact that the leaf is strong enough to survive it.',
  },
  {
    key: 'explore.green',
    handle: 'green',
    quote:
      'Unoxidised leaf, fired or steamed within hours of picking. The craft is in stopping the leaf from turning, not in encouraging it.',
  },
  {
    key: 'explore.matcha',
    handle: 'matcha',
    quote:
      'Shade-grown tencha, de-stemmed, and ground on granite at thirty grams an hour. You are drinking the whole leaf, suspended.',
  },
  {
    key: 'explore.oolong',
    handle: 'oolong',
    quote:
      'Partially oxidised, rolled, and often roasted — the tea with the widest range of expression and the longest life in the pot.',
  },
  {
    key: 'explore.puer',
    handle: 'dark',
    quote:
      'Fermented and aged, sometimes for decades. Earth, camphor, and a body that keeps unfolding across a dozen infusions.',
  },
  {
    key: 'explore.white',
    handle: 'white',
    quote:
      'The least handled tea there is: buds and young leaves withered in sun and dried slow. Delicate, and unforgiving of bad water.',
  },
];
