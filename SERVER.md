# 部署到自己的服务器

适用：一台你能 SSH 的 Linux 服务器（VPS / 云主机 / 内网机器）。
不需要 Vercel，也不需要数据库——数据和图片都存在项目目录的 `.data/` 里。

---

## 0. 前提

| 项 | 要求 |
| --- | --- |
| Node.js | ≥ 20（`node -v` 确认） |
| 磁盘 | 至少 1 GB（node_modules 约 400 MB） |
| 端口 | 默认 3210，可用 `PORT` 改 |

---

## 1. 上传并解压

```bash
scp inaue-site-YYYYMMDD-HHMM.tar.gz user@your-server:/var/www/
ssh user@your-server
cd /var/www
tar -xzf inaue-site-YYYYMMDD-HHMM.tar.gz
cd inaue-site-YYYYMMDD-HHMM
```

## 2. 配置环境变量

```bash
cp .env.example .env
vi .env
```

至少要改这三行：

```ini
STORAGE_DRIVER=local          # 自建服务器用本地目录，不需要 Blob
ADMIN_PASSWORD=换成你的强密码
ADMIN_SECRET=换成32位以上随机串
```

生成密钥：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3. 安装并构建

```bash
npm ci          # 按 lockfile 精确安装
npm run build
```

## 4. 启动

先前台跑一次确认没问题：

```bash
PORT=3210 npm start
```

浏览器打开 `http://服务器IP:3210`，能看到首页就成功了。

---

## 5. 常驻运行

### 方式 A：pm2（最省事）

```bash
npm i -g pm2
PORT=3210 pm2 start npm --name inaue -- start
pm2 save
pm2 startup        # 按提示执行它输出的那行命令，实现开机自启
```

常用：

```bash
pm2 logs inaue
pm2 restart inaue
pm2 status
```

### 方式 B：systemd

`/etc/systemd/system/inaue.service`：

```ini
[Unit]
Description=INAUE storefront
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/inaue-site-XXXX
Environment=PORT=3210
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now inaue
sudo systemctl status inaue
```

---

## 6. Nginx 反向代理（可选，但要域名就必须做）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 后台上传图片最多 8MB，这里留余量
    client_max_body_size 12m;

    location / {
        proxy_pass http://127.0.0.1:3210;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

HTTPS 用 certbot：

```bash
sudo certbot --nginx -d your-domain.com
```

---

## 7. 上线后必做

1. 打开 `https://你的域名/admin`，用 `.env` 里的密码登录
2. **改 GEO 设置里的「站点域名」**（默认 `https://inaue.co`），否则 sitemap / llms.txt 链接是错的
3. 建一个商品 → 刷新还在 → 说明 `.data/` 可写
4. 上传一张图 → 前台能看到
5. 下一单 → `/admin/orders` 有记录
6. 访问 `/llms.txt`、`/sitemap.xml`、`/robots.txt`

---

## 8. 备份

数据全在 `.data/`，直接打包即可：

```bash
cd /var/www/inaue-site-XXXX
tar -czf ~/inaue-backup-$(date +%F).tar.gz .data/
```

恢复就解压覆盖回 `.data/`，再 `pm2 restart inaue`。

建议加个每日定时任务：

```bash
crontab -e
0 3 * * * cd /var/www/inaue-site-XXXX && tar -czf /var/backups/inaue-$(date +\%F).tar.gz .data/
```

---

## 9. 常见问题

| 现象 | 原因 / 解决 |
| --- | --- |
| 后台保存后刷新又变回去 | `.data/` 没有写权限，`chown -R www-data:www-data .data` 或 `chmod 775 .data` |
| 上传图片报 413 | Nginx 的 `client_max_body_size` 太小，调到 12m |
| 上传成功但前台不显示 | 检查 `.data/uploads/` 是否有文件；`/media/<文件名>` 能否直接访问 |
| 端口被占用 | 换 `PORT=3211`，或 `lsof -i:3210` 找到旧进程 |
| 样式错乱 / 404 | 没执行 `npm run build`，或构建后改了代码需重新 build |
| 后台密码忘了 | 改 `.env` 里的 `ADMIN_PASSWORD` 后重启进程 |
| 数据丢了 | 从 `.data/` 备份恢复；重新部署不会覆盖 `.data/` |

---

## 10. 什么时候该换数据库

当前存储是 JSON 文件，够用到单机、少量并发。出现下面任一情况就该换 Postgres（Neon / Supabase / 自建）：

- 多个后台账号同时编辑
- 订单量上千，需要查询与统计
- 需要多台服务器负载均衡
- 需要事务（扣库存）

改动只集中在 `lib/storefront/db.ts`：把 `readJson / writeJson` 换成 SQL 实现，上层接口不变。
