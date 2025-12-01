# AI Story Weaver

将图片转化为故事，通过讲故事练习英语。

## 功能

- **图片故事生成** - 上传图片，AI 自动生成相关故事
- **智能搜索增强** - 自动识别图片中的名人、地点、事件并补充真实信息
- **语音朗读** - 支持 Gemini TTS / ElevenLabs / Edge TTS 三种语音服务
- **中文翻译** - 一键翻译故事内容
- **历史记录** - 保存最近 5 条生成记录
- **图片压缩** - 自动优化大图片，提升上传速度

## 快速开始

本地命令行启动：

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000，在设置中填入 [Gemini API Key](https://aistudio.google.com/apikey) 即可使用。

## 技术栈

- React 19 + TypeScript
- Vite 6
- Tailwind CSS
- Zustand (状态管理)
- Google Gemini API
- ElevenLabs API

## 项目结构

```
ai-story-weaver/
├── components/          # UI 组件
│   ├── settings/        # 设置面板子组件
│   ├── AudioPlayer.tsx
│   ├── ErrorBoundary.tsx
│   ├── ImageUploader.tsx
│   └── ...
├── hooks/               # 自定义 Hooks
│   ├── useSettings.ts
│   ├── useHistory.ts
│   ├── useStoryGeneration.ts
│   ├── useAudioGeneration.ts
│   └── useImageUpload.ts
├── services/            # API 服务
│   ├── geminiService.ts
│   ├── elevenlabsService.ts
│   └── edgeTtsService.ts
├── store/               # Zustand 状态管理
├── constants/           # 常量配置
├── types/               # 类型定义
└── utils/               # 工具函数
```

## 部署

### 方式一：GitHub Pages（推荐）

本项目已配置 GitHub Actions 自动部署，推送到 `main` 分支会自动部署到 GitHub Pages。

**首次部署步骤：**

1. **Fork 或创建仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/你的用户名/ai-story-weaver.git
   git push -u origin main
   ```

2. **启用 GitHub Pages**
   - 进入仓库 Settings → Pages
   - Source 选择 **GitHub Actions**
   - 等待 Actions 运行完成

3. **访问网站**
   - 部署完成后访问：`https://你的用户名.github.io/ai-story-weaver/`

**注意事项：**
- 如果仓库名不是 `ai-story-weaver`，需要修改 `vite.config.ts` 中的 `base` 配置：
  ```ts
  base: '/你的仓库名/',
  ```
- API Key 在用户浏览器本地存储，不会上传到服务器

### 方式二：手动部署

```bash
# 构建
npm run build

# dist 目录即为构建产物，可部署到任意静态托管服务
```

支持部署到：Vercel、Netlify、Cloudflare Pages 等。

