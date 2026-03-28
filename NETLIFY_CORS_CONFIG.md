# 🔧 Netlify CORS 配置指南

## ❌ 问题：CORS 配置缺失

测试结果显示：
```json
{
  "cache-control": "no-cache",
  "content-length": "0",
  "content-type": "application/json"
}
```

**缺少的关键头**：
- `access-control-allow-origin`
- `access-control-allow-headers`
- `access-control-allow-methods`

---

## ✅ 解决方案：在 Netlify 后台手动配置 CORS

### 步骤 1：登录 Netlify 后台

1. 访问 [https://app.netlify.com](https://app.netlify.com)
2. 选择您的站点：**memsavor**

### 步骤 2：进入站点设置

1. 点击顶部的 **"Site settings"** 按钮
2. 在左侧菜单中找到 **"Build & deploy"**
3. 点击 **"Post processing"** → **"Headers"**

### 步骤 3：添加 CORS Headers

点击 **"Add header"**，添加以下配置：

#### Header 1: Access-Control-Allow-Origin
- **Path**: `/.netlify/functions/*`
- **Header name**: `Access-Control-Allow-Origin`
- **Header value**: `*`

#### Header 2: Access-Control-Allow-Headers
- **Path**: `/.netlify/functions/*`
- **Header name**: `Access-Control-Allow-Headers`
- **Header value**: `Content-Type, Authorization`

#### Header 3: Access-Control-Allow-Methods
- **Path**: `/.netlify/functions/*`
- **Header name**: `Access-Control-Allow-Methods`
- **Header value**: `GET, POST, PUT, DELETE, OPTIONS`

#### Header 4: Access-Control-Max-Age
- **Path**: `/.netlify/functions/*`
- **Header name**: `Access-Control-Max-Age`
- **Header value**: `86400`

### 步骤 4：保存并重新部署

1. 点击 **"Save"** 保存配置
2. 点击顶部的 **"Deploys"** 标签
3. 点击 **"Trigger deploy"** → **"Clear cache and deploy site"**

---

## 📋 配置截图示例

### Headers 配置页面
```
Path: /.netlify/functions/*
┌─────────────────────────────────────┬──────────────────────┐
│ Header Name                         │ Header Value         │
├─────────────────────────────────────┼──────────────────────┤
│ Access-Control-Allow-Origin         │ *                    │
│ Access-Control-Allow-Headers        │ Content-Type, Authorization │
│ Access-Control-Allow-Methods        │ GET, POST, PUT, DELETE, OPTIONS │
│ Access-Control-Max-Age              │ 86400                │
└─────────────────────────────────────┴──────────────────────┘
```

---

## 🧪 验证配置

配置完成后，等待 1-2 分钟，然后再次测试：

### 访问测试页面
```
https://yan-yongchun.github.io/mountain-web-----/test-api.html
```

### 测试 CORS 预检请求
点击 **"测试 CORS 预检请求"**

**预期结果**：
```json
{
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "Content-Type, Authorization",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-max-age": "86400"
}
```

✅ 应该显示：**"CORS 配置正确"**

---

## 🔄 如果配置后仍然失败

### 方案 1：清除浏览器缓存
1. 按 `Ctrl + Shift + Delete`
2. 选择 **"缓存的图片和文件"**
3. 点击 **"清除数据"**
4. 刷新页面

### 方案 2：使用无痕模式
1. 按 `Ctrl + Shift + N`（Chrome）或 `Ctrl + Shift + P`（Firefox）
2. 在无痕窗口中访问测试页面

### 方案 3：检查 Netlify 部署日志
1. 在 Netlify 后台点击 **"Deploys"**
2. 查看最新部署的日志
3. 确认部署成功，无错误

---

## 📝 为什么 netlify.toml 中的配置无效？

### 原因分析

Netlify.toml 中的 `[[headers]]` 配置**只对静态文件有效**，对 Netlify Functions 无效。

### Netlify Functions 的 CORS 处理

Netlify Functions 的预检请求（OPTIONS）是由 Netlify 自动处理的，而不是由函数代码处理。因此，我们需要在 Netlify 后台的 **Site settings → Headers** 中手动配置。

---

## 🎯 配置完成后

配置完成后，请：

1. ✅ 等待 1-2 分钟让配置生效
2. ✅ 清除浏览器缓存
3. ✅ 再次测试 CORS 预检请求
4. ✅ 测试登录注册功能

---

## 📞 如果还有问题

如果按照上述步骤配置后仍然失败，请提供：

1. Netlify 后台 Headers 配置的截图
2. 测试页面的完整测试结果
3. 浏览器控制台的错误信息

这样我可以进一步帮您诊断问题！
