// ===== 鏍囩�椤?=====
export interface TabInfo {
  id: string
  url: string
  title: string
  favicon: string | null
  isLoading: boolean
  canGoBack: boolean
  canGoForward: boolean
  isNewTab?: boolean
  isInternalPage?: boolean
}

// ===== 鏀惰棌 =====
export interface Bookmark {
  id: number
  title: string
  url: string
  parentId: number
  isFolder: boolean
  sortOrder: number
  children?: Bookmark[]
}

// ===== 鍘嗗彶璁板綍 =====
export interface HistoryEntry {
  id: number
  url: string
  title: string
  visitCount: number
  lastVisited: string
  createdAt: string
}

// ===== 涓嬭浇 =====
export interface DownloadItem {
  id: number
  url: string
  filename: string
  savePath: string
  totalBytes: number
  receivedBytes: number
  status: 'downloading' | 'completed' | 'failed' | 'cancelled'
  createdAt: string
  completedAt: string | null
}

// ===== 鎶€鑳界郴缁?=====
export interface TriggerCondition {
  type: 'url_match' | 'page_content' | 'manual' | 'schedule'
  pattern: string
}

export interface ActionStep {
  order: number
  action: 'click' | 'type' | 'navigate' | 'scroll' | 'wait' | 'extract' | 'evaluate'
  target?: string
  value?: string
  description: string
}

export interface SkillParameter {
  name: string
  type: 'string' | 'number' | 'boolean' | 'select'
  label: string
  default?: string
  required: boolean
  options?: string[]
}

export interface Skill {
  id: string
  name: string
  description: string
  category: string
  triggers: TriggerCondition[]
  steps: ActionStep[]
  parameters: SkillParameter[]
  autoLearned: boolean
  enabled: boolean
  successCount: number
  failCount: number
  createdAt: string
  updatedAt: string
}

// ===== AI 对话 =====
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  actions?: BrowserAction[]
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  mode: 'qa' | 'agent'
  createdAt: string
  updatedAt: string
}

export interface BrowserAction {
  type: 'click' | 'type' | 'navigate' | 'scroll' | 'wait' | 'extract'
  target?: string
  value?: string
  status: 'pending' | 'executing' | 'done' | 'failed'
  result?: string
}

// ===== 璁板繂 =====
export interface MemoryEntry {
  id?: number
  category: string
  title: string
  content: Record<string, unknown>
  sourceUrl?: string
  confidence: number
  createdAt?: string
  lastUsed?: string
}

// ===== Agent =====
export interface AgentStep {
  stepNumber: number
  thought: string
  action: string
  params: Record<string, string>
  result?: string
  status: 'thinking' | 'acting' | 'done' | 'failed'
}

// ===== 璁剧疆 =====
export interface AppPreferences {
  searchEngine: string
  homePage: string
  theme: 'dark' | 'light' | 'system'
  openaiApiKey: string
  openaiBaseUrl: string
  model: string
}

// ===== Window API 澹版槑 =====
declare global {
  interface Window {
    browserAPI: {
      createTab: (url?: string) => Promise<TabInfo>
      closeTab: (tabId: string) => Promise<void>
      switchTab: (tabId: string) => Promise<void>
      navigate: (tabId: string, url: string) => Promise<void>
      goBack: (tabId: string) => Promise<void>
      goForward: (tabId: string) => Promise<void>
      reload: (tabId: string) => Promise<void>
      reorderTabs: (fromIndex: number, toIndex: number) => Promise<void>
      setSidebarWidth: (width: number) => Promise<void>
      setZoomLevel: (level: number) => Promise<void>
      getZoomLevel: () => Promise<number>
      openDevTools: () => Promise<void>
      print: () => Promise<void>
      findInPage: (text: string, options?: any) => Promise<void>
      stopFindInPage: () => Promise<void>
      onTabUpdated: (callback: (tabId: string, info: Partial<TabInfo>) => void) => () => void
      onTabCreated: (callback: (tab: TabInfo) => void) => () => void
      onTabRemoved: (callback: (tabId: string) => void) => () => void
      onActiveTabChanged: (callback: (tabId: string) => void) => () => void
      onHistoryUpdated: (callback: () => void) => () => void
    }
    aiAPI: {
      sendMessage: (message: string, context?: any) => Promise<void>
      stopGeneration: () => Promise<void>
      onPageContentRequest: () => Promise<string>
      runAgent: (goal: string) => Promise<{ success: boolean; summary: string; steps: AgentStep[] }>
      onToken: (callback: (token: string) => void) => () => void
      onDone: (callback: (fullText: string) => void) => () => void
      onError: (callback: (error: string) => void) => () => void
      onAgentStep: (callback: (step: any) => void) => () => void
      onAgentComplete: (callback: (result: { success: boolean; summary: string; steps: AgentStep[] }) => void) => () => void
    }
    memoryAPI: {
      getMemories: (category?: string) => Promise<MemoryEntry[]>
      addMemory: (memory: Omit<MemoryEntry, 'id'>) => Promise<MemoryEntry>
      deleteMemory: (id: number) => Promise<void>
      searchMemories: (query: string) => Promise<MemoryEntry[]>
    }
    skillAPI: {
      getSkills: () => Promise<Skill[]>
      createSkill: (skill: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Skill>
      updateSkill: (id: string, updates: Partial<Skill>) => Promise<Skill>
      deleteSkill: (id: string) => Promise<void>
      executeSkill: (id: string, params?: Record<string, string>) => Promise<void>
      onSkillSuggestion: (callback: (skill: Skill) => void) => () => void
    }
    dataAPI: {
      getHistory: (query?: string) => Promise<HistoryEntry[]>
      clearHistory: () => Promise<void>
      getBookmarks: () => Promise<Bookmark[]>
      addBookmark: (bookmark: Omit<Bookmark, 'id'>) => Promise<Bookmark>
      updateBookmark: (id: number, updates: Partial<Bookmark>) => Promise<Bookmark>
      deleteBookmark: (id: number) => Promise<void>
      getDownloads: () => Promise<DownloadItem[]>
      onDownloadUpdated: (callback: (download: DownloadItem) => void) => () => void
      getPreferences: () => Promise<AppPreferences>
      setPreference: (key: string, value: any) => Promise<void>
    }
    shortcutAPI: {
      onFocusUrlBar: (callback: () => void) => () => void
      onToggleAI: (callback: () => void) => () => void
    }
    windowControlAPI: {
      minimize: () => Promise<void>
      maximize: () => Promise<void>
      close: () => Promise<void>
      isMaximized: () => Promise<boolean>
      onMaximizedChanged: (callback: (isMaximized: boolean) => void) => () => void
    }
    popupAPI: {
      showMenu: (x: number, y: number) => Promise<void>
      showPanel: (type: string) => Promise<void>
      hide: () => Promise<void>
      getCurrentType: () => Promise<string>
      sendAction: (action: string, ...args: any[]) => void
      navigateTab: (url: string) => Promise<any>
      onClosed: (callback: (type: string) => void) => () => void
      onAction: (callback: (action: string, ...args: any[]) => void) => () => void
    }
  }
}
