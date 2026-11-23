# GitHub → Vercel 发布清单

代码已推送完成：<https://github.com/qiaovnh/my-web>（分支 `main`，151 个文件）。

**当前状态（2026-11-23）：**

| 事项 | 状态 |
|---|---|
| Vercel 项目 `inaue` | ✅ 已创建（`prj_mjsuy1vmwpsd5rb3qagr1ccyVeGm`） |
| 生产部署 | ✅ 已上线 → <https://inaue.vercel.app> |
| Blob 存储 | ✅ `inaue-private`（**private**），已连三环境 |
| 环境变量 | ✅ 10 个已注入（Blob ×1 + STORAGE_DRIVER + ADMIN_PASSWORD + ADMIN_SECRET） |
| GitHub 自动部署 | ⏳ **待办**：Vercel 侧的 GitHub 集成还没授权 |

---

## 第 1 步：建 GitHub 仓库并推送 ✅ 已完成

仓库地址：<https://github.com/qiaovnh/my-web>

以后每次推送可以直接用：

```bash
cd "/Volumes/AI/网站"
./scripts/push-now.sh
```

它会自动检测 SSH 公钥 / PAT 两种认证方式并推送。

> ⚠️ 如果 PAT 报 `Invalid username or token`，说明 token 过期或被撤销了，
> 去 <https://github.com/settings/tokens> 重新生成一个（需 `repo` 权限），
> 然后 `export GITHUB_TOKEN=<新token>` 再跑脚本。

---

## 第 2 步：开启 GitHub 自动部署 ⏳ **待办**

部署本身已经能用了（CLI 直接传代码上 Vercel），但要实现「push 即自动部署」，
还需要在 Vercel 侧授权 GitHub：

1. 打开 <https://vercel.com/qiaovnhs-projects/inaue/settings/git>
2. 点 **Connect Git Repository**
3. 授权 Vercel 访问 GitHub（如果列表里没有 `qiaovnh/my-web`，先去
   <https://github.com/settings/installations> 给 Vercel 这个 App 装上仓库权限）
4. 选 `qiaovnh/my-web`，Production Branch 选 `main`，保存

之后 `git push` 就会自动触发生产部署。

> 也可以用 CLI：`vercel git connect https://github.com/qiaovnh/my-web.git --yes`
> 但前提是 Vercel 账号已经授权过 GitHub 集成。**目前这个账号还没授权**
> （API 查 `user.github` 返回 `null`），所以 CLI 这条路现在会报
> `repo_not_found`——不是仓库不存在，是集成没授权。

---

## 第 3 步：配 Blob 存储 ✅ 已完成

Vercel 的 Serverless 函数文件系统只读，`.data/` 写不进去，所以必须用 Blob。

**已配置：**

| 项 | 值 |
|---|---|
| Store 名称 | `inaue-private` |
| Store ID | `store_Yr9MwSadYTSKlsgj` |
| 访问级别 | **private** |
| 区域 | `iad1` |
| 已连环境 | production / preview / development |

> ⚠️ **必须是 private。** 订单 JSON 里含姓名、电话、收货地址、邮箱，
> public store 的对象可通过直链免鉴权访问——等于把客户 PII 公开挂网上。
> private store 的对象没有公开直链，图片由本站 `/media` 路由代理输出。

命令记录（以后重建项目可以照抄）：

```bash
vercel blob create-store inaue-private --access private --yes
```

查看连接状态：

```bash
vercel storage status
```

---

## 第 4 步：配环境变量 ✅ 已完成

| Key | Value | 说明 |
|---|---|---|
| `BLOB_READ_WRITE_TOKEN` | 自动注入（encrypted） | storage connect 自动写入，三环境 |
| `STORAGE_DRIVER` | `blob` | 让数据走 Blob |
| `ADMIN_PASSWORD` | 强随机串（≥8 位） | **不能用默认 `inaue-admin`** |
| `ADMIN_SECRET` | 40 位 hex（≥16 位） | 生成：`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

**Production / Preview / Development 三个环境都已勾上。**

> 🔒 **这两个变量是强制的。** 代码已加保护：生产环境（Vercel 或 `NODE_ENV=production`）下，
> 如果 `ADMIN_PASSWORD` / `ADMIN_SECRET` 没配、是默认值、或者长度不够，
> 后台登录接口会直接返回 **503 `ADMIN_NOT_CONFIGURED`**（而不是放行）。
> 这是为了防止漏配一次就把管理后台暴露在公网上——之前的行为是静默回退到 `inaue-admin`。
>
> 顺带一提，现在 session cookie 在生产环境也带上了 `secure` 属性。

改完环境变量必须**重新部署**才生效：

```bash
cd "/Volumes/AI/网站"
npx vercel deploy --prod --force
```

### 用命令行部署

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

1. **后台登录**：打开 <https://inaue.vercel.app/admin>，用配置的密码登录
2. **改站点域名**（最容易漏）：后台 → **GEO 优化** → 把「站点域名」改成 `https://inaue.vercel.app`
   > 默认是 `https://inaue.co`，不改的话 `sitemap.xml` 和 `llms.txt` 里的链接全是错的
3. **验证 Blob 生效**：建一个商品 → 刷新页面 → 商品还在
4. **验证图片**：上传一张图 → 图片地址应是 **`/media/xxx.png`**（本站路径）
   > private store 没有公开直链，图片统一由 `/media/[name]` 代理输出，
   > 所以**不是** `*.blob.vercel-storage.com`，这是正常的
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
| `Invalid vercel.json - should NOT have additional property gitignore` | `vercel.json` 不支持 `gitignore` 字段，已移除 |
| 构建报 ENOENT `next-server.js.nft.json` | Next.js 16.3 的 bug。已锁死 `next: 16.4.6`（含修复），确认 lockfile 同步 |
| 后台保存后刷新变回去 | 没配 Blob，或配完没重新部署 |
| 上传的图片部署后消失 | 同上 |
| `Cannot use private access on a public store` | store 选了 public，但代码要写 private。换 private store（已修复代码兼容问题） |
| `Cannot use public access on a private store` | store 是 private，但代码要写 public。图片上传已改为 private 写入 + `/media` 代理 |
| `vercel` 报 token is not valid | 有 `VERCEL_TOKEN` 环境变量干扰，`unset VERCEL_TOKEN` |
| 部署成功但没有数据 | 商品目录来自 `lib/products.ts` 静态种子，首次运行会自动播种。如果仍空，检查构建日志有没有报错 |
| `repo_not_found`（连 GitHub 仓库时） | Vercel 账号还没授权 GitHub 集成，去 Dashboard → Settings → Git 完成授权 |

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
