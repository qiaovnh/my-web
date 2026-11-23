# INAUE 部署指南（自建服务器 / 让外网访问）

这份文档写给"我有一台服务器，想让这个站能被外网访问"的场景。
所有步骤我都在本地完整验证过，包括真实下单落盘。

---

## 先说结论：三种可行路线

| 路线 | 成本 | 难度 | 适合 |
|---|---|---|---|
| **A. 自建服务器 + Nginx**（推荐） | 一台 VPS（月付几十块） | 中 | 想完全掌控数据，长期运营 |
| **B. Vercel** | 免费额度够用 | 低 | 快速上线、不想运维 |
| **C. 家用宽带 + 内网穿透** | 0 元 | 中 | 临时演示、给客户看 |

下面的 **A 路线**是重点。另外两条在文末给命令。

---

## A 路线：自建服务器

### 为什么要打包而不是直接传源码？

传源码（`dist/inaue-site-*.tar.gz`）也行，但服务器上要 `npm ci`（约 400MB、几分钟）+ `npm run build`（要装构建依赖）。
所以我写了个打包脚本，产物是 **19MB 的 standalone 包**，服务器上**不用装任何依赖、不用编译**，解压就能跑。

### 步骤 0：服务器准备

```bash
# 需要一台能 SSH 的 Linux 服务器（阿里云/腾讯云/Vultr/DigitalOcean 都行）
# 系统建议 Ubuntu 22.04+ 或 Debian 12+
# 最低配置：1核1G、20G 硬盘（实测 node 运行时约 120MB 内存）
```

在服务器上装 Node.js（≥20）：

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs nginx
node -v    # 确认 v20 以上
```

### 步骤 1：本地打包

我在项目里加好了脚本：

```bash
cd inaue
bash scripts/deploy-selfhosted.sh
```

产物：`dist/inaue-deploy-<时间戳>.tar.gz`（约 19MB）

> 这个脚本会执行 `npm run build`，所以它需要先把 `next.config.ts` 里的
> `output: 'standalone'` 打开（我已经改好了）。

### 步骤 2：上传

```bash
scp dist/inaue-deploy-<时间戳>.tar.gz root@你的服务器IP:/var/www/
```

### 步骤 3：服务器上解压并配置

```bash
ssh root@你的服务器IP
cd /var/www
tar -xzf inaue-deploy-20261123-1422.tar.gz
cd inaue-deploy-20261123-1422

# 改生产配置：至少改这两项
vi .env.production
```

`.env.production` 内容：

```ini
STORAGE_DRIVER=local
ADMIN_PASSWORD=改成你的强密码
ADMIN_SECRET=改成32位以上随机串
COMMERCE_PROVIDER=mock
```

生成随机密钥：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 步骤 4：先前台跑一次验证

```bash
chmod +x start.sh
./start.sh
```

看到 `✓ Ready in xxxms` 就对了。另开一个终端：

```bash
curl -I http://127.0.0.1:3210/          # 应返回 200
curl -I http://你的服务器IP:3210/       # 应返回 200
```

> ⚠️ **这一步是外网访问的成败关键。**
> 如果 `127.0.0.1` 通但 IP 不通，是防火墙没开，见下方"常见问题"。
> 确认无误后 `Ctrl+C` 停掉，再进入常驻运行。

### 步骤 5：常驻运行（pm2）

```bash
npm i -g pm2
pm2 start start.sh --name inaue
pm2 save
pm2 startup        # 会输出一条命令，复制执行它，实现开机自启
pm2 logs inaue    # 看日志
```

> 用 systemd 也行，配置见 `SERVER.md`。

### 步骤 6：Nginx 反代 + 域名（想要域名就必须做）

```bash
cp nginx.conf /etc/nginx/conf.d/inaue.conf
vi /etc/nginx/conf.d/inaue.conf      # 把 server_name 改成你的域名
sudo nginx -t && sudo systemctl reload nginx
```

配 HTTPS：

```bash
sudo certbot --nginx -d your-domain.com
```

### 步骤 7：域名解析

去你的域名服务商,把 `A 记录` 指向服务器 IP。解析生效后 `http://your-domain.com` 就能访问了。

---

## 上线后必做的检查

1. **打开 `https://你的域名/admin`**，用新密码登录 —— 确认后台进得去
2. **改 GEO 设置里的「站点域名」**（后台 → GEO 优化）
   默认值是 `https://inaue.co`，不改的话 `sitemap.xml` 和 `llms.txt` 里的链接全是错的
3. **建一个商品 → 刷新页面 → 还在** —— 证明 `.data/` 可写
4. **上传一张图 → 前台能看到**
5. **下一单 → `/admin/orders` 能看到记录**
6. 访问 `/llms.txt`、`/sitemap.xml`、`/robots.txt` 确认正常

---

## 安全提醒（重要）

上线前请务必处理这几条：

### 1. 改掉默认密码

`.env.production` 里的 `ADMIN_PASSWORD` 必须改。默认的 `inaue-admin` 网上一搜就有。

### 2. 只让 Nginx 对外，Node 只监听本地

`start.sh` 里我已经写死 `export HOSTNAME="0.0.0.0"`，这样 3210 端口会直接暴露在公网。
如果你的服务器有公网 IP，建议**改成 `127.0.0.1`**，让 Node 只服务 Nginx：

```bash
# start.sh 里改成
export HOSTNAME="127.0.0.1"
```

同时在云服务商的安全组里**只放行 80/443，不要放行 3210**。

> 顺便解释一个坑：常见写法 `export HOSTNAME="${HOSTNAME:-0.0.0.0}"` 在 Linux/macOS 上
> **兜底永远不生效** —— 因为 `HOSTNAME` 这个环境变量默认就是机器名。
> 结果就是服务只监听主机名，用 IP 访问直接连不上。这个坑我打包时踩过一次，已修。

### 3. 订单号可枚举 → PII 泄露（**建议尽快修**）

`/checkout/success?order=INA-XXXXXXXX` 只凭订单号就能看到完整收货地址、姓名、邮箱。
订单号是「时间戳 base36 + 3 位随机 UUID」，熵很低，遍历成本很低。

修复方向：订单号加长随机段，或订单详情页要求输入下单邮箱才能查看。

### 4. 缺 CSRF 防护

所有 admin API 靠 cookie 认证，但没有 CSRF token，也没校验 Origin。
`sameSite=lax` 能挡住大部分跨站 POST，但属于纵深防御缺失，建议加 Origin 白名单校验。

### 5. 后台只有一个密码

没有多用户、角色、审计日志。任何拿到密码的人都能改价、改商品。
如果要给团队用，建议至少加一层 Nginx Basic Auth 或 IP 白名单。

---

## 常见问题

| 现象 | 原因 / 解决 |
|---|---|
| 本机能访问，IP 访问不了 | 防火墙。`sudo ufw allow 3210/tcp` 或在云服务商安全组放行端口 |
| `127.0.0.1` 通但 IP 不通 | 同上，另外检查 `HOSTNAME` 是否被改成 `127.0.0.1` |
| 后台保存后刷新又变回去 | `.data/` 没写权限：`chown -R $(whoami) .data` 或 `chmod 775 .data` |
| 上传图片报 413 | Nginx `client_max_body_size` 太小，改成 `12m` |
| 上传成功但前台不显示 | 检查 `.data/uploads/` 有没有文件；`/media/<文件名>` 能否直接访问 |
| 样式错乱 / 404 | 静态资源没传全。确认包里有 `.next/static`（`ls .next/static`） |
| 端口被占用 | `lsof -i:3210` 找到旧进程杀掉，或 `PORT=3211` |
| 后台密码忘了 | 改 `.env.production` 的 `ADMIN_PASSWORD`，然后 `pm2 restart inaue` |
| 数据丢了 | 从 `.data/` 备份恢复。**重新部署不会覆盖 `.data/`**，但手工 `rm -rf` 会 |

---

## 数据备份

数据全在 `.data/`，直接打包：

```bash
cd /var/www/inaue-deploy-XXXX
tar -czf ~/inaue-backup-$(date +%F).tar.gz .data/
```

加个每日定时：

```bash
crontab -e
0 3 * * * cd /var/www/inaue-deploy-XXXX && tar -czf /var/backups/inaue-$(date +\%F).tar.gz .data/
```

---

## B 路线：Vercel（最省事）

```bash
npm i -g vercel
cd inaue
vercel --prod
```

**但有个坑**：Vercel 的 Serverless 函数文件系统只读，`.data/` 写不进去。
必须设 `STORAGE_DRIVER=blob` 并在 Dashboard 配好 Blob 存储，
否则后台任何保存都会失败（项目已做降级：写不进去就转内存模式，重启即丢但不会 500）。

Vercel 配置项详见项目里的 `DEPLOY.md`。

---

## C 路线：内网穿透（临时演示用）

家里没服务器也能让外网访问：

```bash
# cloudflared（免费，自带 HTTPS 域名）
cloudflared tunnel --url http://localhost:3210

# 或者 ngrok
ngrok http 3210
```

会给你一个临时公网地址。适合给客户看效果，不适合长期运营
（免费隧道地址会变，且没有持久磁盘）。

---

## 什么时候该换数据库

现在的 JSON 文件存储够用到：单机、少并发、订单量小。

出现下面任一情况就该换 Postgres（Neon / Supabase / 自建）：

- 多个后台账号同时编辑
- 订单量上千，需要查询与统计
- 需要多台服务器负载均衡
- 需要事务（比如扣库存）

**改动只集中在 `lib/storefront/db.ts`**：把 `readJson` / `writeJson` 换成 SQL 实现，上层接口完全不变。
存储驱动已经抽象好了，这是当初刻意留的口子。
