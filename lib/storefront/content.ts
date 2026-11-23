import { readJson, writeJson } from '@/lib/storefront/db';
import type { DictKey } from '@/lib/i18n/dictionaries/en';

export type BannerPlacement = 'home-hero' | 'home-promo';

export type Banner = {
  id: string;
  placement: BannerPlacement;
  /** 不使用语言包，直接展示的文案 */
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  theme: 'forest' | 'ink' | 'cream';
  active: boolean;
  order: number;
};

export type NavLink = {
  id: string;
  label: string;
  /** 有 labelKey 时优先用语言包，便于内置项跟随多语言 */
  labelKey?: DictKey;
  href: string;
  visible: boolean;
};

export type NavGroup = {
  id: string;
  label: string;
  labelKey?: DictKey;
  href: string;
  visible: boolean;
  order: number;
  children: NavLink[];
};

export type Content = {
  banners: Banner[];
  nav: NavGroup[];
};

const FILE = 'content.json';

export const DEFAULT_CONTENT: Content = {
  banners: [
    {
      id: 'banner-hero',
      placement: 'home-hero',
      title: 'Tea Is the Moment',
      subtitle: 'Houjicha Old Fashioned, meet Matcha-Tini. The winter drinks menu is here.',
      ctaLabel: 'Shop Holiday',
      ctaHref: '/collections/gifts',
      image: '/img/hero-cocktail.jpg',
      theme: 'forest',
      active: true,
      order: 0,
    },
    {
      id: 'banner-matcha',
      placement: 'home-promo',
      title: 'Supercharge Your Ritual With Matcha',
      subtitle:
        'In every emerald-green swirl, matcha delivers a caffeine profile that pairs cleanly with theanine — sustained energy, and none of the drop.',
      ctaLabel: 'Shop Matcha',
      ctaHref: '/collections/matcha',
      image: '/img/promo-matcha.jpg',
      theme: 'forest',
      active: true,
      order: 0,
    },
  ],
  nav: [
    {
      id: 'nav-shop',
      label: 'Shop',
      labelKey: 'nav.shop',
      href: '/collections/all',
      visible: true,
      order: 0,
      children: [
        { id: 'nav-shop-1', label: 'Loose Leaf', labelKey: 'nav.looseLeaf', href: '/collections/green', visible: true },
        { id: 'nav-shop-2', label: 'Matcha & Powders', labelKey: 'nav.matchaPowders', href: '/collections/matcha', visible: true },
        { id: 'nav-shop-3', label: 'Botanical', labelKey: 'nav.botanical', href: '/collections/botanical', visible: true },
        { id: 'nav-shop-4', label: 'Gifts & Teaware', labelKey: 'nav.giftsTeaware', href: '/collections/gifts', visible: true },
        { id: 'nav-shop-5', label: 'Shop All', labelKey: 'nav.shopAll', href: '/collections/all', visible: true },
      ],
    },
    {
      id: 'nav-discover',
      label: 'Discover',
      labelKey: 'nav.discover',
      href: '/#story',
      visible: true,
      order: 1,
      children: [
        { id: 'nav-discover-1', label: 'Our Story', labelKey: 'nav.ourStory', href: '/#story', visible: true },
        { id: 'nav-discover-2', label: 'Brewing Guides', labelKey: 'nav.brewingGuides', href: '/#brew', visible: true },
        { id: 'nav-discover-3', label: 'Journal', labelKey: 'nav.journal', href: '/#journal', visible: true },
      ],
    },
    { id: 'nav-quiz', label: 'Tea Quiz', labelKey: 'nav.quiz', href: '/#quiz', visible: true, order: 2, children: [] },
    { id: 'nav-holiday', label: 'Holiday Shop', labelKey: 'nav.holiday', href: '/collections/gifts', visible: true, order: 3, children: [] },
  ],
};

export async function getContent(): Promise<Content> {
  const stored = await readJson<Partial<Content> | null>(FILE, null);
  if (!stored || !Array.isArray(stored.banners) || !Array.isArray(stored.nav)) {
    await writeJson(FILE, DEFAULT_CONTENT);
    return DEFAULT_CONTENT;
  }
  return { banners: stored.banners, nav: stored.nav };
}

export async function saveContent(content: Content): Promise<Content> {
  const next: Content = {
    banners: [...content.banners].sort((a, b) => a.order - b.order),
    nav: [...content.nav].sort((a, b) => a.order - b.order),
  };
  await writeJson(FILE, next);
  return next;
}

export function bannerFor(content: Content, placement: BannerPlacement): Banner | null {
  return (
    content.banners
      .filter((b) => b.placement === placement && b.active)
      .sort((a, b) => a.order - b.order)[0] ?? null
  );
}

export function visibleNav(content: Content): NavGroup[] {
  return content.nav
    .filter((g) => g.visible)
    .sort((a, b) => a.order - b.order)
    .map((g) => ({ ...g, children: g.children.filter((c) => c.visible) }));
}

export const newId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
