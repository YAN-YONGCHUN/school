# 🚀 Netlify 部署快速指南

## ✅ 已完成的工作

1. ✅ 所有 API 已迁移到 Netlify Functions 格式
2. ✅ 创建 netlify.toml 配置文件
3. ✅ 创建 api-netlify.js 前端适配
4. ✅ 代码已推送到 GitHub

## 📋 部署步骤（3 分钟完成）

### 步骤 1：登录 Netlify
1. 访问 [https://app.netlify.com](https://app.netlify.com)
2. 使用 GitHub 账号登录
3. 点击 **"Add new site"** → **"Import an existing project"**

### 步骤 2：连接 GitHub 仓库
1. 选择 GitHub
2. 找到并选择仓库：**mountain-web-----**
3. 点击 **"Import selected repository"**

### 步骤 3：配置构建设置（重要！）

```
Site name: memsavor（或您喜欢的名称）
Build command: 留空（不需要构建）
Publish directory: 留空（默认为根目录）
Functions directory: netlify/functions
```

### 步骤 4：点击部署
- 点击 **"Deploy site"**
- 等待 1-2 分钟完成部署

### 步骤 5：获取您的 API 地址
部署完成后，您会看到：
- **前端地址**: https://memsavor.netlify.app（示例）
- **API 地址**: https://memsavor.netlify.app/.netlify/functions

### 步骤 6：更新 API 地址（重要！）

1. 打开 `js/api-netlify.js` 文件
2. 修改第 2 行：
```javascript
const NETLIFY_BASE_URL = 'https://YOUR-SITE-NAME.netlify.app/.netlify/functions';
```
将 `YOUR-SITE-NAME` 替换为您的实际站点名称

3. 提交更改到 GitHub，Netlify 会自动重新部署

### 步骤 7：更新 HTML 引用

将所有 HTML 文件中的：
```html
<script src="js/api.js"></script>
```

改为：
```html
<script src="js/api-netlify.js"></script>
```

**或者** 直接使用 `js/api.js`，但需要修改第 1 行的 API_BASE_URL

## 🧪 测试

### 测试 API
访问：`https://YOUR-SITE-NAME.netlify.app/.netlify/functions/mountains`

应该返回 JSON 数据

### 测试前端
访问：`https://yan-yongchun.github.io/mountain-web-----/`

尝试登录/注册功能

## 🔧 使用 Netlify CLI（可选）

如果您想本地测试：

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 登录
netlify login

# 本地测试
netlify dev

# 部署
netlify deploy --prod
```

## ⚠️ 注意事项

1. **数据持久化**: 当前使用内存存储，重启后会重置
2. **冷启动**: 免费层首次请求可能较慢（1-2 秒）
3. **CORS**: 已在 netlify.toml 中配置好跨域

## 📊 部署后的 URL

- **前端**: https://yan-yongchun.github.io/mountain-web-----/
- **后端**: https://YOUR-SITE-NAME.netlify.app/.netlify/functions

## ❓ 遇到问题？

如果登录/注册没反应：
1. 检查浏览器控制台（F12）
2. 确认 API_BASE_URL 是否正确
3. 确认 netlify/functions 目录已部署

## 🎉 完成！

部署完成后，您将拥有：
- ✅ 国内可访问的后端 API
- ✅ 稳定的 GitHub Pages 前端
- ✅ 完整的登录注册功能
- ✅ 搭子申请审核系统
- ✅ 管理员后台
