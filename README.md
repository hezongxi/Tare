<p align="center">
  <img src="resources/icon-256.png" alt="Tare" width="128" />
</p>

<h1 align="center">Tare</h1>

<p align="center">
  <strong>The AI-Native Browser with Built-in Agent, Skills Market & Automation</strong>
</p>

<p align="center">
  <a href="https://github.com/hezongxi/Tare/stargazers"><img src="https://img.shields.io/github/stars/hezongxi/Tare?style=social" alt="Stars" /></a>
  <a href="https://github.com/hezongxi/Tare/forks"><img src="https://img.shields.io/github/forks/hezongxi/Tare?style=social" alt="Forks" /></a>
  <a href="https://github.com/hezongxi/Tare/blob/main/LICENSE"><img src="https://img.shields.io/github/license/hezongxi/Tare" alt="License" /></a>
  <a href="https://github.com/hezongxi/Tare/releases"><img src="https://img.shields.io/github/v/release/hezongxi/Tare" alt="Release" /></a>
  <img src="https://img.shields.io/badge/Electron-36-47848F?logo=electron" alt="Electron" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
</p>

<p align="center">
  <a href="#english">English</a> ·
  <a href="#中文">中文</a> ·
  <a href="#日本語">日本語</a> ·
  <a href="#한국어">한국어</a> ·
  <a href="#español">Español</a> ·
  <a href="#français">Français</a> ·
  <a href="#deutsch">Deutsch</a> ·
  <a href="#português">Português</a>
</p>

---

## English

**Tare** is an open-source, AI-native desktop browser built with **Electron + React + Vite**. It integrates a powerful AI assistant directly into your browsing experience — supporting **QA mode** for quick answers and **Agent mode** for autonomous web automation, form filling, and task execution.

### Why Tare?

Unlike traditional browsers with bolted-on AI extensions, Tare is **AI-first from the ground up**. The AI sidebar is a first-class citizen that can:

- **Chat with any AI model** (OpenAI, DeepSeek, local models) while browsing
- **Automate web tasks** — fill forms, click buttons, extract data, navigate pages
- **Run Skills** — pre-built automation workflows you can trigger with one click
- **Use slash commands** — type `/` in the chat to switch models, invoke skills, or manage conversations

### Key Features

| Feature | Description |
|---------|-------------|
| **AI Sidebar** | Built-in AI chat with QA and Agent modes, conversation history with localStorage persistence |
| **Agent Mode** | Autonomous web automation — click, type, scroll, extract, navigate |
| **Skills Market** | Pre-built automation skills, enable/disable/execute with one click |
| **Slash Commands** | `/skills`, `/model`, `/history`, `/clear` — powerful command palette in chat |
| **Multi-Tab Browsing** | Draggable tabs with state persistence, keyboard shortcuts (Ctrl+T/W/Tab) |
| **Smart Bookmarking** | Bookmark manager with categorization, search, and quick access |
| **Download Manager** | Track all downloads with progress bars and status indicators |
| **History Search** | Full-text search across browsing history with visit count tracking |
| **Settings Page** | Chrome-style settings with search, categories, and AI model configuration |
| **Custom Protocol** | `browser://settings`, `browser://history`, `browser://skills` — internal pages like Chrome |
| **Context Menu** | Right-click menu with common browser actions and shortcuts |
| **Form Auto-Fill** | AI-powered intelligent form filling for Agent mode |

### Tech Stack

- **Desktop**: Electron 36, BrowserView multi-process architecture
- **Frontend**: React 18, Vite 8, TailwindCSS 4, Zustand
- **Database**: SQLite (sql.js) with FTS5 full-text search
- **AI**: OpenAI-compatible API (supports GPT-4o, DeepSeek, local models)
- **Build**: electron-vite, electron-builder (Windows / macOS / Linux)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/hezongxi/Tare.git
cd Tare

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Package for distribution
npm run dist:win    # Windows
npm run dist        # Current platform
```

### Project Structure

```
Tare/
├── electron/              # Main process (Electron)
│   ├── main.ts           # App entry, window management
│   ├── tabManager.ts     # Multi-tab & BrowserView management
│   ├── popupManager.ts   # Popup window management
│   ├── ai/               # AI services (chat, agent)
│   ├── db/               # SQLite database (schema, repositories)
│   ├── ipc/              # IPC handlers
│   └── skills/           # Skills engine
├── preload/              # Preload scripts (context bridge)
├── src/                  # Renderer process (React)
│   ├── components/
│   │   ├── browser/      # TabBar, NavigationBar, Sidebar, DropdownMenu
│   │   ├── ai/           # AISidebar, ChatInput, ChatMessages
│   │   ├── pages/        # Settings, History, Downloads, Bookmarks, Skills
│   │   └── common/       # Shared components
│   ├── stores/           # Zustand stores (tabs, chat)
│   └── lib/              # Types, utilities
├── resources/            # Icons, test pages
└── electron-builder.yml  # Build configuration
```

### Configuration

Tare supports any **OpenAI-compatible API**. Configure in Settings:

- **API Base URL**: `https://api.openai.com/v1` or your custom endpoint
- **API Key**: Your API key
- **Model**: GPT-4o, DeepSeek, or any compatible model

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### License

[MIT](LICENSE) — Free for personal and commercial use.

---

## 中文

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

### 快速开始

```bash
git clone https://github.com/hezongxi/Tare.git
cd Tare
npm install
npm run dev      # 开发模式
npm run dist:win  # 打包 Windows
```

---

## 日本語

**Tare** は、**Electron + React + Vite** で構築されたオープンソースの **AI ネイティブブラウザ** です。AI アシスタントをブラウジング体験に深く統合し、**QA モード** と **Agent モード** をサポートしています。

### 主な機能

- **AI サイドバー** — QA / Agent ダブルモード、会話履歴のローカル保存
- **Agent モード** — Web ページの自動操作（クリック、入力、スクロール、データ抽出）
- **Skills マーケット** — ワンクリックで実行できる自動化スキル
- **スラッシュコマンド** — `/skills`、`/model`、`/history` で素早く操作
- **マルチタブ** — ドラッグ可能なタブ、キーボードショートカット対応
- **ブックマーク管理** — 分類、検索、クイックアクセス
- **ダウンロード管理** — 進捗バーとステータス表示
- **履歴検索** — フルテキスト検索と訪問回数カウント
- **設定ページ** — Chrome スタイルの設定画面、AI モデル設定

### クイックスタート

```bash
git clone https://github.com/hezongxi/Tare.git
cd Tare && npm install && npm run dev
```

---

## 한국어

**Tare**는 **Electron + React + Vite**로 구축된 오픈소스 **AI 네이티브 브라우저**입니다. AI 어시스턴트를 브라우저 경험에 직접 통합하여 **QA 모드**와 **Agent 모드**를 지원합니다.

### 주요 기능

- **AI 사이드바** — QA/Agent 이중 모드, 대화 기록 로컬 저장
- **Agent 모드** — 웹 페이지 자동화 (클릭, 입력, 스크롤, 데이터 추출)
- **Skills 마켓** — 원클릭 자동화 스킬
- **슬래시 명령어** — `/skills`, `/model`, `/history` 빠른 명령
- **멀티탭** — 드래그 가능한 탭, 키보드 단축키 지원
- **북마크 관리** — 분류, 검색, 빠른 접근
- **다운로드 관리** — 진행률 표시줄 및 상태 표시
- **기록 검색** — 전문 검색 및 방문 횟수 추적
- **설정 페이지** — Chrome 스타일 설정, AI 모델 구성

### 빠른 시작

```bash
git clone https://github.com/hezongxi/Tare.git
cd Tare && npm install && npm run dev
```

---

## Español

**Tare** es un navegador de escritorio de código abierto con IA integrada, construido con **Electron + React + Vite**. Integra un asistente de IA directamente en tu experiencia de navegación, con **modo QA** para respuestas rápidas y **modo Agent** para automatización web autónoma.

### Características principales

- **Barra lateral de IA** — Modos QA y Agent, historial de conversaciones con persistencia local
- **Modo Agent** — Automatización web autónoma: clic, escribir, desplazarse, extraer datos
- **Mercado de Skills** — Flujos de automatización predefinidos, activación con un clic
- **Comandos Slash** — `/skills`, `/model`, `/history`, `/clear`
- **Navegación multi-pestaña** — Pestañas arrastrables con persistencia de estado
- **Gestor de marcadores, descargas e historial** — Búsqueda de texto completo
- **Página de configuración** — Estilo Chrome con búsqueda y categorías

### Inicio rápido

```bash
git clone https://github.com/hezongxi/Tare.git
cd Tare && npm install && npm run dev
```

---

## Français

**Tare** est un navigateur de bureau open source alimenté par l'IA, construit avec **Electron + React + Vite**. Il intègre un assistant IA directement dans votre expérience de navigation — mode **QA** pour des réponses rapides et mode **Agent** pour l'automatisation web autonome.

### Fonctionnalités clés

- **Barre latérale IA** — Modes QA et Agent, historique des conversations persistant
- **Mode Agent** — Automatisation web : clic, saisie, défilement, extraction de données
- **Marché de Skills** — Compétences d'automatisation pré-construites
- **Commandes Slash** — `/skills`, `/model`, `/history`, `/clear`
- **Navigation multi-onglets** — Onglets glissables avec persistance d'état
- **Gestionnaire de favoris, téléchargements et historique** — Recherche plein texte
- **Page de paramètres** — Style Chrome avec recherche et catégories

### Démarrage rapide

```bash
git clone https://github.com/hezongxi/Tare.git
cd Tare && npm install && npm run dev
```

---

## Deutsch

**Tare** ist ein Open-Source, KI-nativer Desktop-Browser, gebaut mit **Electron + React + Vite**. Er integriert einen leistungsstarken KI-Assistenten direkt in Ihr Browsererlebnis — mit **QA-Modus** für schnelle Antworten und **Agent-Modus** für autonome Web-Automatisierung.

### Hauptfunktionen

- **KI-Seitenleiste** — QA- und Agent-Modi, Chatverlauf mit lokaler Speicherung
- **Agent-Modus** — Autonome Web-Automatisierung: Klicken, Tippen, Scrollen, Extrahieren
- **Skills-Marktplatz** — Vorgefertigte Automatisierungs-Workflows
- **Slash-Befehle** — `/skills`, `/model`, `/history`, `/clear`
- **Multi-Tab-Browsing** — Ziehbare Tabs mit Zustandsbeständigkeit
- **Lesezeichen-, Download- und Verlaufsverwaltung** — Volltextsuche
- **Einstellungsseite** — Chrome-Stil mit Suche und Kategorien

### Schnellstart

```bash
git clone https://github.com/hezongxi/Tare.git
cd Tare && npm install && npm run dev
```

---

## Português

**Tare** é um navegador desktop open-source com IA integrada, construído com **Electron + React + Vite**. Integra um assistente de IA diretamente na sua experiência de navegação — com **modo QA** para respostas rápidas e **modo Agent** para automação web autônoma.

### Principais Funcionalidades

- **Barra lateral de IA** — Modos QA e Agent, histórico de conversas com persistência local
- **Modo Agent** — Automação web autônoma: clicar, digitar, rolar, extrair dados
- **Mercado de Skills** — Fluxos de automação pré-construídos, ativação com um clique
- **Comandos Slash** — `/skills`, `/model`, `/history`, `/clear`
- **Navegação multi-abas** — Abas arrastáveis com persistência de estado
- **Gerenciador de favoritos, downloads e histórico** — Busca de texto completo
- **Página de configurações** — Estilo Chrome com busca e categorias

### Início Rápido

```bash
git clone https://github.com/hezongxi/Tare.git
cd Tare && npm install && npm run dev
```

---

## Roadmap

- [ ] Plugin / Extension system
- [ ] Sync bookmarks & settings across devices
- [ ] Voice input for AI chat
- [ ] Built-in ad blocker
- [ ] Mobile companion app
- [ ] Theme marketplace
- [ ] Collaborative Agent workflows

## Keywords / SEO

`AI browser` `AI-native browser` `open source browser` `Electron browser` `AI agent browser` `web automation` `browser agent` `AI sidebar` `LLM browser` `GPT browser` `autonomous browsing` `web scraping` `form auto-fill` `browser automation` `AI assistant` `smart browser` `AI powered browser` `agent mode` `browser skills` `slash commands` `desktop browser` `React browser` `Vite browser` `TypeScript browser` `Chromium alternative` `AI chat browser` `DeepSeek browser` `OpenAI browser` `browser with AI` `intelligent browser` `AI web agent` `browser plugin` `AI工具` `AI浏览器` `智能浏览器` `自动化浏览器` `AIブラウザ` `AI브라우저` `navegador IA` `navigateur IA` `KI-Browser`

---

<p align="center">
  Made with ❤️ by the <a href="https://github.com/hezongxi/Tare">Tare</a> team
</p>

<p align="center">
  <a href="https://github.com/hezongxi/Tare">⭐ Star us on GitHub</a> ·
  <a href="https://github.com/hezongxi/Tare/issues">🐛 Report a bug</a> ·
  <a href="https://github.com/hezongxi/Tare/discussions">💬 Discussions</a>
</p>
