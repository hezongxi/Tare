<p align="center">
  <img src="resources/icon-256.png" alt="Tare" width="128" />
</p>

<h1 align="center">Tare</h1>

<p align="center">
  <strong>AI ネイティブブラウザ — 内蔵 Agent、Skills マーケット、自動化</strong>
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

**Tare** は、**Electron + React + Vite** で構築されたオープンソースの **AI ネイティブデスクトップブラウザ**です。強力な AI アシスタントをブラウジング体験に深く統合し、**QA モード**による素早い回答と**Agent モード**による自律的な Web 自動化タスクの実行をサポートします。

### なぜ Tare？

従来のブラウザに AI 拡張機能を追加する方式とは異なり、Tare は**ボトムアップで AI ファースト**の設計です。AI サイドバーはファーストクラスシチズンとして、以下の機能を提供します：

- **閲覧しながらチャット** — OpenAI、DeepSeek、ローカルモデルなど複数の AI をサポート
- **Web タスクの自動化** — フォーム入力、ボタンクリック、データ抽出、ページナビゲーション
- **Skills の実行** — 事前構築された自動化ワークフローをワンクリックで起動
- **スラッシュコマンド** — チャットに `/` を入力してモデル切り替え、スキル呼び出し、会話管理

### 主な機能

| 機能 | 説明 |
|------|------|
| **AI サイドバー** | QA モードと Agent モードを備えた内蔵 AI チャット、localStorage で会話履歴を永続化 |
| **Agent モード** | 自律的な Web 自動化 — クリック、入力、スクロール、抽出、ナビゲーション |
| **Skills マーケット** | 事前構築された自動化スキル、ワンクリックで有効/無効/実行 |
| **スラッシュコマンド** | `/skills`、`/model`、`/history`、`/clear` — チャット内の強力なコマンドパレット |
| **マルチタブ閲覧** | ドラッグ可能なタブ、状態の永続化、キーボードショートカット (Ctrl+T/W/Tab) |
| **スマートブックマーク** | カテゴリ管理、検索、クイックアクセス |
| **ダウンロード管理** | プログレスバーとステータスインジケーターでダウンロードを追跡 |
| **履歴検索** | 閲覧履歴を全文検索、訪問回数カウント |
| **設定ページ** | Chrome スタイルの設定、検索、カテゴリ、AI モデル設定 |
| **内部プロトコル** | `browser://settings`、`browser://history`、`browser://skills` |
| **コンテキストメニュー** | 一般的なブラウザアクションとショートカットの右クリックメニュー |
| **フォーム自動入力** | Agent モードでの AI によるインテリジェントなフォーム入力 |

### 技術スタック

- **デスクトップ**: Electron 36、BrowserView マルチプロセスアーキテクチャ
- **フロントエンド**: React 18、Vite 8、TailwindCSS 4、Zustand
- **データベース**: SQLite (sql.js)、FTS5 全文検索サポート
- **AI**: OpenAI 互換 API（GPT-4o、DeepSeek、ローカルモデルをサポート）
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

# プロダクションビルド
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
│   ├── ai/               # AI サービス（チャット、エージェント）
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

Tare は**OpenAI 互換 API** をサポートしています。設定ページで構成してください：

- **API ベース URL**: `https://api.openai.com/v1` またはカスタムエンドポイント
- **API キー**: あなたの API キー
- **モデル**: GPT-4o、DeepSeek、または互換モデル

### 貢献

貢献を歓迎します！Pull Request をお気軽に提出してください。

### ライセンス

[MIT](LICENSE) — 個人および商用利用は無料です。

---

<p align="center">
  <a href="README.md">🔙 英語版に戻る</a>
</p>
