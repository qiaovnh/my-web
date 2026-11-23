# GitHub → Vercel 发布清单

代码已推送完成：<https://github.com/qiaovnh/my-web>（分支 `main`，150 个文件，最新提交 `1a3d8ab`）。

从第 2 步开始走即可上线。

---

## 第 1 步：建 GitHub 仓库并推送 ✅ 已完成

仓库地址：<https://github.com/qiaovnh/my-web>

```bash
cd "/Volumes/AI/网站"
git remote add origin https://github.com/qiaovnh/my-web.git
git push -u origin main
```

以后每次推送可以直接用：

```bash
./scripts/push-now.sh
```

它会自动检测 SSH 公钥 / PAT 两种认证方式并推送。

---

## 第 2 步：Vercel 导入项目

1. 打开 <https://vercel.com/new>
2. 用 GitHub 账号登录，授权访问仓库
3. **Add New → Project**，选中 `qiaovnh/my-web` 仓库
4. 确认配置：
   - Framework Preset：**Next.js**（自动识别，别改）
   - Build Command：`npm run build`（自动）
   - Output Directory：留空（自动）
   - Install Command：`npm ci`（自动）
5. 点 **Deploy**

> 先部署一次。此时还没配 Blob，数据会走内存模式——不影响你看效果。

---

## 第 3 步：配 Blob 存储（**必做，否则数据不持久**）

Vercel 的 Serverless 函数文件系统只读，`.data/` 写不进去。

1. Dashboard → 你的项目 → **Storage** → **Create Database** → **Blob**
2. 选一个名字（比如 `inaue-blob`），点 **Connect**
3. 选 **Production / Preview / Development** 三个环境都连接
4. 连接后 `BLOB_READ_WRITE_TOKEN` 会自动注入环境变量

---

## 第 4 步：配环境变量

Dashboard → **Settings** → **Environment Variables**，加这 4 个：

| Key | Value | 说明 |
|---|---|---|
| `STORAGE_DRIVER` | `blob` | 让数据走 Blob |
| `BLOB_READ_WRITE_TOKEN` | 自动注入 | 上一步连 Blob 后自动出现，不用手填 |
| `ADMIN_PASSWORD` | 你的强密码（≥8 位） | **不能用默认 `inaue-admin`** |
| `ADMIN_SECRET` | 32 位以上随机串（≥16 位） | 生成：`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

**Production / Preview / Development 三个环境都要勾上。**

> 🔒 **这两个变量现在是强制的。** 代码已加保护：生产环境（Vercel 或 `NODE_ENV=production`）下，
> 如果 `ADMIN_PASSWORD` / `ADMIN_SECRET` 没配、是默认值、或者长度不够，
> 后台登录接口会直接返回 **503 `ADMIN_NOT_CONFIGURED`**（而不是放行）。
> 这是为了防止漏配一次就把管理后台暴露在公网上——之前的行为是静默回退到 `inaue-admin`。
>
> 顺带一提，现在 session cookie 在生产环境也带上了 `secure` 属性。

改完环境变量必须**重新部署**才生效：

```bash
cd "/Volumes/AI/网站"
npx vercel --prod --force
```

### 用命令行部署（可选）

如果你的网络环境访问 `api.vercel.com` 超时，用仓库内置的脚本，它会自动切换到可达的备用 API 域名：

```bash
# 1. 生成 token：https://vercel.com/account/tokens
# 2. 登录
vercel login --token <你的token>

# 3. 部署
./scripts/deploy-vercel-now.sh
```

---

## 第 5 步：上线后必做的检查

1. **后台登录**：打开 `https://<你的域名>/admin`，用新密码登录
2. **改站点域名**（最容易漏）：后台 → **GEO 优化** → 把「站点域名」改成你的域名
   > 默认是 `https://inaue.co`，不改的话 `sitemap.xml` 和 `llms.txt` 里的链接全是错的
3. **验证 Blob 生效**：建一个商品 → 刷新页面 → 商品还在
4. **验证图片**：上传一张图 → 图片地址应是 `*.public.blob.vercel-storage.com`
5. **验证下单**：下一单 → `/admin/orders` 能看到记录
6. **GEO 文件**：访问 `/llms.txt`、`/sitemap.xml`、`/robots.txt`

---

## 之后每次改代码怎么发布

```bash
cd "/Volumes/AI/网站"
git add -A && git commit -m "你的说明"
git push
```

GitHub 集成开启后，**push 会自动触发 Vercel 重新部署**，不用手动操作。

> 注意：自动部署只更新**代码**。如果你在后台改了商品或传了图，那些数据在 Blob 里，不受影响。

---

## 备选：不装 vercel CLI，用 Dashboard 导入

上面的步骤完全可以在浏览器里完成，不需要命令行工具：

<https://vercel.com/new> → 选仓库 → Deploy → 然后做第 3、4 步。

唯一需要 CLI 的场景是想在本地预览部署结果。

---

## 出问题时的排查

| 现象 | 原因 / 解决 |
|---|---|
| 构建失败，报 `npm ci` 错误 | `package-lock.json` 与 `package.json` 不同步。本地跑 `npm install --package-lock-only` 后重新提交 |
| 构建成功但全站 404 | 检查 `next.config.ts` 里的 `process.env.VERCEL` 条件判断，以及 `vercel.json` 里有没有 `"framework": "nextjs"` |
| 构建报 ENOENT `next-server.js.nft.json` | Next.js 16.3 的 bug。已锁死 `next: 16.4.6`（含修复），确认 lockfile 同步 |
| 后台保存后刷新变回去 | 没配 Blob，或配完没重新部署 |
| 上传的图片部署后消失 | 同上 |
| `vercel` 报 token is not valid | 有 `VERCEL_TOKEN` 环境变量干扰，`unset VERCEL_TOKEN` |
| 部署成功但没有数据 | 商品目录来自 `lib/products.ts` 静态种子，首次运行会自动播种。如果仍空，检查构建日志有没有报错 |

---

## 关于数据安全

`.data/` 目录（商品、订单、设置、上传的图片）**不在 Git 里**，这是故意的——订单含邮箱地址，属于敏感数据。

需要备份时用：

```bash
bash scripts/export.sh
```

会在 `dist/` 生成两个文件：
- `inaue-site-<时间>.tar.gz` —— 含代码与 `.data` 的完整包
- `inaue-data-<时间>.json` —— 纯数据快照，方便跨环境导入

上线到 Vercel 后数据在 Blob 里，导出脚本导出的仍是**本地**数据，两者不同步。
Vercel 上要备份就直接导出 Blob 里的 JSON 文档。
