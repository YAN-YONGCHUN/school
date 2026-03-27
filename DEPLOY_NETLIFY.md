# Netlify + GitHub Pages 混合部署指南

## 架构说明

- **前端**: GitHub Pages 托管静态页面
- **后端**: Netlify Functions 无服务器 API
- **数据**: 内存存储（演示用途）

## 部署步骤

### 方法一：手动部署到 Netlify（推荐）

#### 1. 登录 Netlify
访问 [https://app.netlify.com](https://app.netlify.com) 并使用 GitHub 账号登录

#### 2. 创建新站点
- 点击 "Add new site" → "Import an existing project"
- 选择 GitHub 仓库：`mountain-web-----`
- 或直接拖拽项目文件夹到 Netlify Drop

#### 3. 配置构建设置
```
Build command: 留空（不需要构建）
Publish directory: 留空（默认为根目录）
Functions directory: netlify/functions
```

#### 4. 部署完成后获取 API 地址
- 在 Netlify 后台找到您的站点 URL（例如：https://your-site-name.netlify.app）
- API 端点格式：https://your-site-name.netlify.app/.netlify/functions

#### 5. 更新前端 API 地址
修改 `js/api-netlify.js` 文件第一行：
```javascript
const NETLIFY_BASE_URL = 'https://YOUR-SITE-NAME.netlify.app/.netlify/functions';
```

将 `YOUR-SITE-NAME` 替换为您的实际站点名称

#### 6. 更新 HTML 文件引用
将所有 HTML 文件中的 `<script src="js/api.js"></script>` 改为：
```html
<script src="js/api-netlify.js"></script>
```

或者直接在 `js/api.js` 中修改 `API_BASE_URL`

### 方法二：使用 Netlify CLI 部署

#### 1. 安装 Netlify CLI
```bash
npm install -g netlify-cli
```

#### 2. 登录 Netlify
```bash
netlify login
```

#### 3. 初始化项目
```bash
netlify init
```

#### 4. 本地测试
```bash
netlify dev
```

#### 5. 部署到生产环境
```bash
netlify deploy --prod
```

## 文件结构

```
mountain-web-----/
├── netlify/
│   └── functions/          # Netlify Functions API
│       ├── lib/
│       │   ├── auth.js     # JWT 认证
│       │   ├── db.js       # 数据存储
│       │   └── utils.js    # 工具函数
│       ├── auth.js         # 认证 API
│       ├── mountains.js    # 山峰 API
│       ├── partners.js     # 搭子 API
│       ├── users.js        # 用户 API
│       ├── orders.js       # 订单 API
│       ├── products.js     # 商品 API
│       └── rentals.js      # 租借 API
├── js/
│   ├── api.js              # 原 Vercel API 客户端
│   └── api-netlify.js      # Netlify API 客户端
├── netlify.toml            # Netlify 配置文件
└── package.json            # 项目依赖
```

## API 端点

所有 API 端点现在都在 `/.netlify/functions/` 路径下：

| 端点 | 功能 |
|------|------|
| `/auth/login` | 用户登录 |
| `/auth/register` | 用户注册 |
| `/auth/admin/login` | 管理员登录 |
| `/mountains` | 山峰数据管理 |
| `/partners` | 搭子招募管理 |
| `/users` | 用户管理 |
| `/orders` | 订单管理 |
| `/products` | 商品管理 |
| `/rentals` | 租借管理 |

## 注意事项

1. **CORS 配置**: 已在 `netlify.toml` 中配置跨域，确保前端可以访问 API
2. **数据持久化**: 当前使用内存存储，重启后会重置。生产环境请使用数据库
3. **环境变量**: JWT_SECRET 等敏感信息应使用 Netlify 环境变量
4. **函数冷启动**: Netlify Functions 免费层有冷启动，首次请求可能较慢

## 测试

部署完成后，访问：
- 前端：https://yan-yongchun.github.io/mountain-web-----/
- API 测试：https://your-site-name.netlify.app/.netlify/functions/mountains

## 故障排查

### 问题：API 返回 404
**解决**: 检查 `netlify.toml` 配置是否正确，确保重定向规则生效

### 问题：CORS 错误
**解决**: 检查 `netlify.toml` 中的 headers 配置，确保包含正确的 CORS 头

### 问题：函数无法加载
**解决**: 检查 `netlify/functions` 目录结构，确保 lib 文件夹存在

## 从 Vercel 迁移

如果您之前使用 Vercel，需要：
1. 将 `api/` 目录的文件迁移到 `netlify/functions/`
2. 修改函数导出格式（从 `module.exports` 改为 `exports.handler`）
3. 更新前端 API_BASE_URL
4. 重新部署到 Netlify

## 相关链接

- [Netlify 文档](https://docs.netlify.com/)
- [Netlify Functions 指南](https://docs.netlify.com/functions/overview/)
- [GitHub Pages 部署](https://pages.github.com/)
