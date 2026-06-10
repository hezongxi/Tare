<p align="center">
  <img src="resources/icon-256.png" alt="Tare" width="128" />
</p>

<h1 align="center">Tare</h1>

<p align="center">
  <strong>Der KI-native Browser mit integriertem Agent, Skills-Marktplatz und Automatisierung</strong>
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

**Tare** ist ein Open-Source-**KI-nativer Desktop-Browser**, der mit **Electron + React + Vite** entwickelt wurde. Er integriert einen leistungsstarken KI-Assistenten direkt in Ihr Browsing-Erlebnis und unterstützt den **QA-Modus** für schnelle Antworten sowie den **Agent-Modus** für autonome Web-Automatisierungsaufgaben.

### Warum Tare?

Im Gegensatz zu herkömmlichen Browsern mit nachträglich hinzugefügten KI-Erweiterungen ist Tare von Grund auf **KI-first** konzipiert. Die KI-Seitenleiste ist ein First-Class-Citizen, der Folgendes ermöglicht:

- **Chatten beim Surfen** — Unterstützt OpenAI, DeepSeek, lokale Modelle und mehr
- **Web-Aufgaben automatisieren** — Formulare ausfüllen, Schaltflächen klicken, Daten extrahieren, Seiten navigieren
- **Skills ausführen** — Vorgefertigte Automatisierungs-Workflows, mit einem Klick auslösbar
- **Slash-Befehle** — Geben Sie `/` im Chat ein, um Modelle zu wechseln, Skills aufzurufen oder Gespräche zu verwalten

### Hauptfunktionen

| Funktion | Beschreibung |
|----------|-------------|
| **KI-Seitenleiste** | Integrierter KI-Chat mit QA- und Agent-Modus, Gesprächsverlauf mit localStorage-Persistenz |
| **Agent-Modus** | Autonome Web-Automatisierung — Klicken, Tippen, Scrollen, Extrahieren, Navigieren |
| **Skills-Marktplatz** | Vorgefertigte Automatisierungs-Skills, mit einem Klick aktivieren/deaktivieren/ausführen |
| **Slash-Befehle** | `/skills`, `/model`, `/history`, `/clear` — leistungsstarke Befehlspalette im Chat |
| **Multi-Tab-Browsing** | Ziehbare Tabs mit Zustandspersistenz, Tastenkombinationen (Strg+T/W/Tab) |
| **Intelligente Lesezeichen** | Lesezeichen-Manager mit Kategorisierung, Suche und Schnellzugriff |
| **Download-Manager** | Verfolgung aller Downloads mit Fortschrittsbalken und Statusanzeigen |
| **Verlaufssuche** | Volltextsuche im Browserverlauf mit Besuchszähler |
| **Einstellungsseite** | Chrome-ähnliche Einstellungen mit Suche, Kategorien und KI-Modell-Konfiguration |
| **Internes Protokoll** | `browser://settings`, `browser://history`, `browser://skills` |
| **Kontextmenü** | Rechtsklick-Menü mit gängigen Browser-Aktionen und Tastenkombinationen |
| **Automatisches Formularausfüllen** | KI-gestütztes intelligentes Formularausfüllen im Agent-Modus |

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
│   ├── db/               # SQLite-Datenbank (Schema, Repositories)
│   ├── ipc/              # IPC-Handler
│   └── skills/           # Skills-Engine
├── preload/              # Preload-Skripte (Kontextbrücke)
├── src/                  # Renderer-Prozess (React)
│   ├── components/
│   │   ├── browser/      # TabBar, NavigationBar, Sidebar, DropdownMenu
│   │   ├── ai/           # AISidebar, ChatInput, ChatMessages
│   │   ├── pages/        # Einstellungen, Verlauf, Downloads, Lesezeichen, Skills
│   │   └── common/       # Gemeinsame Komponenten
│   ├── stores/           # Zustand-Stores (Tabs, Chat)
│   └── lib/              # Typen, Hilfsfunktionen
├── resources/            # Symbole, Testseiten
└── electron-builder.yml  # Build-Konfiguration
```

### Konfiguration

Tare unterstützt jede **OpenAI-kompatible API**. Konfigurieren Sie dies in den Einstellungen:

- **API-Basis-URL**: `https://api.openai.com/v1` oder Ihr benutzerdefinierter Endpunkt
- **API-Schlüssel**: Ihr API-Schlüssel
- **Modell**: GPT-4o, DeepSeek oder jedes kompatible Modell

### Beiträge

Beiträge sind willkommen! Zögern Sie nicht, einen Pull Request einzureichen.

### Lizenz

[MIT](LICENSE) — Kostenlos für private und kommerzielle Nutzung.

---

<p align="center">
  <a href="README.md">🔙 Zurück zur englischen Version</a>
</p>
