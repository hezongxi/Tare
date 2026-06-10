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
