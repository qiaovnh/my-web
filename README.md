# INAUE — Tea & Botanicals

参考站：<https://www.rishi-tea.com/>（Shopify 定制站，实测 276 商品 / 135 集合 / 337 篇文章 / 首页 22 区块）。

演进路径：A 档前端复刻 → **B 档可卖货**（服务端购物车 / 结账 / 订单）→ 7 语言国际化（含 RTL）→ 中文化后台 + **页面管理** + **GEO 优化**。

## 运行

```bash
npm install
npm run dev                     # http://localhost:3210
npm run build && npm start      # 生产
ADMIN_PASSWORD=你的密码 npm start
npm run e2e                     # 50 项端到端断言（商店 + 后台 + i18n + GEO）
```

管理后台：**/admin**，默认密码 `inaue-admin`（用 `ADMIN_PASSWORD` 覆盖）。

## 部署

| 目标 | 文档 | 一句话 |
|---|---|---|
| **Vercel**（推荐） | [DEPLOY-VERCEL.md](DEPLOY-VERCEL.md) | 推 GitHub → Vercel 导入 → 配 Blob 与环境变量 |
| 自建服务器 | [DEPLOY-SELFHOSTED.md](DEPLOY-SELFHOSTED.md) | 19MB 免编译部署包 + Nginx 反代 |
| Vercel 部署方式详解 | [DEPLOY.md](DEPLOY.md) | Blob 存储细节与降级行为 |
| 纯服务器部署 | [SERVER.md](SERVER.md) | 不依赖 Vercel 的完整流程 |

### 推 GitHub → Vercel 快速版

```bash
git init && git add -A && git commit -m "feat: INAUE tea storefront"
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

然后在 Vercel：**Add New → Project → 导入该仓库**（框架自动识别为 Next.js），接着：

1. **Storage → Create Database → Blob → 连接项目**（必做，否则数据不持久）
2. **Settings → Environment Variables** 配 `STORAGE_DRIVER=blob`、`ADMIN_PASSWORD`、`ADMIN_SECRET`
3. 重新部署 → 访问 `https://<域名>/admin`

> 上线后第一件事：后台 → GEO 优化 → 把「站点域名」改成你的域名，
> 否则 `sitemap.xml` / `llms.txt` 里的链接还是默认的 `https://inaue.co`。

数据默认写项目内 `.data/`；设 `STORAGE_DRIVER=blob` 后改存 Vercel Blob（JSON 私有、图片公有），
未配置且文件系统只读时自动转内存模式（可浏览、不持久）。

## 本轮新增

### 1. 页面管理（Banner + 导航）

`/admin/pages`，保存后前台立即生效，不用重新部署。

- **Banner**：新增 / 删除 / 启用停用 / 排序 / 切换位置（首页主视觉、首页促销位段）
  可编辑标题、副标题、按钮文字与链接、图片路径、配色（深绿 / 墨蓝 / 米白）。
  首页按「已启用 + 排序最前」各取一条渲染，没配就回落到默认文案。
- **导航条**：一级菜单与下拉子项都能增删改、控制显示、调整顺序。
  内置项保留多语言键（切语言自动翻译），自定义项按填写的文字原样显示。

数据存 `.data/content.json`，接口 `GET/PUT /api/admin/content`。

### 2. 多图图集（可上传、可拖拽排序）

商品是**图集**而不是单图：`images[]`，第一张即封面（列表卡与购物车用它）。

后台（商品编辑页「商品图片」）：

- **多选上传**，一次拖入多个文件也行；单张 ≤ 8MB，JPG / PNG / WebP / GIF / AVIF。
- **拖拽缩略图排序**，也可以点 ← → 微调（触屏没有原生拖拽时的兜底）；第一张自动标记「封面」。
- 悬停缩略图出现「删除 / 前移 / 后移」，右下角「+」继续加图，「从图库添加」直接挑用内置 21 张图。
- 排序保存后前台封面立即跟着变。

前台（商品详情页）——亚马逊式图集：

- 左侧缩略图竖排、右侧大图，点缩略图或鼠标悬停即切换。
- 大图**悬停局部放大**（1.9 倍，跟随鼠标位置），右下角显示「2 / 3」。
- 移动端自动变成「大图在上、缩略图横排在下」。
- 图集里没有 `images` 的老数据自动回落到单张主图，不会白屏。

上传实现同上：`POST /api/admin/upload` → 落 `.data/uploads/` → `/media/<文件名>` 提供，一年 immutable 缓存。

> 标题是中文时请顺手填一个拼音/英文「链接标识」，否则会自动生成 `item-xxxx` 兜底——非拉丁字符在 URL 与分享链接里不可靠，这点在表单里有提示。

### 3. GEO 优化（生成式引擎优化）

`/admin/geo`。目标是被 ChatGPT、Perplexity、Google AI 概览这类引擎正确理解与引用。

后台可维护：品牌实体（名称、标语、一句话简介、深度介绍、关键词、站点域名）、
结构化事实（成立时间 / 产地 / 认证…）、FAQ、是否允许 AI 爬虫。右上角是实时检查清单（8 项打分）。

由此自动生成并按需实时更新：

| 产出 | 说明 |
| --- | --- |
| `/llms.txt` | 品牌摘要 + 关键事实 + 栏目 + 商品清单 + FAQ，给 AI 的首选入口 |
| `/llms-full.txt` | 加长版：含全部商品规格、冲泡参数、客服与运费规则 |
| `/sitemap.xml` | 首页、集合、全部商品、llms.txt |
| `/robots.txt` | 常规爬虫放行、屏蔽后台与接口；`allowAiCrawlers` 关闭时整体屏蔽 GPTBot / ClaudeBot / PerplexityBot 等 |
| JSON-LD | 全站 `Organization` + `WebSite`，商品页 `Product`（含 offer 价格与库存状态），首页 `FAQPage` |

### 4. 后台中文化

后台界面全部改为简体中文（导航、表单、提示、空状态、校验消息）。数据内容（商品名、Banner 文案）保持原样，不强行翻译。

### 5. 多语言（7 种，含阿拉伯语 RTL）

| 语言 | 代码 | 方向 |
| --- | --- | --- |
| English | `en` | LTR |
| 繁體中文 | `zh-TW` | LTR |
| 日本語 | `ja` | LTR |
| 한국어 | `ko` | LTR |
| Español | `es` | LTR |
| Português | `pt` | LTR |
| العربية | `ar` | **RTL** |

- 右上角语言切换器（移动端收进菜单），locale 存 `inaue_locale` cookie，切换即时生效。
- 199 个 UI 键 × 7 语言，全部人工撰写而非机翻直出：`lib/i18n/dictionaries/`。
- 插值占位符 `{amount} {count} {term} {name} {id} {date} {email} {currency} {fields}` 全语言一致，键序与英文基准完全相同。
- 阿拉伯语切换时 `<html dir="rtl">`，布局整体镜像：页头导航、购物车抽屉（从左侧滑出）、价格与图标顺序。
- 商品文案（名称/描述）当前保留英文——这是商品数据不是 UI 文案，后续可接翻译服务或后台逐条录入。

### 6. 管理后台

| 页面 | 能力 |
| --- | --- |
| `/admin/login` | 密码登录，HMAC 签名 session cookie，12 小时过期，错误的密码有恒定时间比较 |
| `/admin` | 商品数 / 订单数 / 营业额 / 客单价、最近订单、店铺设置摘要 |
| `/admin/products` | 商品列表（缩略图、handle、集合、价格、徽标） |
| `/admin/products/new` | 新建：标题、handle、规格与价格（可多行）、文案、**多图上传 / 拖拽排序 / 图库选择**、集合标签、咖啡因、产地 |
| `/admin/products/[handle]` | 编辑 / 删除，保存后 storefront 立即生效 |
| `/admin/orders`、`/admin/orders/[id]` | 订单列表与详情（明细、金额、地址、支付说明） |
| `/admin/pages` | 页面管理：Banner 与导航条增删改 |
| `/admin/geo` | GEO 优化：品牌实体、事实、FAQ、检查清单、抓取入口 |
| `/admin/settings` | 公告栏文案、客服邮箱与工时、免运费门槛、税率——改完即时影响购物车进度条、运费、税额 |

鉴权与数据：

- session 用 `ADMIN_SECRET` 做 HMAC 签名，`httpOnly` + `sameSite=lax`。
- 所有 `/api/admin/*` 独立校验，未登录返回 401；`/admin/*` 页面未登录跳 `/admin/login`。
- 商品在 `.data/products.json`（首次自动播种），页面内容 `.data/content.json`，GEO `.data/geo.json`，
订单 `.data/orders.json`，设置 `.data/settings.json`。写入先写临时文件再 rename，避免半截文件。

### 3. 结构

前后台拆成两个根布局（route group），管理页面不会套上商店的页眉页脚：

```
app/(store)/     商店：layout 带页头/页脚/购物车/i18n provider
app/(admin)/     后台：独立 layout，侧边栏
app/api/         商店与后台 API
lib/i18n/        config / dictionaries(en+6) / format / server / client
lib/storefront/  commerce 接口：mock（文件存储）/ shopify 适配器
lib/admin/       鉴权、商品归一化
```

## 已实现（累计）

| 能力 | 说明 |
| --- | --- |
| 商品数据 | 服务端查询，集合 / 咖啡因筛选 / 排序 / 搜索，后台可增删改 |
| 购物车 | 服务端持久化，加购 / 改量 / 删除 / 免运费进度 |
| 结账 | 地址校验、标准/加急运费、税率可配、订单号生成 |
| 订单确认 | 明细、金额、收货地址、后续流程 |
| 多币种 | USD / EUR / GBP，服务端换算，cookie 记忆 |
| 多语言 | 7 语言 + RTL，199 键 |
| 后台 | 登录、仪表盘、商品 CRUD、订单、设置 |

## 页面

`/` · `/collections/[handle]` · `/products/[handle]` · `/search` · `/checkout` · `/checkout/success` · `/admin/*`

## 设计变量（从参考站提取）

`--color-ink #283645` · `--color-forest #17453a` · `--color-tan #a88667` · `--color-bone #fbf9f4`
标题 Instrument Serif（对应 IvyPresto Headline）· 正文 Inter（对应 Neue Haas Grotesk）

## 测试

```
npm run e2e
```

| 套件 | 覆盖 |
| --- | --- |
| `e2e.mjs` | 13 项：品牌渲染、加购、抽屉、服务端购物车、结账、下单、金额、切币种、搜索、筛选、**图集缩略图与切换**、无报错 |
| `e2e-admin.mjs` | 20 项：英文默认、日文生效、阿语 RTL、繁体集合页、密码校验、仪表盘、图片上传与访问、拒绝非图片、**图集排序保存后封面同步**、商品创建→前台可见→改价→删除、设置影响前台、匿名 401、匿名跳登录 |
| `e2e-geo.mjs` | 17 项：llms.txt / llms-full.txt / sitemap / robots、首页 FAQPage 与 Organization、商品 Product、后台中文、页面管理保存后前台生效、GEO 保存后 llms 与结构化数据同步 |

当前 **50/50 通过**，`npx tsc --noEmit` 干净。

## 真实上线的缺口

- 未接真实支付（结账到订单确认页为止，不扣款）
- 无用户账号体系、无库存扣减、无订单状态流转与发货
- 商品图片仍为 AI 生成，非真实产品摄影
- 数据默认存本地 JSON；Vercel 上需 `STORAGE_DRIVER=blob`。购物车每加一件都会写一次 Blob，生产建议换 Postgres/Redis
- 无并发写入锁：两个后台同时保存会互相覆盖
- 上传图片未做压缩与转 WebP（无 sharp 依赖），大图会原样落盘，生产建议接对象存储 + 图像处理
- 图集每张图还没有独立 alt 文案（SEO 可加），目前统一用商品名
- 后台只有单一密码，无多用户/角色/审计日志
- 商品文案与 Banner 文案未翻译（仅 UI 文案走语言包），如需全站多语言要接翻译或逐语言录入
- GEO 只做了「结构化 + 可抓取」，没有内容分发与外部引用建设（那部分是运营动作）
- 税费为固定税率，未接税率服务；运费仅两档固定值
