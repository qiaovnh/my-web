# INAUE 部署到 Vercel

最快上线路线。免费额度够跑这种小型电商站,不用运维。

---

## 先说清一个硬约束

**Vercel 的 Serverless 函数文件系统是只读的**,项目里的 `.data/` 写不进去。

受影响的还有 4 件事:

| 数据 | 默认存放 | Vercel 上会怎样 |
|---|---|---|
| 商品 | `.data/products.json` | 写不进去 |
| 订单 | `.data/orders.json` | 写不进去 |
| 店铺设置 / GEO | `.data/settings.json` `.data/geo.json` | 写不进去 |
| 上传的图片 | `.data/uploads/` | 写不进去,部署后全丢 |

项目已经内置了降级:检测到只读文件系统就自动转内存模式,**站点仍能正常浏览和下单,但实例重启数据即丢**。
控制台会打印明确警告。所以**不配 Blob 的话,后台保存会"看起来成功、刷新就变回去"**。

**结论:要在 Vercel 上真用,必须配 Vercel Blob。**

---

## 步骤 1：准备

```bash
npm i -g vercel
vercel login
```

> ⚠️ 如果你环境里有 `VERCEL_TOKEN` 变量,会覆盖 CLI 的登录态,报 "token is not valid"。
> 解决:`unset VERCEL_TOKEN`。

### 用 Token 登录（推荐，无需交互）

浏览器 OAuth 登录在无头/远程环境下不可用。改用 Personal Access Token：

1. 打开 <https://vercel.com/account/tokens> → **Create Token**
2. 生成后执行：

```bash
vercel login --token <你的token>
```

Token 会存到 `~/Library/Application Support/com.vercel.cli/auth.json`，之后所有 `vercel` 命令自动带上。

### 网络受限时的处理

某些网络环境（代理策略、机房 IP）会拦截 `api.vercel.com`，表现为命令卡住或超时。
Vercel CLI 支持切换 API 域名，改用可达的备用端点即可：

```bash
# 全局配置（一次性）
vercel config set api https://api-us.vercel.com
# 或写入 ~/Library/Application Support/com.vercel.cli/config.json 的 "api" 字段

# 单次命令
vercel deploy --prod --api https://api-us.vercel.com
```

验证是否通：

```bash
vercel api /v2/user --token <你的token> --api https://api-us.vercel.com
```

返回 `"username"` 就说明链路正常。

### 一键部署

仓库里内置了脚本，自动完成 token 校验、项目关联、API 域名切换：

```bash
VERCEL_TOKEN=<你的token> ./scripts/deploy-vercel-now.sh
```

---

## 步骤 2：关联项目

```bash
cd inaue
vercel
```

首次会问几个问题:

| 问题 | 选什么 |
|---|---|
| Project name | `inaue` 或你喜欢的 |
| Framework | **Next.js**(自动识别,别改) |
| Directory | 根目录 |

> 这个目录不是 git 仓库。如果 `vercel` 没自动识别框架,建一个 `vercel.json`:
> ```json
> { "$schema": "https://openapi.vercel.sh/vercel.json", "framework": "nextjs" }
> ```

---

## 步骤 3：创建 Blob 存储（**最关键的一步**）

Dashboard → 你的项目 → **Storage** → **Create Database** → **Blob** → **Connect to Project**

连接后 `BLOB_READ_WRITE_TOKEN` 会**自动注入**到项目环境变量,不用手填。

---

## 步骤 4：设置环境变量

Dashboard → **Settings** → **Environment Variables**,下面 4 项都要加,
并且 **Production / Preview / Development 三个环境都勾上**:

| 变量 | 值 |
|---|---|
| `STORAGE_DRIVER` | `blob` |
| `BLOB_READ_WRITE_TOKEN` | Blob 连接后自动注入,不用手填 |
| `ADMIN_PASSWORD` | 你的强密码(**不能用默认的 `inaue-admin`**) |
| `ADMIN_SECRET` | 32 位以上随机串 |

生成随机密钥:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> 环境变量改动**需要重新部署才生效**。

---

## 步骤 5：部署

```bash
cd inaue
vercel --prod
```

或者用我准备好的脚本,它会检查前置条件、跑一次 Vercel 模式构建、再部署:

```bash
bash scripts/deploy-vercel.sh --prod
```

---

## 步骤 6：上线后必做

1. 打开 `https://你的域名/admin`,用新密码登录
2. **后台 → GEO 优化 → 把「站点域名」改成你的域名**
   默认是 `https://inaue.co`,不改的话 `sitemap.xml`、`llms.txt` 里的链接全是错的
3. 建一个商品 → 刷新 → 还在 → 说明 Blob 生效
4. 上传一张图 → 图片地址应该是 `*.public.blob.vercel-storage.com` → 说明图片走 Blob
5. 下一单 → `/admin/orders` 有记录
6. 访问 `/llms.txt`、`/sitemap.xml`、`/robots.txt` 确认正常

---

## 我已经替你处理的两个坑

### 坑 1：`output: 'standalone'` 会让 Vercel 全站 404

这个项目要支持两种部署目标:

- **自建服务器 / Docker** → 需要 `output: 'standalone'`,才能打出 19MB 精简独立运行包
- **Vercel** → **必须关掉**,它的构建器接管运行,开着会导致「构建成功但全站 404」

我改了 `next.config.ts`,按环境变量区分:

```typescript
...(process.env.VERCEL ? {} : { output: 'standalone' as const }),
```

Vercel 构建时会注入 `VERCEL=1`,自动走 Vercel 模式;本地/服务器构建则保留 standalone。

实测:`VERCEL=1 npm run build` → **不生成 `.next/standalone`**,行为正确。

### 坑 2：Next.js 16.3 + standalone 在 Vercel 上构建崩溃

有个已知 bug(vercel/next.js#96646):Next.js 16.3 配合 `output: 'standalone'` 会报
`ENOENT: no such file or directory, open '/next-server.js.nft.json'`。

**你这个项目用的是 16.4.6,已经在 16.3.x 上回合修复(#98167)。**
我用模拟 adapter 注入的方式实测过构建,通过。

不过我上面那个条件写法同时规避了这个风险 —— Vercel 下压根不开 standalone。

---

## 商品数据从哪来?

不用担心。`.data/` 虽然被 gitignore、传不上去,但商品目录有两层:

1. **静态种子**:`lib/products.ts` 里硬编码了 13 个商品(375 行),这个文件在代码里,**会正常上传**
2. **首次运行自动播种**:`product-store.ts` 检测到 `.data/products.json` 不存在时,自动把种子写入

所以 Vercel 上第一次访问就能看到完整商品列表。

> 但要注意:这个播种只发生在**第一次**。之后后台改的商品会写进 Blob。
> 如果你后续在后台调整了商品,那些改动**只存在于 Blob 里**,不会回写到 `lib/products.ts`。
> 想让代码里的种子保持最新,得手动同步。

---

## 免费额度够吗?

| 项目 | 免费额度(Hobby) | 够不够 |
|---|---|---|
| 流量 | 100 GB/月 | 够 |
| Serverless 执行 | Hobby 有软上限 | 小站够用 |
| Blob 存储 | 500 MB | 够 |
| Blob 流量 | 与总流量共享 | 够 |

图片全部走 `images: { unoptimized: true }`,即原图直出不做优化。
21 张图共 6.4MB,单页加载约 300-500KB,可接受。

**真要上量,建议开 `sharp` 做图片压缩和 WebP 转换** —— 现在每张图都是 200-490KB 的原图 JPEG。

---

## 常见问题

| 现象 | 原因 / 解决 |
|---|---|
| 后台保存后刷新变回去 | 没配 Blob。配 `STORAGE_DRIVER=blob` + 连接 Blob 后**重新部署** |
| 上传的图片部署后全丢 | 同上。图片要存 Blob 才会持久 |
| 构建成功但全站 404 | `output: 'standalone'` 没关掉。检查 `next.config.ts` 的条件写法 |
| `vercel` 报 token is not valid | 有 `VERCEL_TOKEN` 环境变量干扰,`unset VERCEL_TOKEN` |
| 构建报 ENOENT next-server.js.nft.json | Next.js 16.3 的 bug,升级到 16.4.6+ 或关掉 standalone |
| CLI 部署全部 404 | 没识别出框架,加 `vercel.json` 指定 `"framework": "nextjs"` |
| 购物车每次操作都很慢 | 每加一件都写一次 Blob。生产建议换 Postgres/Redis |

---

## 什么时候该换数据库

Blob 方案能跑,但它不是数据库:

- 购物车每次加减都触发一次网络写,延迟明显
- 没有事务、并发控制、索引
- 多实例并发写会互相覆盖

出现下面情况该换 Postgres(Neon / Supabase):

- 订单量上千,需要查询统计
- 多个后台同时编辑
- 需要扣库存(要事务)

**改动只集中在 `lib/storefront/db.ts`** —— 把 `readJson` / `writeJson` 换成 SQL 实现,上层接口完全不变。
存储驱动是当初刻意抽象好的口子。

---

## 两种路线怎么选

| | Vercel | 自建服务器 |
|---|---|---|
| 上线速度 | 快,一条命令 | 慢,要配 VPS + Nginx + 证书 |
| 运维成本 | 零 | 要自己管系统更新、备份、监控 |
| 数据存储 | 必须用 Blob(外部依赖) | 本地文件,完全可控 |
| 性能 | 边缘网络,全球快 | 取决于机房 |
| 成本 | 免费额度内 0 元 | VPS 月付几十块 |
| 访问速度 | CDN 自动分发 | 需自己配 CDN |

**建议:先上 Vercel 验证业务(几小时能跑通),等有真实订单和稳定流量后再迁到自建服务器。**
迁移成本很低 —— `lib/storefront/db.ts` 换个实现就行,业务代码一行不动。
