<p align="center">
  <img src="resources/icon-256.png" alt="Tare" width="128" />
</p>

<h1 align="center">Tare</h1>

<p align="center">
  <strong>内置 Agent、Skills 市场与自动化的 AI 原生浏览器</strong>
</p>

<p align="center">
  <a href="https://github.com/hezongxi/Tare/stargazers"><img src="https://img.shields.io/github/stars/hezongxi/Tare?style=social" alt="Stars" /></a>
  <a href="https://github.com/hezongxi/Tare/forks"><img src="https://img.shields.io/github/forks/hezongxi/Tare?style=social" alt="Forks" /></a>
  <a href="https://github.com/hezongxi/Tare/blob/main/LICENSE"><img src="https://img.shields.io/github/license/hezongxi/Tare" alt="License" /></a>
  <img src="https://img.shields.io/badge/Electron-36-47848F?logo=electron" alt="Electron" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
</p>

<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.zh-CN.md">中文</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.de.md">Deutsch</a> ·
  <a href="README.pt.md">Português</a>
</p>

---

**Tare** 是一款开源的 **AI 原生桌面浏览器**，基于 **Electron + React + Vite** 构建。它将强大的 AI 助手深度集成到浏览体验中，支持 **问答模式** 快速获取答案和 **Agent 模式** 自主执行网页自动化任务。

### 为什么选择 Tare？

与在传统浏览器上外挂 AI 插件不同，Tare 从底层就是 **AI 优先** 的设计。AI 侧边栏是一等公民，可以：

- **边浏览边对话** — 支持 OpenAI、DeepSeek、本地模型等多种 AI
- **自动化网页任务** — 填写表单、点击按钮、提取数据、页面导航
- **运行 Skills** — 预置的自动化工作流，一键触发
- **斜杠命令** — 在对话框输入 `/` 切换模型、调用技能、管理对话

### 核心功能

| 功能 | 说明 |
|------|------|
| **AI 侧边栏** | 内置 AI 对话，支持问答和 Agent 双模式，对话历史 localStorage 持久化 |
| **Agent 模式** | 自主网页自动化 — 点击、输入、滚动、提取、导航 |
| **Skills 市场** | 预置自动化技能，一键启用/禁用/执行 |
| **斜杠命令** | `/skills`、`/model`、`/history`、`/clear` — 强大的命令面板 |
| **多标签浏览** | 可拖拽标签，状态持久化，快捷键支持 (Ctrl+T/W/Tab) |
| **智能收藏** | 分类管理、搜索、快速访问 |
| **下载管理** | 进度条、状态指示、文件追踪 |
| **历史搜索** | 全文搜索浏览历史，访问次数统计 |
| **设置页面** | Chrome 风格设置，支持搜索、分类导航、AI 模型配置 |
| **内部协议** | `browser://settings`、`browser://history`、`browser://skills` |
| **右键菜单** | 常用浏览器操作和快捷方式 |
| **表单自动填写** | Agent 模式下的智能表单填写 |

### 技术栈

- **桌面端**: Electron 36，BrowserView 多进程架构
- **前端**: React 18，Vite 8，TailwindCSS 4，Zustand
- **数据库**: SQLite (sql.js)，支持 FTS5 全文搜索
- **AI**: OpenAI 兼容 API（支持 GPT-4o、DeepSeek、本地模型）
- **构建**: electron-vite，electron-builder（Windows / macOS / Linux）

### 快速开始

```bash
# 克隆仓库
git clone https://github.com/hezongxi/Tare.git
cd Tare

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产构建
npm run build

# 打包分发
npm run dist:win    # Windows
npm run dist        # 当前平台
```

### 项目结构

```
Tare/
├── electron/              # 主进程 (Electron)
│   ├── main.ts           # 应用入口，窗口管理
│   ├── tabManager.ts     # 多标签 & BrowserView 管理
│   ├── popupManager.ts   # 浮层窗口管理
│   ├── ai/               # AI 服务（对话、Agent）
│   ├── db/               # SQLite 数据库（表结构、仓储层）
│   ├── ipc/              # IPC 处理器
│   └── skills/           # Skills 引擎
├── preload/              # 预加载脚本（上下文桥接）
├── src/                  # 渲染进程 (React)
│   ├── components/
│   │   ├── browser/      # TabBar、NavigationBar、Sidebar、DropdownMenu
│   │   ├── ai/           # AISidebar、ChatInput、ChatMessages
│   │   ├── pages/        # 设置、历史、下载、收藏、Skills
│   │   └── common/       # 共享组件
│   ├── stores/           # Zustand 状态管理（标签、对话）
│   └── lib/              # 类型、工具
├── resources/            # 图标、测试页面
└── electron-builder.yml  # 构建配置
```

### 配置

Tare 支持任何 **OpenAI 兼容 API**，在设置页面中配置：

- **API Base URL**: `https://api.openai.com/v1` 或自定义端点
- **API Key**: 你的 API 密钥
- **模型**: GPT-4o、DeepSeek 或任何兼容模型

### 贡献

欢迎贡献！请随时提交 Pull Request。

### 许可证

[MIT](LICENSE) — 个人和商业使用免费。

---

<p align="center">
  <a href="README.md">🔙 返回英文版</a>
</p>
