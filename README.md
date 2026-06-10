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

## 日本語

**Tare** は、**Electron + React + Vite** で構築されたオープンソースの **AI ネイティブブラウザ** です。AI アシスタントをブラウジング体験に深く統合し、**QA モード** による素早い回答と **Agent モード** による自律的な Web 自動化、フォーム入力、タスク実行をサポートしています。

### なぜ Tare？

従来のブラウザに AI 拡張機能を後付けするのではなく、Tare は **AI ファースト** でゼロから設計されています。AI サイドバーはファーストクラス市民として、以下が可能です：

- **どんな AI モデルともチャット** — OpenAI、DeepSeek、ローカルモデルに対応
- **Web タスクの自動化** — フォーム入力、ボタンクリック、データ抽出、ページナビゲーション
- **Skills の実行** — ワンクリックで起動できる事前構築された自動化ワークフロー
- **スラッシュコマンド** — チャットに `/` と入力してモデル切替、Skills 呼び出し、会話管理

### 主な機能

| 機能 | 説明 |
|------|------|
| **AI サイドバー** | QA / Agent ダブルモード、localStorage による会話履歴の永続化 |
| **Agent モード** | 自律的な Web 自動化 — クリック、入力、スクロール、抽出、ナビゲーション |
| **Skills マーケット** | 事前構築された自動化スキル、ワンクリックで有効化/無効化/実行 |
| **スラッシュコマンド** | `/skills`、`/model`、`/history`、`/clear` — チャット内の強力なコマンドパレット |
| **マルチタブ** | ドラッグ可能なタブ、状態の永続化、キーボードショートカット (Ctrl+T/W/Tab) |
| **ブックマーク管理** | 分類、検索、クイックアクセス対応のブックマークマネージャー |
| **ダウンロード管理** | 進捗バーとステータス表示による全ダウンロードの追跡 |
| **履歴検索** | 訪問回数追跡付きのフルテキスト履歴検索 |
| **設定ページ** | 検索、カテゴリ、AI モデル設定対応の Chrome スタイル設定画面 |
| **カスタムプロトコル** | `browser://settings`、`browser://history`、`browser://skills` — Chrome のような内部ページ |
| **コンテキストメニュー** | 一般的なブラウザ操作とショートカットを含む右クリックメニュー |
| **フォーム自動入力** | Agent モードでの AI によるインテリジェントなフォーム入力 |

### 技術スタック

- **デスクトップ**: Electron 36、BrowserView マルチプロセスアーキテクチャ
- **フロントエンド**: React 18、Vite 8、TailwindCSS 4、Zustand
- **データベース**: SQLite (sql.js)、FTS5 フルテキスト検索対応
- **AI**: OpenAI 互換 API（GPT-4o、DeepSeek、ローカルモデル対応）
- **ビルド**: electron-vite、electron-builder（Windows / macOS / Linux）

### クイックスタート

```bash
# リポジトリをクローン
git clone https://github.com/hezongxi/Tare.git
cd Tare

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev

# 本番ビルド
npm run build

# 配布用にパッケージ
npm run dist:win    # Windows
npm run dist        # 現在のプラットフォーム
```

### プロジェクト構造

```
Tare/
├── electron/              # メインプロセス (Electron)
│   ├── main.ts           # アプリエントリー、ウィンドウ管理
│   ├── tabManager.ts     # マルチタブ & BrowserView 管理
│   ├── popupManager.ts   # ポップアップウィンドウ管理
│   ├── ai/               # AI サービス（チャット、Agent）
│   ├── db/               # SQLite データベース（スキーマ、リポジトリ）
│   ├── ipc/              # IPC ハンドラー
│   └── skills/           # Skills エンジン
├── preload/              # プリロードスクリプト（コンテキストブリッジ）
├── src/                  # レンダラープロセス (React)
│   ├── components/
│   │   ├── browser/      # TabBar、NavigationBar、Sidebar、DropdownMenu
│   │   ├── ai/           # AISidebar、ChatInput、ChatMessages
│   │   ├── pages/        # 設定、履歴、ダウンロード、ブックマーク、Skills
│   │   └── common/       # 共有コンポーネント
│   ├── stores/           # Zustand ストア（タブ、チャット）
│   └── lib/              # 型、ユーティリティ
├── resources/            # アイコン、テストページ
└── electron-builder.yml  # ビルド設定
```

### 設定

Tare は **OpenAI 互換 API** に対応しています。設定画面で構成：

- **API Base URL**: `https://api.openai.com/v1` またはカスタムエンドポイント
- **API Key**: あなたの API キー
- **モデル**: GPT-4o、DeepSeek、または互換モデル

### 貢献

貢献を歓迎します！Pull Request をお気軽に提出してください。

### ライセンス

[MIT](LICENSE) — 個人・商用利用無料。

---

## 한국어

**Tare**는 **Electron + React + Vite**로 구축된 오픈소스 **AI 네이티브 브라우저**입니다. AI 어시스턴트를 브라우저 경험에 직접 통합하여 **QA 모드**로 빠른 답변을 제공하고 **Agent 모드**로 자율적인 웹 자동화, 폼 입력, 작업 실행을 지원합니다.

### 왜 Tare인가?

기존 브라우저에 AI 확장을 덧붙이는 방식과 달리, Tare는 **AI 퍼스트**로 처음부터 설계되었습니다. AI 사이드바는 일급 시민으로서 다음이 가능합니다:

- **어떤 AI 모델과도 대화** — OpenAI, DeepSeek, 로컬 모델 지원
- **웹 작업 자동화** — 폼 입력, 버튼 클릭, 데이터 추출, 페이지 탐색
- **Skills 실행** — 원클릭으로 트리거할 수 있는 사전 구축된 자동화 워크플로
- **슬래시 명령어** — 채팅에 `/`를 입력하여 모델 전환, Skills 호출, 대화 관리

### 주요 기능

| 기능 | 설명 |
|------|------|
| **AI 사이드바** | QA/Agent 이중 모드, localStorage로 대화 기록 영구 저장 |
| **Agent 모드** | 자율적 웹 자동화 — 클릭, 입력, 스크롤, 추출, 탐색 |
| **Skills 마켓** | 사전 구축된 자동화 스킬, 원클릭으로 활성화/비활성화/실행 |
| **슬래시 명령어** | `/skills`, `/model`, `/history`, `/clear` — 채팅 내 강력한 명령 팔레트 |
| **멀티탭 탐색** | 드래그 가능한 탭, 상태 영속화, 키보드 단축키 (Ctrl+T/W/Tab) |
| **스마트 북마크** | 분류, 검색, 빠른 접근을 갖춘 북마크 관리자 |
| **다운로드 관리** | 진행률 표시줄과 상태 표시기로 모든 다운로드 추적 |
| **기록 검색** | 방문 횟수 추적을 포함한 전문 검색 |
| **설정 페이지** | 검색, 카테고리, AI 모델 구성을 갖춘 Chrome 스타일 설정 |
| **커스텀 프로토콜** | `browser://settings`, `browser://history`, `browser://skills` — Chrome과 같은 내부 페이지 |
| **컨텍스트 메뉴** | 일반적인 브라우저 작업과 단축키가 포함된 우클릭 메뉴 |
| **폼 자동 입력** | Agent 모드에서의 AI 기반 지능형 폼 입력 |

### 기술 스택

- **데스크톱**: Electron 36, BrowserView 멀티프로세스 아키텍처
- **프론트엔드**: React 18, Vite 8, TailwindCSS 4, Zustand
- **데이터베이스**: SQLite (sql.js), FTS5 전문 검색 지원
- **AI**: OpenAI 호환 API (GPT-4o, DeepSeek, 로컬 모델 지원)
- **빌드**: electron-vite, electron-builder (Windows / macOS / Linux)

### 빠른 시작

```bash
# 리포지토리 클론
git clone https://github.com/hezongxi/Tare.git
cd Tare

# 의존성 설치
npm install

# 개발 서버 시작
npm run dev

# 프로덕션 빌드
npm run build

# 배포용 패키징
npm run dist:win    # Windows
npm run dist        # 현재 플랫폼
```

### 프로젝트 구조

```
Tare/
├── electron/              # 메인 프로세스 (Electron)
│   ├── main.ts           # 앱 엔트리, 윈도우 관리
│   ├── tabManager.ts     # 멀티탭 & BrowserView 관리
│   ├── popupManager.ts   # 팝업 윈도우 관리
│   ├── ai/               # AI 서비스 (채팅, Agent)
│   ├── db/               # SQLite 데이터베이스 (스키마, 저장소)
│   ├── ipc/              # IPC 핸들러
│   └── skills/           # Skills 엔진
├── preload/              # 프리로드 스크립트 (컨텍스트 브리지)
├── src/                  # 렌더러 프로세스 (React)
│   ├── components/
│   │   ├── browser/      # TabBar, NavigationBar, Sidebar, DropdownMenu
│   │   ├── ai/           # AISidebar, ChatInput, ChatMessages
│   │   ├── pages/        # 설정, 기록, 다운로드, 북마크, Skills
│   │   └── common/       # 공유 컴포넌트
│   ├── stores/           # Zustand 스토어 (탭, 채팅)
│   └── lib/              # 타입, 유틸리티
├── resources/            # 아이콘, 테스트 페이지
└── electron-builder.yml  # 빌드 설정
```

### 설정

Tare는 모든 **OpenAI 호환 API**를 지원합니다. 설정에서 구성:

- **API Base URL**: `https://api.openai.com/v1` 또는 커스텀 엔드포인트
- **API Key**: 귀하의 API 키
- **모델**: GPT-4o, DeepSeek 또는 호환 모델

### 기여

기여를 환영합니다! Pull Request를 자유롭게 제출해 주세요.

### 라이선스

[MIT](LICENSE) — 개인 및 상업 사용 무료.

---

## Español

**Tare** es un navegador de escritorio de código abierto con IA integrada, construido con **Electron + React + Vite**. Integra un asistente de IA directamente en tu experiencia de navegación, con **modo QA** para respuestas rápidas y **modo Agent** para automatización web autónoma, llenado de formularios y ejecución de tareas.

### ¿Por qué Tare?

A diferencia de los navegadores tradicionales con extensiones de IA añadidas, Tare está diseñado con **IA primero desde cero**. La barra lateral de IA es un ciudadano de primera clase que puede:

- **Chatear con cualquier modelo de IA** (OpenAI, DeepSeek, modelos locales) mientras navegas
- **Automatizar tareas web** — llenar formularios, hacer clic en botones, extraer datos, navegar páginas
- **Ejecutar Skills** — flujos de automatización predefinidos que puedes activar con un clic
- **Usar comandos slash** — escribe `/` en el chat para cambiar modelos, invocar skills o gestionar conversaciones

### Características principales

| Característica | Descripción |
|----------------|-------------|
| **Barra lateral de IA** | Chat de IA con modos QA y Agent, historial de conversaciones con persistencia en localStorage |
| **Modo Agent** | Automatización web autónoma — clic, escribir, desplazarse, extraer, navegar |
| **Mercado de Skills** | Skills de automatización predefinidos, activar/desactivar/ejecutar con un clic |
| **Comandos Slash** | `/skills`, `/model`, `/history`, `/clear` — potente paleta de comandos en el chat |
| **Navegación multi-pestaña** | Pestañas arrastrables con persistencia de estado, atajos de teclado (Ctrl+T/W/Tab) |
| **Marcadores inteligentes** | Gestor de marcadores con categorización, búsqueda y acceso rápido |
| **Gestor de descargas** | Seguimiento de todas las descargas con barras de progreso e indicadores de estado |
| **Búsqueda de historial** | Búsqueda de texto completo en el historial con seguimiento de visitas |
| **Página de configuración** | Configuración estilo Chrome con búsqueda, categorías y configuración de modelos de IA |
| **Protocolo personalizado** | `browser://settings`, `browser://history`, `browser://skills` — páginas internas como Chrome |
| **Menú contextual** | Menú de clic derecho con acciones comunes del navegador y atajos |
| **Auto-llenado de formularios** | Llenado inteligente de formularios con IA para el modo Agent |

### Stack tecnológico

- **Escritorio**: Electron 36, arquitectura multiproceso BrowserView
- **Frontend**: React 18, Vite 8, TailwindCSS 4, Zustand
- **Base de datos**: SQLite (sql.js) con búsqueda de texto completo FTS5
- **IA**: API compatible con OpenAI (soporta GPT-4o, DeepSeek, modelos locales)
- **Build**: electron-vite, electron-builder (Windows / macOS / Linux)

### Inicio rápido

```bash
# Clonar el repositorio
git clone https://github.com/hezongxi/Tare.git
cd Tare

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Empaquetar para distribución
npm run dist:win    # Windows
npm run dist        # Plataforma actual
```

### Estructura del proyecto

```
Tare/
├── electron/              # Proceso principal (Electron)
│   ├── main.ts           # Entrada de la app, gestión de ventanas
│   ├── tabManager.ts     # Gestión de multi-pestañas y BrowserView
│   ├── popupManager.ts   # Gestión de ventanas emergentes
│   ├── ai/               # Servicios de IA (chat, agent)
│   ├── db/               # Base de datos SQLite (esquema, repositorios)
│   ├── ipc/              # Manejadores IPC
│   └── skills/           # Motor de Skills
├── preload/              # Scripts de precarga (puente de contexto)
├── src/                  # Proceso de renderizado (React)
│   ├── components/
│   │   ├── browser/      # TabBar, NavigationBar, Sidebar, DropdownMenu
│   │   ├── ai/           # AISidebar, ChatInput, ChatMessages
│   │   ├── pages/        # Configuración, Historial, Descargas, Marcadores, Skills
│   │   └── common/       # Componentes compartidos
│   ├── stores/           # Stores Zustand (pestañas, chat)
│   └── lib/              # Tipos, utilidades
├── resources/            # Iconos, páginas de prueba
└── electron-builder.yml  # Configuración de build
```

### Configuración

Tare soporta cualquier **API compatible con OpenAI**. Configurar en Ajustes:

- **API Base URL**: `https://api.openai.com/v1` o tu endpoint personalizado
- **API Key**: Tu clave de API
- **Modelo**: GPT-4o, DeepSeek o cualquier modelo compatible

### Contribuir

¡Las contribuciones son bienvenidas! No dudes en enviar un Pull Request.

### Licencia

[MIT](LICENSE) — Uso personal y comercial gratuito.

---

## Français

**Tare** est un navigateur de bureau open source alimenté par l'IA, construit avec **Electron + React + Vite**. Il intègre un assistant IA directement dans votre expérience de navigation — mode **QA** pour des réponses rapides et mode **Agent** pour l'automatisation web autonome, le remplissage de formulaires et l'exécution de tâches.

### Pourquoi Tare ?

Contrairement aux navigateurs traditionnels avec des extensions IA ajoutées, Tare est conçu **IA d'abord depuis le début**. La barre latérale IA est un citoyen de première classe qui peut :

- **Discuter avec n'importe quel modèle IA** (OpenAI, DeepSeek, modèles locaux) pendant la navigation
- **Automatiser les tâches web** — remplir des formulaires, cliquer sur des boutons, extraire des données, naviguer
- **Exécuter des Skills** — des workflows d'automatisation pré-construits déclenchables en un clic
- **Utiliser des commandes slash** — tapez `/` dans le chat pour changer de modèle, invoquer des skills ou gérer les conversations

### Fonctionnalités clés

| Fonctionnalité | Description |
|----------------|-------------|
| **Barre latérale IA** | Chat IA avec modes QA et Agent, historique des conversations persistant via localStorage |
| **Mode Agent** | Automatisation web autonome — clic, saisie, défilement, extraction, navigation |
| **Marché de Skills** | Skills d'automatisation pré-construits, activer/désactiver/exécuter en un clic |
| **Commandes Slash** | `/skills`, `/model`, `/history`, `/clear` — palette de commandes puissante dans le chat |
| **Navigation multi-onglets** | Onglets glissables avec persistance d'état, raccourcis clavier (Ctrl+T/W/Tab) |
| **Marque-pages intelligents** | Gestionnaire de favoris avec catégorisation, recherche et accès rapide |
| **Gestionnaire de téléchargements** | Suivi de tous les téléchargements avec barres de progression et indicateurs de statut |
| **Recherche d'historique** | Recherche plein texte dans l'historique avec suivi du nombre de visites |
| **Page de paramètres** | Paramètres style Chrome avec recherche, catégories et configuration de modèles IA |
| **Protocole personnalisé** | `browser://settings`, `browser://history`, `browser://skills` — pages internes comme Chrome |
| **Menu contextuel** | Menu clic droit avec actions courantes du navigateur et raccourcis |
| **Remplissage auto de formulaires** | Remplissage intelligent de formulaires par IA pour le mode Agent |

### Stack technique

- **Bureau**: Electron 36, architecture multiprocessus BrowserView
- **Frontend**: React 18, Vite 8, TailwindCSS 4, Zustand
- **Base de données**: SQLite (sql.js) avec recherche plein texte FTS5
- **IA**: API compatible OpenAI (prend en charge GPT-4o, DeepSeek, modèles locaux)
- **Build**: electron-vite, electron-builder (Windows / macOS / Linux)

### Démarrage rapide

```bash
# Cloner le dépôt
git clone https://github.com/hezongxi/Tare.git
cd Tare

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build pour la production
npm run build

# Empaqueter pour distribution
npm run dist:win    # Windows
npm run dist        # Plateforme actuelle
```

### Structure du projet

```
Tare/
├── electron/              # Processus principal (Electron)
│   ├── main.ts           # Point d'entrée, gestion des fenêtres
│   ├── tabManager.ts     # Gestion multi-onglets et BrowserView
│   ├── popupManager.ts   # Gestion des fenêtres popup
│   ├── ai/               # Services IA (chat, agent)
│   ├── db/               # Base de données SQLite (schéma, dépôts)
│   ├── ipc/              # Gestionnaires IPC
│   └── skills/           # Moteur de Skills
├── preload/              # Scripts de préchargement (pont contextuel)
├── src/                  # Processus de rendu (React)
│   ├── components/
│   │   ├── browser/      # TabBar, NavigationBar, Sidebar, DropdownMenu
│   │   ├── ai/           # AISidebar, ChatInput, ChatMessages
│   │   ├── pages/        # Paramètres, Historique, Téléchargements, Favoris, Skills
│   │   └── common/       # Composants partagés
│   ├── stores/           # Stores Zustand (onglets, chat)
│   └── lib/              # Types, utilitaires
├── resources/            # Icônes, pages de test
└── electron-builder.yml  # Configuration de build
```

### Configuration

Tare prend en charge toute **API compatible OpenAI**. Configurer dans Paramètres :

- **API Base URL**: `https://api.openai.com/v1` ou votre endpoint personnalisé
- **API Key**: Votre clé API
- **Modèle**: GPT-4o, DeepSeek ou tout modèle compatible

### Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à soumettre une Pull Request.

### Licence

[MIT](LICENSE) — Utilisation personnelle et commerciale gratuite.

---

## Deutsch

**Tare** ist ein Open-Source, KI-nativer Desktop-Browser, gebaut mit **Electron + React + Vite**. Er integriert einen leistungsstarken KI-Assistenten direkt in Ihr Browsererlebnis — mit **QA-Modus** für schnelle Antworten und **Agent-Modus** für autonome Web-Automatisierung, Formularausfüllung und Aufgabenausführung.

### Warum Tare?

Im Gegensatz zu herkömmlichen Browsern mit nachträglich hinzugefügten KI-Erweiterungen ist Tare von Grund auf **KI-zuerst** konzipiert. Die KI-Seitenleiste ist ein erstklassiger Bürger, der folgendes kann:

- **Mit jedem KI-Modell chatten** (OpenAI, DeepSeek, lokale Modelle) während des Surfens
- **Web-Aufgaben automatisieren** — Formulare ausfüllen, Schaltflächen klicken, Daten extrahieren, Seiten navigieren
- **Skills ausführen** — vorgefertigte Automatisierungs-Workflows, mit einem Klick auslösbar
- **Slash-Befehle verwenden** — `/` im Chat eingeben, um Modelle zu wechseln, Skills aufzurufen oder Konversationen zu verwalten

### Hauptfunktionen

| Funktion | Beschreibung |
|----------|-------------|
| **KI-Seitenleiste** | KI-Chat mit QA- und Agent-Modi, Chatverlauf mit localStorage-Persistenz |
| **Agent-Modus** | Autonome Web-Automatisierung — Klicken, Tippen, Scrollen, Extrahieren, Navigieren |
| **Skills-Marktplatz** | Vorgefertigte Automatisierungs-Skills, mit einem Klick aktivieren/deaktivieren/ausführen |
| **Slash-Befehle** | `/skills`, `/model`, `/history`, `/clear` — leistungsstarke Befehlspalette im Chat |
| **Multi-Tab-Browsing** | Ziehbare Tabs mit Zustandsbeständigkeit, Tastenkombinationen (Ctrl+T/W/Tab) |
| **Intelligente Lesezeichen** | Lesezeichen-Manager mit Kategorisierung, Suche und Schnellzugriff |
| **Download-Manager** | Verfolgung aller Downloads mit Fortschrittsbalken und Statusanzeigen |
| **Verlaufssuche** | Volltextsuche im Browserverlauf mit Besuchszähler-Tracking |
| **Einstellungsseite** | Chrome-Stil-Einstellungen mit Suche, Kategorien und KI-Modellkonfiguration |
| **Benutzerdefiniertes Protokoll** | `browser://settings`, `browser://history`, `browser://skills` — interne Seiten wie Chrome |
| **Kontextmenü** | Rechtsklick-Menü mit gängigen Browseraktionen und Tastenkombinationen |
| **Formular-Autoausfüllen** | KI-gestütztes intelligentes Formularausfüllen für den Agent-Modus |

### Technologie-Stack

- **Desktop**: Electron 36, BrowserView-Multiprozess-Architektur
- **Frontend**: React 18, Vite 8, TailwindCSS 4, Zustand
- **Datenbank**: SQLite (sql.js) mit FTS5-Volltextsuche
- **KI**: OpenAI-kompatible API (unterstützt GPT-4o, DeepSeek, lokale Modelle)
- **Build**: electron-vite, electron-builder (Windows / macOS / Linux)

### Schnellstart

```bash
# Repository klonen
git clone https://github.com/hezongxi/Tare.git
cd Tare

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev

# Produktions-Build
npm run build

# Für Distribution paketieren
npm run dist:win    # Windows
npm run dist        # Aktuelle Plattform
```

### Projektstruktur

```
Tare/
├── electron/              # Hauptprozess (Electron)
│   ├── main.ts           # App-Einstieg, Fensterverwaltung
│   ├── tabManager.ts     # Multi-Tab- & BrowserView-Verwaltung
│   ├── popupManager.ts   # Popup-Fensterverwaltung
│   ├── ai/               # KI-Dienste (Chat, Agent)
│   ├── db/               # SQLite-Datenbank (Schema, Repositorys)
│   ├── ipc/              # IPC-Handler
│   └── skills/           # Skills-Engine
├── preload/              # Preload-Skripte (Kontext-Brücke)
├── src/                  # Renderer-Prozess (React)
│   ├── components/
│   │   ├── browser/      # TabBar, NavigationBar, Sidebar, DropdownMenu
│   │   ├── ai/           # AISidebar, ChatInput, ChatMessages
│   │   ├── pages/        # Einstellungen, Verlauf, Downloads, Lesezeichen, Skills
│   │   └── common/       # Gemeinsame Komponenten
│   ├── stores/           # Zustand-Stores (Tabs, Chat)
│   └── lib/              # Typen, Hilfsprogramme
├── resources/            # Symbole, Testseiten
└── electron-builder.yml  # Build-Konfiguration
```

### Konfiguration

Tare unterstützt jede **OpenAI-kompatible API**. In den Einstellungen konfigurieren:

- **API Base URL**: `https://api.openai.com/v1` oder Ihr benutzerdefinierter Endpunkt
- **API Key**: Ihr API-Schlüssel
- **Modell**: GPT-4o, DeepSeek oder jedes kompatible Modell

### Mitwirken

Beiträge sind willkommen! Zögern Sie nicht, einen Pull Request einzureichen.

### Lizenz

[MIT](LICENSE) — Kostenlose persönliche und kommerzielle Nutzung.

---

## Português

**Tare** é um navegador desktop open-source com IA integrada, construído com **Electron + React + Vite**. Integra um assistente de IA diretamente na sua experiência de navegação — com **modo QA** para respostas rápidas e **modo Agent** para automação web autônoma, preenchimento de formulários e execução de tarefas.

### Por que Tare?

Ao contrário dos navegadores tradicionais com extensões de IA adicionadas, o Tare é projetado com **IA primeiro desde o início**. A barra lateral de IA é um cidadão de primeira classe que pode:

- **Conversar com qualquer modelo de IA** (OpenAI, DeepSeek, modelos locais) enquanto navega
- **Automatizar tarefas web** — preencher formulários, clicar em botões, extrair dados, navegar páginas
- **Executar Skills** — fluxos de automação pré-construídos que você pode ativar com um clique
- **Usar comandos slash** — digite `/` no chat para trocar modelos, invocar skills ou gerenciar conversas

### Principais Funcionalidades

| Funcionalidade | Descrição |
|----------------|-----------|
| **Barra lateral de IA** | Chat de IA com modos QA e Agent, histórico de conversas com persistência via localStorage |
| **Modo Agent** | Automação web autônoma — clicar, digitar, rolar, extrair, navegar |
| **Mercado de Skills** | Skills de automação pré-construídos, ativar/desativar/executar com um clique |
| **Comandos Slash** | `/skills`, `/model`, `/history`, `/clear` — paleta de comandos poderosa no chat |
| **Navegação multi-abas** | Abas arrastáveis com persistência de estado, atalhos de teclado (Ctrl+T/W/Tab) |
| **Favoritos inteligentes** | Gerenciador de favoritos com categorização, busca e acesso rápido |
| **Gerenciador de downloads** | Rastreamento de todos os downloads com barras de progresso e indicadores de status |
| **Busca no histórico** | Busca de texto completo no histórico com rastreamento de contagem de visitas |
| **Página de configurações** | Configurações estilo Chrome com busca, categorias e configuração de modelos de IA |
| **Protocolo personalizado** | `browser://settings`, `browser://history`, `browser://skills` — páginas internas como o Chrome |
| **Menu de contexto** | Menu de clique direito com ações comuns do navegador e atalhos |
| **Preenchimento automático** | Preenchimento inteligente de formulários com IA para o modo Agent |

### Stack Tecnológico

- **Desktop**: Electron 36, arquitetura multiprocesso BrowserView
- **Frontend**: React 18, Vite 8, TailwindCSS 4, Zustand
- **Banco de dados**: SQLite (sql.js) com busca de texto completo FTS5
- **IA**: API compatível com OpenAI (suporta GPT-4o, DeepSeek, modelos locais)
- **Build**: electron-vite, electron-builder (Windows / macOS / Linux)

### Início Rápido

```bash
# Clonar o repositório
git clone https://github.com/hezongxi/Tare.git
cd Tare

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Empacotar para distribuição
npm run dist:win    # Windows
npm run dist        # Plataforma atual
```

### Estrutura do Projeto

```
Tare/
├── electron/              # Processo principal (Electron)
│   ├── main.ts           # Entrada do app, gerenciamento de janelas
│   ├── tabManager.ts     # Gerenciamento de multi-abas e BrowserView
│   ├── popupManager.ts   # Gerenciamento de janelas popup
│   ├── ai/               # Serviços de IA (chat, agent)
│   ├── db/               # Banco de dados SQLite (esquema, repositórios)
│   ├── ipc/              # Handlers IPC
│   └── skills/           # Motor de Skills
├── preload/              # Scripts de preload (ponte de contexto)
├── src/                  # Processo de renderização (React)
│   ├── components/
│   │   ├── browser/      # TabBar, NavigationBar, Sidebar, DropdownMenu
│   │   ├── ai/           # AISidebar, ChatInput, ChatMessages
│   │   ├── pages/        # Configurações, Histórico, Downloads, Favoritos, Skills
│   │   └── common/       # Componentes compartilhados
│   ├── stores/           # Stores Zustand (abas, chat)
│   └── lib/              # Tipos, utilitários
├── resources/            # Ícones, páginas de teste
└── electron-builder.yml  # Configuração de build
```

### Configuração

O Tare suporta qualquer **API compatível com OpenAI**. Configurar nas Configurações:

- **API Base URL**: `https://api.openai.com/v1` ou seu endpoint personalizado
- **API Key**: Sua chave de API
- **Modelo**: GPT-4o, DeepSeek ou qualquer modelo compatível

### Contribuir

Contribuições são bem-vindas! Sinta-se à vontade para enviar um Pull Request.

### Licença

[MIT](LICENSE) — Uso pessoal e comercial gratuito.

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
