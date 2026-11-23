# 部署到 Vercel

## 先说清楚：这版直接推上去会出问题

不是配置问题，是存储设计问题。当前项目把数据写在项目目录下：

```
.data/products.json   .data/orders.json    .data/carts.json
.data/settings.json   .data/geo.json       .data/content.json
.data/uploads/*.jpg
```

Vercel 的 Serverless 函数：

1. **文件系统只读**（`/var/task`），`.data/` 写不进去 → 后台任何保存都会失败；
2. **没有持久磁盘**，就算写到 `/tmp`，实例一冷就没了；
3. **多实例不共享**，A 实例写的 B 实例读不到；
4. 上传的图片写本地 = 部署后全部消失。

所以要么改存储，要么只当静态演示。

本项目已经为此做了两件事：

- **`STORAGE_DRIVER=blob`**：数据改存 Vercel Blob（JSON 私有 blob，图片公有 blob）。
- **未配置时自动降级**：检测到文件系统不可写，转入内存模式——站点仍能正常浏览和下单，
  但重启即丢，控制台会打印明确警告。这样即使忘记配 Blob，也不会 500 白屏。

---

## 方案 A：完整的可写部署（推荐）

### 1. 装 CLI 并登录

```bash
npm i -g vercel
vercel login
```

### 2. 本地先跑通

```bash
npm run build && npm start     # http://localhost:3210
```

### 3. 关联项目

```bash
cd /path/to/项目根目录
vercel            # 首次会问项目名、框架（自动识别 Next.js）
```

### 4. 创建 Blob 存储

Vercel Dashboard → 你的项目 → **Storage** → **Create Database** → **Blob** → 连接到此项目。
连接后 `BLOB_READ_WRITE_TOKEN` 会自动注入到项目环境变量。

### 5. 设置环境变量

Dashboard → **Settings → Environment Variables**（Production / Preview / Development 都勾上）：

| 变量 | 值 | 说明 |
| --- | --- | --- |
| `STORAGE_DRIVER` | `blob` | 数据走 Blob |
| `ADMIN_PASSWORD` | 你的强密码 | 后台登录密码，别用默认的 `inaue-admin` |
| `ADMIN_SECRET` | 32 位以上随机串 | 签名后台 session，换掉默认值 |
| `BLOB_READ_WRITE_TOKEN` | 自动注入 | 不要手填 |

`ADMIN_SECRET` 可以这样生成：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 6. 部署

```bash
vercel --prod
```

或者把仓库推到 GitHub，在 Dashboard 里 **Import Project**，配好环境变量后 Deploy。
框架会被自动识别为 Next.js，不用改 Build Command。

### 7. 部署后必做

1. 打开 `https://你的域名/admin`，用 `ADMIN_PASSWORD` 登录；
2. **改 GEO 设置里的「站点域名」**（默认写的是 `https://inaue.co`），否则 `sitemap.xml`、`llms.txt` 里的链接全是错的；
3. 建一个商品 → 刷新页面 → 还在，说明 Blob 生效；
4. 上传一张图 → 看图片地址是不是 `*.public.blob.vercel-storage.com`；
5. 前台下一单 → `/admin/orders` 能看到；
6. 访问 `/llms.txt`、`/sitemap.xml`、`/robots.txt` 确认可访问。

---

## 方案 B：只做演示

不配 Blob 也能部署，站点能看、能浏览商品、能加购下单——**但所有改动在实例重启后消失**，
后台保存会写进内存并打印警告。适合给客户看版式，不适合真用。

```bash
vercel --prod
```

---

## 已知限制（上线前请评估）

| 项 | 影响 | 建议 |
| --- | --- | --- |
| 每次写 JSON = 一次 Blob 上传 | 购物车每次加减都触发一次网络写，偏慢 | 正式把购物车/订单换 Postgres 或 Redis |
| Blob 私有访问 | `access: 'private'` 需要存储支持；若你的环境不支持会写入失败 | 订单含邮箱地址，**不要**退化成公有 blob |
| 无并发控制 | 两个后台同时保存会互相覆盖 | 换 Postgres 行级锁 / KV 事务 |
| 图片未压缩 | 图集多图后页面偏重 | 接图像处理或在后台加压缩 |
| 单密码后台 | 无法分角色、无审计 | 正式换成多用户 + 审计日志 |

要把购物车/订单换成 Postgres（Neon / Supabase），改动集中在 `lib/storefront/db.ts`：
把它换成 SQL 实现即可，上层 `readJson / writeJson` 接口不变。

---

## 附：本地验证部署形态

```bash
STORAGE_DRIVER=blob BLOB_READ_WRITE_TOKEN=xxx npm run build && npm start
```

或者直接 `vercel dev` 用 Vercel 的运行时本地跑一遍（会读 `.env.local`）。
