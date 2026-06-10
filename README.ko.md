<p align="center">
  <img src="resources/icon-256.png" alt="Tare" width="128" />
</p>

<h1 align="center">Tare</h1>

<p align="center">
  <strong>내장 Agent, Skills 마켓 및 자동화를 갖춘 AI 네이티브 브라우저</strong>
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

**Tare**는 **Electron + React + Vite**로 구축된 오픈소스 **AI 네이티브 데스크톱 브라우저**입니다. 강력한 AI 어시스턴트를 브라우징 경험에 깊이 통합하여 **QA 모드**로 빠른 답변을 제공하고 **Agent 모드**로 자율적인 웹 자동화 작업을 수행할 수 있습니다.

### 왜 Tare인가?

기존 브라우저에 AI 확장 기능을 덧붙이는 방식과 달리, Tare는 **처음부터 AI 퍼스트**로 설계되었습니다. AI 사이드바는 일급 시민으로서 다음을 제공합니다:

- **브라우징하면서 채팅** — OpenAI, DeepSeek, 로컬 모델 등 여러 AI 지원
- **웹 작업 자동화** — 양식 작성, 버튼 클릭, 데이터 추출, 페이지 탐색
- **Skills 실행** — 사전 구축된 자동화 워크플로를 원클릭으로 실행
- **슬래시 명령어** — 채팅에서 `/`를 입력하여 모델 전환, 스킬 호출, 대화 관리

### 주요 기능

| 기능 | 설명 |
|------|------|
| **AI 사이드바** | QA 모드와 Agent 모드를 갖춘 내장 AI 채팅, localStorage로 대화 기록 유지 |
| **Agent 모드** | 자율적인 웹 자동화 — 클릭, 입력, 스크롤, 추출, 탐색 |
| **Skills 마켓** | 사전 구축된 자동화 스킬, 원클릭으로 활성화/비활성화/실행 |
| **슬래시 명령어** | `/skills`, `/model`, `/history`, `/clear` — 채팅 내 강력한 명령 팔레트 |
| **멀티탭 브라우징** | 드래그 가능한 탭, 상태 유지, 키보드 단축키 (Ctrl+T/W/Tab) |
| **스마트 북마크** | 카테고리 관리, 검색, 빠른 접근 |
| **다운로드 관리자** | 진행 표시줄과 상태 표시기로 다운로드 추적 |
| **방문 기록 검색** | 브라우징 기록 전체 텍스트 검색, 방문 횟수 추적 |
| **설정 페이지** | Chrome 스타일 설정, 검색, 카테고리, AI 모델 구성 |
| **내부 프로토콜** | `browser://settings`, `browser://history`, `browser://skills` |
| **컨텍스트 메뉴** | 일반적인 브라우저 작업 및 단축키를 위한 우클릭 메뉴 |
| **양식 자동 작성** | Agent 모드에서 AI 기반 지능형 양식 작성 |

### 기술 스택

- **데스크톱**: Electron 36, BrowserView 멀티프로세스 아키텍처
- **프론트엔드**: React 18, Vite 8, TailwindCSS 4, Zustand
- **데이터베이스**: SQLite (sql.js), FTS5 전문 검색 지원
- **AI**: OpenAI 호환 API (GPT-4o, DeepSeek, 로컬 모델 지원)
- **빌드**: electron-vite, electron-builder (Windows / macOS / Linux)

### 빠른 시작

```bash
# 저장소 클론
git clone https://github.com/hezongxi/Tare.git
cd Tare

# 의존성 설치
npm install

# 개발 서버 시작
npm run dev

# 프로덕션 빌드
npm run build

# 배포용 패키지
npm run dist:win    # Windows
npm run dist        # 현재 플랫폼
```

### 프로젝트 구조

```
Tare/
├── electron/              # 메인 프로세스 (Electron)
│   ├── main.ts           # 앱 진입점, 윈도우 관리
│   ├── tabManager.ts     # 멀티탭 & BrowserView 관리
│   ├── popupManager.ts   # 팝업 윈도우 관리
│   ├── ai/               # AI 서비스 (채팅, 에이전트)
│   ├── db/               # SQLite 데이터베이스 (스키마, 리포지토리)
│   ├── ipc/              # IPC 핸들러
│   └── skills/           # Skills 엔진
├── preload/              # 프리로드 스크립트 (컨텍스트 브리지)
├── src/                  # 렌더러 프로세스 (React)
│   ├── components/
│   │   ├── browser/      # TabBar, NavigationBar, Sidebar, DropdownMenu
│   │   ├── ai/           # AISidebar, ChatInput, ChatMessages
│   │   ├── pages/        # 설정, 방문 기록, 다운로드, 북마크, Skills
│   │   └── common/       # 공유 컴포넌트
│   ├── stores/           # Zustand 스토어 (탭, 채팅)
│   └── lib/              # 타입, 유틸리티
├── resources/            # 아이콘, 테스트 페이지
└── electron-builder.yml  # 빌드 구성
```

### 설정

Tare는 **OpenAI 호환 API**를 지원합니다. 설정 페이지에서 구성하세요:

- **API 베이스 URL**: `https://api.openai.com/v1` 또는 커스텀 엔드포인트
- **API 키**: 귀하의 API 키
- **모델**: GPT-4o, DeepSeek 또는 호환 모델

### 기여

기여를 환영합니다! Pull Request를 자유롭게 제출해 주세요.

### 라이선스

[MIT](LICENSE) — 개인 및 상업적 사용이 무료입니다.

---

<p align="center">
  <a href="README.md">🔙 영어 버전으로 돌아가기</a>
</p>
