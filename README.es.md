<p align="center">
  <img src="resources/icon-256.png" alt="Tare" width="128" />
</p>

<h1 align="center">Tare</h1>

<p align="center">
  <strong>El navegador nativo de IA con Agent integrado, mercado de Skills y automatización</strong>
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

**Tare** es un navegador de escritorio de código abierto y **nativo de IA**, construido con **Electron + React + Vite**. Integra un potente asistente de IA directamente en tu experiencia de navegación, soportando el **modo QA** para respuestas rápidas y el **modo Agent** para tareas de automatización web autónomas.

### ¿Por qué Tare?

A diferencia de los navegadores tradicionales con extensiones de IA añadidas, Tare está diseñado con **IA primero desde la base**. La barra lateral de IA es un ciudadano de primera clase que puede:

- **Chatear mientras navegas** — Soporta OpenAI, DeepSeek, modelos locales y más
- **Automatizar tareas web** — Llenar formularios, hacer clic en botones, extraer datos, navegar páginas
- **Ejecutar Skills** — Flujos de automatización predefinidos que se activan con un clic
- **Comandos slash** — Escribe `/` en el chat para cambiar modelos, invocar skills o gestionar conversaciones

### Funciones principales

| Función | Descripción |
|---------|-------------|
| **Barra lateral de IA** | Chat de IA integrado con modos QA y Agent, historial de conversaciones con persistencia en localStorage |
| **Modo Agent** | Automatización web autónoma — clic, escribir, desplazarse, extraer, navegar |
| **Mercado de Skills** | Skills de automatización predefinidos, activar/desactivar/ejecutar con un clic |
| **Comandos slash** | `/skills`, `/model`, `/history`, `/clear` — potente paleta de comandos en el chat |
| **Navegación multi-pestaña** | Pestañas arrastrables con persistencia de estado, atajos de teclado (Ctrl+T/W/Tab) |
| **Marcadores inteligentes** | Gestor de marcadores con categorización, búsqueda y acceso rápido |
| **Gestor de descargas** | Seguimiento de descargas con barras de progreso e indicadores de estado |
| **Búsqueda de historial** | Búsqueda de texto completo en el historial de navegación con conteo de visitas |
| **Página de configuración** | Configuración estilo Chrome con búsqueda, categorías y configuración de modelos de IA |
| **Protocolo interno** | `browser://settings`, `browser://history`, `browser://skills` |
| **Menú contextual** | Menú de clic derecho con acciones comunes del navegador y atajos |
| **Autocompletado de formularios** | Llenado inteligente de formularios con IA en modo Agent |

### Stack tecnológico

- **Escritorio**: Electron 36, arquitectura multiproceso con BrowserView
- **Frontend**: React 18, Vite 8, TailwindCSS 4, Zustand
- **Base de datos**: SQLite (sql.js) con búsqueda de texto completo FTS5
- **IA**: API compatible con OpenAI (soporta GPT-4o, DeepSeek, modelos locales)
- **Compilación**: electron-vite, electron-builder (Windows / macOS / Linux)

### Inicio rápido

```bash
# Clonar el repositorio
git clone https://github.com/hezongxi/Tare.git
cd Tare

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Empaquetar para distribución
npm run dist:win    # Windows
npm run dist        # Plataforma actual
```

### Estructura del proyecto

```
Tare/
├── electron/              # Proceso principal (Electron)
│   ├── main.ts           # Entrada de la aplicación, gestión de ventanas
│   ├── tabManager.ts     # Gestión de multi-pestañas y BrowserView
│   ├── popupManager.ts   # Gestión de ventanas emergentes
│   ├── ai/               # Servicios de IA (chat, agente)
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
│   ├── stores/           # Stores de Zustand (pestañas, chat)
│   └── lib/              # Tipos, utilidades
├── resources/            # Iconos, páginas de prueba
└── electron-builder.yml  # Configuración de compilación
```

### Configuración

Tare soporta cualquier **API compatible con OpenAI**. Configúralo en Ajustes:

- **URL base de la API**: `https://api.openai.com/v1` o tu endpoint personalizado
- **Clave API**: Tu clave de API
- **Modelo**: GPT-4o, DeepSeek o cualquier modelo compatible

### Contribuciones

¡Las contribuciones son bienvenidas! No dudes en enviar un Pull Request.

### Licencia

[MIT](LICENSE) — Gratis para uso personal y comercial.

---

<p align="center">
  <a href="README.md">🔙 Volver al inglés</a>
</p>
