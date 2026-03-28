# 🚀 Cloudflare Workers 部署指南

## ✅ 为什么选择 Cloudflare Workers？

| 特性 | Cloudflare Workers | Netlify Functions |
|------|-------------------|-------------------|
| 免费额度 | 每天 100,000 次 | 每月 125,000 次 |
| 国内访问 | ✅ 快速稳定 | ❌ 部分地区受限 |
| 冷启动 | ✅ 无冷启动 | ❌ 有冷启动 |
| CORS 配置 | ✅ 代码中配置 | ❌ 需要手动配置 |
| 全球 CDN | ✅ 全球分布 | ✅ 全球分布 |

---

## 📋 部署步骤

### 步骤 1：注册 Cloudflare 账号

1. 访问 [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
2. 填写邮箱和密码
3. 验证邮箱

### 步骤 2：安装 Wrangler CLI

```bash
npm install -g wrangler
```

### 步骤 3：登录 Cloudflare

```bash
wrangler login
```

这会打开浏览器，授权 Wrangler 访问您的 Cloudflare 账号。

### 步骤 4：配置项目

#### 4.1 修改 `wrangler.toml`

打开 `wrangler.toml` 文件，修改以下内容：

```toml
name = "memsavor-api"  # 您的 Worker 名称
main = "worker.js"
compatibility_date = "2024-01-01"

# 如果需要使用 KV 存储（可选）
# [[kv_namespaces]]
# binding = "DB"
# id = "your-kv-namespace-id"
```

#### 4.2 查看您的子域名

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 点击右侧的 **"Workers & Pages"**
3. 您会看到您的子域名，格式为：`your-subdomain.workers.dev`

### 步骤 5：本地测试（可选）

```bash
wrangler dev
```

访问 `http://localhost:8787/mountains` 测试 API。

### 步骤 6：部署到 Cloudflare

```bash
wrangler deploy
```

部署成功后，您会看到类似输出：

```
✨ Successfully published your Worker to
 https://memsavor-api.your-subdomain.workers.dev
```

### 步骤 7：更新前端 API 地址

打开 `js/api.js`，修改第 4 行：

```javascript
// 修改前
const API_BASE_URL = 'https://memsavor-api.YOUR-SUBDOMAIN.workers.dev';

// 修改后（使用您的实际地址）
const API_BASE_URL = 'https://memsavor-api.your-subdomain.workers.dev';
```

### 步骤 8：提交到 GitHub

```bash
git add .
git commit -m "feat: 迁移到 Cloudflare Workers"
git push origin main
```

---

## 🧪 测试 API

### 方法 1：浏览器测试

访问：
```
https://memsavor-api.your-subdomain.workers.dev/mountains
```

应该返回山峰数据 JSON。

### 方法 2：使用测试页面

1. 更新 `test-api.html` 中的 API 地址
2. 访问测试页面
3. 运行所有测试

### 方法 3：使用 curl

```bash
# 测试山峰 API
curl https://memsavor-api.your-subdomain.workers.dev/mountains

# 测试登录
curl -X POST https://memsavor-api.your-subdomain.workers.dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{"account":"13800138000","password":"123456"}'
```

---

## 🔧 高级配置

### 自定义域名（可选）

1. 在 Cloudflare Dashboard 中，点击您的 Worker
2. 点击 **"Settings"** → **"Triggers"**
3. 点击 **"Add Custom Domain"**
4. 输入您的域名（如 `api.memsavor.com`）

### 使用 KV 存储（推荐）

当前使用内存存储，重启后数据会丢失。建议使用 KV 持久化存储：

1. 创建 KV 命名空间：
```bash
wrangler kv:namespace create "DB"
```

2. 更新 `wrangler.toml`：
```toml
[[kv_namespaces]]
binding = "DB"
id = "your-kv-namespace-id"
```

3. 修改 `worker.js` 使用 KV：
```javascript
// 从 KV 读取数据
const users = await env.DB.get('users', { type: 'json' }) || [];

// 写入数据
await env.DB.put('users', JSON.stringify(users));
```

---

## 📊 监控和日志

### 查看实时日志

```bash
wrangler tail
```

### 在 Dashboard 查看统计

1. 登录 Cloudflare Dashboard
2. 点击 **"Workers & Pages"**
3. 选择您的 Worker
4. 查看 **"Metrics"** 和 **"Logs"**

---

## 💰 费用说明

### 免费套餐
- 每天 100,000 次请求
- 每次请求 10ms CPU 时间
- 无限带宽

### 付费套餐（$5/月起）
- 每月 1000 万次请求
- 每次请求 50ms CPU 时间
- 更多高级功能

---

## 🐛 常见问题

### Q: 部署失败怎么办？
A: 检查 `wrangler.toml` 配置，确保 Worker 名称唯一。

### Q: CORS 错误？
A: Cloudflare Workers 在代码中已经配置了 CORS，应该不会有问题。

### Q: 数据丢失？
A: 当前使用内存存储，重启后会丢失。建议使用 KV 存储。

### Q: 如何查看错误日志？
A: 使用 `wrangler tail` 查看实时日志。

---

## 📚 相关资源

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [KV 存储文档](https://developers.cloudflare.com/workers/runtime-apis/kv/)

---

## ✅ 部署检查清单

- [ ] 注册 Cloudflare 账号
- [ ] 安装 Wrangler CLI
- [ ] 登录 Cloudflare
- [ ] 配置 wrangler.toml
- [ ] 本地测试（可选）
- [ ] 部署到 Cloudflare
- [ ] 更新前端 API 地址
- [ ] 提交到 GitHub
- [ ] 测试 API 功能
- [ ] 测试登录注册

---

**部署完成后，您的 API 地址格式为**：
```
https://memsavor-api.your-subdomain.workers.dev
```

**替换 `your-subdomain` 为您的实际子域名！**
