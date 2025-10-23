# GitHub Pages 部署指南

## 📋 部署前检查清单

- [ ] 代码已推送到 GitHub 仓库
- [ ] `.gitignore` 已正确配置（排除 node_modules）
- [ ] `vite.config.ts` 已设置正确的 `base` 路径
- [ ] `.github/workflows/deploy.yml` 已创建

---

## 🚀 方式 1：使用 GitHub Actions 自动部署（推荐）

### 步骤 1：配置仓库设置

1. 访问你的 GitHub 仓库
2. 点击 **Settings** → **Pages**
3. 在 **Source** 下选择 **GitHub Actions**

### 步骤 2：推送代码触发部署

```bash
git add .
git commit -m "Setup GitHub Pages deployment"
git push origin main
```

### 步骤 3：查看部署状态

1. 访问仓库的 **Actions** 标签页
2. 查看 "Deploy to GitHub Pages" 工作流
3. 等待构建完成（约 2-3 分钟）

### 步骤 4：访问网站

部署成功后，访问：
```
https://你的用户名.github.io/ai-story-weaver/
```

---

## 🛠️ 方式 2：使用 gh-pages 手动部署

### 步骤 1：安装 gh-pages

```bash
cd ai-story-weaver
npm install --save-dev gh-pages
```

### 步骤 2：添加部署脚本

编辑 `package.json`，添加：
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

### 步骤 3：执行部署

```bash
npm run deploy
```

### 步骤 4：配置 GitHub Pages

1. 访问仓库 **Settings** → **Pages**
2. **Source** 选择 `gh-pages` 分支
3. 点击 **Save**

---

## ⚙️ 配置说明

### vite.config.ts 的 base 设置

```typescript
// 如果仓库名是 ai-story-weaver
base: '/ai-story-weaver/'

// 如果部署到 username.github.io 根域名
base: '/'

// 动态设置（推荐）
base: process.env.GITHUB_ACTIONS ? '/ai-story-weaver/' : '/'
```

### 为什么 node_modules 不上传？

1. **体积巨大**：通常几百 MB，上传非常慢
2. **不必要**：部署时只需要构建后的 `dist/` 文件夹
3. **安全**：`dist/` 是纯静态文件，不包含源代码和依赖
4. **标准做法**：所有项目都在 `.gitignore` 中排除 `node_modules`

### GitHub Actions 如何工作？

```
1. 触发（push 到 main 分支）
   ↓
2. GitHub 服务器启动虚拟机
   ↓
3. 安装 Node.js 和依赖（npm ci）
   ↓
4. 执行构建（npm run build）
   ↓
5. 上传 dist/ 到 GitHub Pages
   ↓
6. 自动发布到域名
```

---

## 🐛 常见问题

### Q: 部署后页面空白，控制台报 404？
**A:** `base` 路径配置错误。

```typescript
// 检查 vite.config.ts
base: '/你的仓库名/'  // 注意前后都有斜杠
```

### Q: 部署成功但样式错乱？
**A:** 资源路径问题，检查 `base` 配置。

### Q: 推送代码后没有触发部署？
**A:** 检查：
1. 分支名是否正确（main vs master）
2. `.github/workflows/deploy.yml` 是否存在
3. 访问 Actions 页面查看错误日志

### Q: 本地开发时资源 404？
**A:** 本地开发时 `base` 应该是 `/`：

```typescript
base: process.env.GITHUB_ACTIONS ? '/ai-story-weaver/' : '/'
```

### Q: 如何使用自定义域名？
**A:** 
1. 在 `ai-story-weaver/public/` 创建 `CNAME` 文件
2. 写入你的域名：`example.com`
3. 在域名 DNS 设置 CNAME 记录指向 `username.github.io`

---

## 🔒 API Key 安全建议

### ⚠️ 警告

GitHub Pages 是纯静态托管，**任何在前端注入的 API Key 都会暴露**！

### 生产环境建议

**不要**在 `.env.local` 中放真实 API Key 并构建部署！

**推荐方案：**
1. 前端不包含任何 API Key
2. 用户在页面的 Settings 中手动输入
3. API Key 保存在浏览器 localStorage
4. 或者使用后端代理方案（见 docs/README.md）

---

## ✅ 部署成功后

### 验证清单
- [ ] 网站可正常访问
- [ ] 图片上传功能正常
- [ ] 故事生成功能正常
- [ ] 音频播放功能正常
- [ ] 设置面板可打开并保存
- [ ] 响应式布局正常（测试手机屏幕）

### 后续维护
```bash
# 每次更新代码后
git add .
git commit -m "更新说明"
git push origin main

# GitHub Actions 会自动重新部署
```

---

## 📚 相关文档

- [GitHub Pages 官方文档](https://docs.github.com/en/pages)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)
- [项目完整文档](./docs/README.md)

---

**祝部署成功！** 🎉
