<p align="center">
  <img src="resources/icon-256.png" alt="Tare" width="128" />
</p>

<h1 align="center">Tare</h1>

<p align="center">
  <strong>O navegador nativo de IA com Agent integrado, mercado de Skills e automação</strong>
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

**Tare** é um navegador de desktop de código aberto e **nativo de IA**, construído com **Electron + React + Vite**. Ele integra um poderoso assistente de IA diretamente na sua experiência de navegação, suportando o **modo QA** para respostas rápidas e o **modo Agent** para execução autônoma de tarefas de automação web.

### Por que Tare?

Ao contrário dos navegadores tradicionais com extensões de IA adicionadas, o Tare é projetado com **IA primeiro desde a base**. A barra lateral de IA é um cidadão de primeira classe que pode:

- **Conversar enquanto navega** — Suporta OpenAI, DeepSeek, modelos locais e mais
- **Automatizar tarefas web** — Preencher formulários, clicar em botões, extrair dados, navegar entre páginas
- **Executar Skills** — Fluxos de automação pré-construídos, acionáveis com um clique
- **Comandos slash** — Digite `/` no chat para trocar modelos, invocar skills ou gerenciar conversas

### Funcionalidades principais

| Funcionalidade | Descrição |
|----------------|-----------|
| **Barra lateral de IA** | Chat de IA integrado com modos QA e Agent, histórico de conversas com persistência em localStorage |
| **Modo Agent** | Automação web autônoma — clicar, digitar, rolar, extrair, navegar |
| **Mercado de Skills** | Skills de automação pré-construídos, ativar/desativar/executar com um clique |
| **Comandos slash** | `/skills`, `/model`, `/history`, `/clear` — poderosa paleta de comandos no chat |
| **Navegação multi-abas** | Abas arrastáveis com persistência de estado, atalhos de teclado (Ctrl+T/W/Tab) |
| **Favoritos inteligentes** | Gerenciador de favoritos com categorização, busca e acesso rápido |
| **Gerenciador de downloads** | Acompanhamento de downloads com barras de progresso e indicadores de status |
| **Pesquisa de histórico** | Pesquisa de texto completo no histórico de navegação com contagem de visitas |
| **Página de configurações** | Configurações estilo Chrome com busca, categorias e configuração de modelos de IA |
| **Protocolo interno** | `browser://settings`, `browser://history`, `browser://skills` |
| **Menu de contexto** | Menu de clique direito com ações comuns do navegador e atalhos |
| **Preenchimento automático de formulários** | Preenchimento inteligente de formulários com IA no modo Agent |

### Stack tecnológico

- **Desktop**: Electron 36, arquitetura multiprocessos com BrowserView
- **Frontend**: React 18, Vite 8, TailwindCSS 4, Zustand
- **Banco de dados**: SQLite (sql.js) com busca de texto completo FTS5
- **IA**: API compatível com OpenAI (suporta GPT-4o, DeepSeek, modelos locais)
- **Build**: electron-vite, electron-builder (Windows / macOS / Linux)

### Início rápido

```bash
# Clonar o repositório
git clone https://github.com/hezongxi/Tare.git
cd Tare

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build de produção
npm run build

# Empacotar para distribuição
npm run dist:win    # Windows
npm run dist        # Plataforma atual
```

### Estrutura do projeto

```
Tare/
├── electron/              # Processo principal (Electron)
│   ├── main.ts           # Entrada do aplicativo, gerenciamento de janelas
│   ├── tabManager.ts     # Gerenciamento de multi-abas e BrowserView
│   ├── popupManager.ts   # Gerenciamento de janelas popup
│   ├── ai/               # Serviços de IA (chat, agente)
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

O Tare suporta qualquer **API compatível com OpenAI**. Configure nas Configurações:

- **URL base da API**: `https://api.openai.com/v1` ou seu endpoint personalizado
- **Chave da API**: Sua chave de API
- **Modelo**: GPT-4o, DeepSeek ou qualquer modelo compatível

### Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para enviar um Pull Request.

### Licença

[MIT](LICENSE) — Gratuito para uso pessoal e comercial.

---

<p align="center">
  <a href="README.md">🔙 Voltar para o inglês</a>
</p>
