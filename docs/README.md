# AI Story Weaver - 完整指南

> 基于 AI 的智能故事生成与配音工具

## 📖 目录

- [项目简介](#项目简介)
- [快速开始](#快速开始)
- [功能特性](#功能特性)
- [部署指南](#部署指南)
- [版本更新记录](#版本更新记录)

---

## 项目简介

AI Story Weaver 是一个现代化的 Web 应用，结合了图像识别、自然语言生成和语音合成技术，帮助用户轻松创作引人入胜的故事。

### 技术栈
- **前端**: React 19 + TypeScript + Vite 6
- **样式**: Tailwind CSS (CDN)
- **AI 服务**: 
  - Google Gemini (故事生成 + TTS)
  - ElevenLabs (高质量 TTS)

### 核心特性
- 🖼️ 图片上传与智能分析
- ✍️ 可自定义的故事生成（支持多语言、风格、字数要求）
- 🎙️ 双 TTS 引擎（Gemini / ElevenLabs）
- 💾 音频下载功能
- ⚙️ 灵活的模型配置（11+ 模型选项 + 自定义）
- 🔄 自动重试机制（应对 API 过载）
- 🌐 完整的 Google Search Grounding 支持

---

## 快速开始

### 前提条件
- Node.js 18+ 
- Gemini API Key ([获取地址](https://aistudio.google.com/app/apikey))
- (可选) ElevenLabs API Key

### 本地运行

```bash
# 1. 安装依赖
npm install

# 2. 配置 API Key (两种方式任选其一)
# 方式A: 修改 .env.local
GEMINI_API_KEY=你的_Gemini_API_Key

# 方式B: 启动后在页面右上角 Settings 中填写

# 3. 启动开发服务器
npm run dev

# 4. 访问应用
# http://localhost:3000
```

### 构建生产版本

```bash
npm run build
# 输出目录: dist/
```

---

## 功能特性

### 1. 智能故事生成

**基础功能:**
- 上传图片（支持完整显示任意尺寸）
- 可选自定义提示（Image Prompt）
- 自动图像分析与事实检索
- 实时加载指示器

**自定义选项:**
```
示例1: 用中文写一个500字的幽默故事
示例2: 模仿海明威的简洁风格
示例3: 悲伤的语气，第一人称叙述
```

### 2. 多模型支持

**故事生成模型 (11+ 选项):**
- Gemini 2.5 系列: Flash, Flash-8B, Pro
- Gemini 2.0 系列: Flash, Flash Exp
- Gemini 1.5 系列: Flash, Flash-8B, Pro
- 自定义模型输入

**TTS 模型:**
- Gemini: 2.5 Flash TTS, 2.0 Flash Exp, 自定义
- ElevenLabs: 高质量多语言 TTS

### 3. 连接验证与错误诊断

**智能错误分类:**
- 🌐 网络问题
- 🔑 认证错误
- 🤖 模型错误
- ⚙️ 配置错误
- ❌ 未知错误

**自动重试:**
- 遇到 503/429/网络错误时自动重试 3 次
- 指数退避策略 (2s → 4s → 8s)

### 4. 音频功能

- 🎙️ 双 TTS 引擎选择
- 🔊 内置音频播放器（进度条、播放/暂停）
- 💾 一键下载（自动命名，格式识别）
- 🔄 音频生成失败后可重新生成

---

## 部署指南

### 方案 1: 静态托管（Vercel/Netlify）

**适用场景:** 演示、测试、个人使用

```bash
# 构建
npm run build

# 部署到 Vercel
vercel --prod

# 或部署到 Netlify
netlify deploy --prod --dir=dist
```

**配置:**
- Build command: `npm run build`
- Output directory: `dist`
- 环境变量: `GEMINI_API_KEY` (可选)

**⚠️ 安全提示:** 前端部署会暴露 API Key，仅用于演示环境。

### 方案 2: GitHub Pages

**适用场景:** 开源项目、文档站点

```bash
# 安装工具
npm install --save-dev gh-pages

# 修改 vite.config.ts，设置 base 路径
# base: '/ai-story-weaver/'

# 添加脚本到 package.json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}

# 执行部署
npm run deploy
```

访问: `https://你的用户名.github.io/ai-story-weaver/`

### 方案 3: 后端代理（推荐生产）

**核心思路:** 隐藏 API Key，提升安全性

**架构:**
```
前端 (静态) → 后端代理 (Node/Vercel/Cloudflare Workers) → Gemini/ElevenLabs API
```

**Express 示例:**
```javascript
// server.js
app.post('/api/gemini', async (req, res) => {
  const response = await fetch('https://generativelanguage.googleapis.com/...', {
    headers: { 'Authorization': `Bearer ${process.env.GEMINI_API_KEY}` }
  });
  res.json(await response.json());
});
```

**Vercel Serverless:**
- 在 `api/gemini.ts` 创建 API 端点
- 前端改为调用 `/api/gemini`
- 密钥配置在 Vercel 环境变量

### 方案 4: Docker 容器化

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

```bash
# 构建镜像
docker build -t ai-story-weaver .

# 运行容器
docker run -p 80:3000 ai-story-weaver
```

---

## 版本更新记录

### v2.1 (最新) - 用户体验优化

**UI 改进:**
- ✨ 图片 `object-contain` 完整显示
- ✨ Image Prompt 可选输入，优先用户自定义
- ✨ 实时旋转加载指示器
- ✨ 配色改为冷静的蓝绿色系 (Teal/Cyan)
- ✨ 设置图标更明显（圆形按钮 + 边框）
- ✨ 毛玻璃效果与圆角优化 (backdrop-blur, rounded-xl)
- ✨ 标题与按钮增大，提升高级感

### v2.0 - 重新设计

**视觉升级:**
- 🎨 从暗黑风格改为清爽浅色风格
- 🎨 文字对比度达 WCAG AAA 级
- 🎨 图片和输入框并排布局
- 🎨 动态显示（无内容时隐藏组件）

### v1.3 - 功能增强

**新增功能:**
- 💾 音频下载功能
- 📐 容器宽度扩大 (max-w-7xl)
- 📖 故事文本框独占一行

### v1.2 - UI 修复

**修复问题:**
- 🐛 设置面板滚动问题
- 🐛 点击弹窗内部误关闭
- 🐛 API Key 优先级逻辑

### v1.1 - 核心功能

**初始功能:**
- 🔍 增强连接验证（5 种错误分类）
- 📱 扩展模型选项（11+ 模型）
- ⚙️ 自定义模型输入
- 🔄 自动重试机制

---

## 常见问题

### Q: 本地运行失败，提示找不到模块？
**A:** 执行 `npm install` 安装依赖。

### Q: 生成故事时提示 503 错误？
**A:** Gemini API 过载，应用会自动重试 3 次。如果仍失败，请稍后再试。

### Q: 如何使用自定义模型？
**A:** Settings → 选择"自定义模型" → 输入模型名称 → 测试验证。

### Q: ElevenLabs 报 CORS 错误？
**A:** 浏览器直连受限，建议使用后端代理方案。

### Q: 如何部署到生产环境？
**A:** 推荐使用"后端代理"方案，避免在前端暴露 API Key。

---

## 开发指南

### 项目结构
```
ai-story-weaver/
├── components/         # React 组件
│   ├── AudioPlayer.tsx
│   ├── ImageUploader.tsx
│   ├── SettingsPanel.tsx
│   └── StoryDisplay.tsx
├── services/           # API 服务
│   ├── geminiService.ts
│   └── elevenlabsService.ts
├── hooks/              # 自定义 Hooks
│   └── useSettings.ts
├── docs/               # 文档
└── App.tsx             # 主应用
```

### 添加新模型

```typescript
// services/geminiService.ts
export const AVAILABLE_MODELS = [
  'gemini-2.5-flash',
  'your-new-model',  // 添加这里
  // ...
];
```

### 自定义主题

```typescript
// 修改 App.tsx 背景渐变
className="bg-gradient-to-br from-YOUR-COLOR via-YOUR-COLOR to-YOUR-COLOR"
```

---

## 贡献指南

欢迎提交 Issue 和 Pull Request！

**开发流程:**
1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 许可证

请根据项目实际情况添加许可证。

---

## 联系方式

- 项目主页: [GitHub Repository]
- Issue 反馈: [GitHub Issues]

---

**感谢使用 AI Story Weaver!** ✨
