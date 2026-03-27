# ✅ HTML 文件 API 引用已更新完成

## 📝 已完成的修改

所有 HTML 文件的 API 引用已从 `js/api.js` 改为 `js/api-netlify.js`：

- ✅ [`index.html`](file:///c:/Users/闫永春/Desktop/mountain-web%20-%20副本/index.html)
- ✅ [`login.html`](file:///c:/Users/闫永春/Desktop/mountain-web%20-%20副本/login.html)
- ✅ [`admin.html`](file:///c:/Users/闫永春/Desktop/mountain-web%20-%20副本/admin.html)
- ✅ [`admin-login.html`](file:///c:/Users/闫永春/Desktop/mountain-web%20-%20副本/admin-login.html)
- ✅ [`partner.html`](file:///c:/Users/闫永春/Desktop/mountain-web%20-%20副本/partner.html)
- ✅ [`rent.html`](file:///c:/Users/闫永春/Desktop/mountain-web%20-%20副本/rent.html)
- ✅ [`badge.html`](file:///c:/Users/闫永春/Desktop/mountain-web%20-%20副本/badge.html)
- ✅ [`spots.html`](file:///c:/Users/闫永春/Desktop/mountain-web%20-%20副本/spots.html)
- ✅ [`detail.html`](file:///c:/Users/闫永春/Desktop/mountain-web%20-%20副本/detail.html)

## 🔧 下一步：配置 Netlify API 地址

### 1. 部署到 Netlify

访问 [https://app.netlify.com](https://app.netlify.com) 并按以下步骤操作：

1. 登录 GitHub 账号
2. 点击 **"Add new site"** → **"Import an existing project"**
3. 选择仓库：`mountain-web-----`
4. 配置构建（全部留空）：
   ```
   Base directory: 留空
   Build command: 留空
   Publish directory: 留空
   ```
5. 点击 **"Deploy site"**

### 2. 获取您的 Netlify 站点地址

部署成功后，在 Netlify 后台顶部查看您的站点 URL：

```
https://YOUR-SITE-NAME.netlify.app
```

例如：`https://memsavor.netlify.app`

### 3. 更新 API 地址配置

打开 [`js/api-netlify.js`](file:///c:/Users/闫永春/Desktop/mountain-web%20-%20副本/js/api-netlify.js#L3)，修改第 3 行：

```javascript
// 修改前
const NETLIFY_BASE_URL = 'https://YOUR-SITE-NAME.netlify.app/.netlify/functions';

// 修改后（假设您的站点名是 memsavor）
const NETLIFY_BASE_URL = 'https://memsavor.netlify.app/.netlify/functions';
```

### 4. 提交并部署

```bash
git add .
git commit -m "feat: 配置 Netlify API 地址"
git push origin main
```

Netlify 会自动重新部署。

## 🧪 测试 API

部署完成后，访问以下地址测试：

```
https://YOUR-SITE-NAME.netlify.app/.netlify/functions/mountains
```

应该返回 JSON 格式的山峰数据。

## 📊 当前状态

- ✅ 所有 HTML 文件已更新为使用 `api-netlify.js`
- ✅ Netlify Functions API 已准备就绪
- ✅ 代码已推送到 GitHub
- ⏳ 等待 Netlify 部署和地址配置

## 🎯 最终 URL

部署完成后：

- **前端**: https://yan-yongchun.github.io/mountain-web-----/
- **后端**: https://YOUR-SITE-NAME.netlify.app/.netlify/functions

## 💡 提示

如果您暂时不想修改 `api-netlify.js`，也可以直接修改 [`js/api.js`](file:///c:/Users/闫永春/Desktop/mountain-web%20-%20副本/js/api.js#L1) 第 1 行的 `API_BASE_URL`，这样所有 HTML 文件不需要再次修改。

现在您可以开始部署到 Netlify 了！🚀
