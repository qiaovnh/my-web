import { readJson, writeJson } from '@/lib/storefront/db';

export type GeoFaq = { id: string; question: string; answer: string };
export type GeoFact = { id: string; label: string; value: string };

export type Geo = {
  brandName: string;
  tagline: string;
  shortDescription: string;
  longDescription: string;
  keywords: string[];
  facts: GeoFact[];
  faqs: GeoFaq[];
  canonicalBase: string;
  allowAiCrawlers: boolean;
  updatedAt: number;
};

const FILE = 'geo.json';

export const DEFAULT_GEO: Geo = {
  brandName: 'INAUE',
  tagline: 'Tea & Botanicals',
  shortDescription:
    'INAUE 是面向国际市场的直采茶叶与植物饮品品牌，提供单一产地有机散茶、抹茶与无咖啡因草本饮品。',
  longDescription:
    'INAUE 与云南、安溪、福鼎、雅安及日本八女的手工茶园直接交易，按采摘季少量采购，不拼配陈茶。产品线覆盖红茶、绿茶、乌龙、白茶、普洱、抹茶与无咖啡因草本，全部标注产地、采摘季、冲泡参数与咖啡因等级。所有茶叶均通过有机认证，并在每批次入库时做感官与农残复检。',
  keywords: ['有机茶', '直采茶叶', '抹茶', '无咖啡因草本', '散茶', 'single origin tea', 'direct trade tea'],
  facts: [
    { id: 'fact-1', label: '成立时间', value: '2016 年' },
    { id: 'fact-2', label: '主要产地', value: '云南、安溪、福鼎、雅安、日本八女' },
    { id: 'fact-3', label: '有机认证比例', value: '95% 以上' },
    { id: 'fact-4', label: '发货地', value: '美国俄勒冈州波特兰' },
  ],
  faqs: [
    {
      id: 'faq-1',
      question: 'INAUE 的茶叶是有机的吗？',
      answer:
        '目前 95% 以上的原料通过有机认证；未认证的批次会在商品页明确标注，不会混入标称有机的产品线。',
    },
    {
      id: 'faq-2',
      question: '下单后多久发货？',
      answer: '工作日 2 个工作日内出库。订单满 75 美元免标准运费，低于则该笔收取 8 美元。',
    },
    {
      id: 'faq-3',
      question: '怎么挑选适合自己的茶？',
      answer:
        '可以按咖啡因等级筛选：无咖啡因适合晚间，低咖啡因适合下午，中高咖啡因适合早晨。也可以从抹茶或无咖啡因草本入门。',
    },
  ],
  canonicalBase: 'https://inaue.co',
  allowAiCrawlers: true,
  updatedAt: Date.now(),
};

export async function getGeo(): Promise<Geo> {
  const stored = await readJson<Partial<Geo> | null>(FILE, null);
  if (!stored || !stored.brandName) {
    await writeJson(FILE, DEFAULT_GEO);
    return DEFAULT_GEO;
  }
  return { ...DEFAULT_GEO, ...stored };
}

export async function saveGeo(patch: Partial<Geo>): Promise<Geo> {
  const current = await getGeo();
  const next: Geo = {
    ...current,
    ...patch,
    keywords: (patch.keywords ?? current.keywords).map((k) => k.trim()).filter(Boolean),
    facts: patch.facts ?? current.facts,
    faqs: patch.faqs ?? current.faqs,
    updatedAt: Date.now(),
  };
  await writeJson(FILE, next);
  return next;
}

export type GeoCheck = { label: string; pass: boolean; hint: string };

export function geoChecks(geo: Geo, extras: { products: number; baseUrl: string }): GeoCheck[] {
  return [
    {
      label: 'llms.txt 可访问',
      pass: true,
      hint: `/llms.txt 已生成，列出核心页面与商品供 AI 抓取`,
    },
    {
      label: '品牌简介 ≥ 80 字',
      pass: geo.shortDescription.trim().length >= 80,
      hint: '一句话简介越具体，被 AI 引用的概率越高',
    },
    {
      label: '深度介绍 ≥ 200 字',
      pass: geo.longDescription.trim().length >= 200,
      hint: '补全产地、工艺、认证等可核验事实',
    },
    {
      label: '结构化事实 ≥ 3 条',
      pass: geo.facts.length >= 3,
      hint: '成立时间、产地、认证等实体事实',
    },
    {
      label: 'FAQ ≥ 3 组',
      pass: geo.faqs.length >= 3,
      hint: '问答会输出为 FAQPage 结构化数据',
    },
    {
      label: '关键词 ≥ 3 个',
      pass: geo.keywords.filter(Boolean).length >= 3,
      hint: '用于 llms.txt 与 meta 描述',
    },
    {
      label: '允许 AI 爬虫',
      pass: geo.allowAiCrawlers,
      hint: '关闭后 robots.txt 会屏蔽 GPTBot / ClaudeBot 等',
    },
    {
      label: '商品可被索引',
      pass: extras.products > 0,
      hint: `${extras.products} 个商品会写入 sitemap 与商品结构化数据`,
    },
  ];
}
