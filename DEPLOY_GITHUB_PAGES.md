# GitHub Pages 部署说明

《攀峰计划》已经改为纯前端版本，可以直接部署到 GitHub Pages。

## 一、准备工作

你需要：

1. 一个 GitHub 账号
2. 一个新的 GitHub 仓库
3. 把当前项目文件上传到仓库中

## 二、上传项目

### 方式一：网页上传

1. 打开 GitHub
2. 新建仓库，例如：`campus-peak-platform`
3. 点击 `Add file`
4. 选择 `Upload files`
5. 把整个项目文件拖进去
6. 点击提交

### 方式二：本地 Git 上传

如果你本机装了 Git，可以在项目目录执行：

```bash
git init
git add .
git commit -m "init project"
git branch -M main
git remote add origin 你的仓库地址
git push -u origin main
```

## 三、开启 GitHub Pages

1. 进入你的 GitHub 仓库
2. 点击 `Settings`
3. 左侧找到 `Pages`
4. 在 `Build and deployment` 中选择：

- Source：`Deploy from a branch`
- Branch：`main`
- Folder：`/root`

5. 点击 `Save`

几分钟后 GitHub 会生成一个公开网址。

## 四、访问网站

GitHub Pages 一般会生成类似下面的地址：

```text
https://你的GitHub用户名.github.io/仓库名/
```

例如：

```text
https://yourname.github.io/campus-peak-platform/
```

## 五、首页要求

GitHub Pages 默认会读取根目录的 `index.html` 作为首页，所以你必须保留：

```text
index.html
```

## 六、如果页面打开样式丢失

请检查：

1. `css/site.css` 是否在仓库中
2. `js/site-data.js`、`js/site-store.js`、`js/site-ui.js` 是否在仓库中
3. 页面文件和 `css`、`js` 文件夹是否都在同一层级结构下

## 七、比赛展示建议

答辩时建议按这个顺序演示：

1. 首页：先讲主题和整体设计
2. 学科全景 / 实验空间 / 课程图谱：讲专业契合度
3. 登录注册页：讲纯前端账户系统
4. 创新社区页：现场提交一条报名记录
5. 数据驾驶舱页：查看报名数据实时变化
6. 最后说明这是纯前端、可静态部署、适合 GitHub Pages 展示

## 八、更新网站

以后如果你修改了项目，只需要重新上传到 GitHub 仓库，GitHub Pages 会自动更新。

## 九、适合比赛的优点

- 免费
- 部署简单
- 链接可公开访问
- 不需要服务器
- 适合评委线上查看
