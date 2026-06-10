<p align="center">
  <img src="resources/icon-256.png" alt="Tare" width="128" />
</p>

<h1 align="center">Tare</h1>

<p align="center">
  <strong>Le navigateur natif IA avec Agent intégré, marché de Skills et automatisation</strong>
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

**Tare** est un navigateur de bureau open source et **natif IA**, construit avec **Electron + React + Vite**. Il intègre un puissant assistant IA directement dans votre expérience de navigation, prenant en charge le **mode QA** pour des réponses rapides et le **mode Agent** pour l'exécution autonome de tâches d'automatisation web.

### Pourquoi Tare ?

Contrairement aux navigateurs traditionnels avec des extensions IA ajoutées, Tare est conçu **IA d'abord depuis la base**. La barre latérale IA est un citoyen de première classe qui peut :

- **Discuter tout en naviguant** — Prend en charge OpenAI, DeepSeek, les modèles locaux et plus encore
- **Automatiser les tâches web** — Remplir des formulaires, cliquer sur des boutons, extraire des données, naviguer entre les pages
- **Exécuter des Skills** — Des flux d'automatisation prédéfinis déclenchables en un clic
- **Commandes slash** — Tapez `/` dans le chat pour changer de modèle, invoquer des skills ou gérer les conversations

### Fonctionnalités principales

| Fonctionnalité | Description |
|----------------|-------------|
| **Barre latérale IA** | Chat IA intégré avec modes QA et Agent, historique des conversations persistant via localStorage |
| **Mode Agent** | Automatisation web autonome — cliquer, taper, faire défiler, extraire, naviguer |
| **Marché de Skills** | Skills d'automatisation prédéfinis, activer/désactiver/exécuter en un clic |
| **Commandes slash** | `/skills`, `/model`, `/history`, `/clear` — puissante palette de commandes dans le chat |
| **Navigation multi-onglets** | Onglets déplaçables avec persistance d'état, raccourcis clavier (Ctrl+T/W/Tab) |
| **Signets intelligents** | Gestionnaire de signets avec catégorisation, recherche et accès rapide |
| **Gestionnaire de téléchargements** | Suivi des téléchargements avec barres de progression et indicateurs d'état |
| **Recherche d'historique** | Recherche plein texte dans l'historique de navigation avec comptage des visites |
| **Page de paramètres** | Paramètres style Chrome avec recherche, catégories et configuration des modèles IA |
| **Protocole interne** | `browser://settings`, `browser://history`, `browser://skills` |
| **Menu contextuel** | Menu clic droit avec actions courantes du navigateur et raccourcis |
| **Remplissage automatique de formulaires** | Remplissage intelligent des formulaires par IA en mode Agent |

### Stack technique

- **Bureau** : Electron 36, architecture multi-processus avec BrowserView
- **Frontend** : React 18, Vite 8, TailwindCSS 4, Zustand
- **Base de données** : SQLite (sql.js) avec recherche plein texte FTS5
- **IA** : API compatible OpenAI (prend en charge GPT-4o, DeepSeek, modèles locaux)
- **Build** : electron-vite, electron-builder (Windows / macOS / Linux)

### Démarrage rapide

```bash
# Cloner le dépôt
git clone https://github.com/hezongxi/Tare.git
cd Tare

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Build de production
npm run build

# Empaqueter pour distribution
npm run dist:win    # Windows
npm run dist        # Plateforme actuelle
```

### Structure du projet

```
Tare/
├── electron/              # Processus principal (Electron)
│   ├── main.ts           # Point d'entrée de l'application, gestion des fenêtres
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
│   │   ├── pages/        # Paramètres, Historique, Téléchargements, Signets, Skills
│   │   └── common/       # Composants partagés
│   ├── stores/           # Stores Zustand (onglets, chat)
│   └── lib/              # Types, utilitaires
├── resources/            # Icônes, pages de test
└── electron-builder.yml  # Configuration de build
```

### Configuration

Tare prend en charge toute **API compatible OpenAI**. Configurez dans les Paramètres :

- **URL de base de l'API** : `https://api.openai.com/v1` ou votre point d'accès personnalisé
- **Clé API** : Votre clé API
- **Modèle** : GPT-4o, DeepSeek ou tout modèle compatible

### Contributions

Les contributions sont les bienvenues ! N'hésitez pas à soumettre une Pull Request.

### Licence

[MIT](LICENSE) — Gratuit pour un usage personnel et commercial.

---

<p align="center">
  <a href="README.md">🔙 Retour à l'anglais</a>
</p>
