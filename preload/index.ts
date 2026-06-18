import { contextBridge, ipcRenderer } from 'electron'

// 窗口控制 API
contextBridge.exposeInMainWorld('windowControlAPI', {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  onMaximizedChanged: (callback: (isMaximized: boolean) => void) => {
    const listener = (_event: any, isMaximized: boolean) => callback(isMaximized)
    ipcRenderer.on('window:maximizedChanged', listener)
    return () => ipcRenderer.removeListener('window:maximizedChanged', listener)
  }
})

// 浏览器 API
contextBridge.exposeInMainWorld('browserAPI', {
  // 标签管理
  createTab: (url?: string) => ipcRenderer.invoke('browser:createTab', url),
  closeTab: (tabId: string) => ipcRenderer.invoke('browser:closeTab', tabId),
  switchTab: (tabId: string) => ipcRenderer.invoke('browser:switchTab', tabId),
  navigate: (tabId: string, url: string) => ipcRenderer.invoke('browser:navigate', tabId, url),
  goBack: (tabId: string) => ipcRenderer.invoke('browser:goBack', tabId),
  goForward: (tabId: string) => ipcRenderer.invoke('browser:goForward', tabId),
  reload: (tabId: string) => ipcRenderer.invoke('browser:reload', tabId),
  reorderTabs: (fromIndex: number, toIndex: number) =>
    ipcRenderer.invoke('browser:reorderTabs', fromIndex, toIndex),
  setSidebarWidth: (width: number) =>
    ipcRenderer.invoke('browser:setSidebarWidth', width),
  // 缩放
  setZoomLevel: (level: number) => ipcRenderer.invoke('browser:setZoomLevel', level),
  getZoomLevel: () => ipcRenderer.invoke('browser:getZoomLevel'),
  // 开发者工具
  openDevTools: () => ipcRenderer.invoke('browser:openDevTools'),
  // 打印
  print: () => ipcRenderer.invoke('browser:print'),
  // 页面查找
  findInPage: (text: string, options?: any) => ipcRenderer.invoke('browser:findInPage', text, options),
  stopFindInPage: () => ipcRenderer.invoke('browser:stopFindInPage'),

  // 事件监听 — 返回 unsubscribe 函数
  onTabUpdated: (callback: (tabId: string, info: any) => void) => {
    const listener = (_event: any, tabId: string, info: any) => callback(tabId, info)
    ipcRenderer.on('browser:tabUpdated', listener)
    return () => ipcRenderer.removeListener('browser:tabUpdated', listener)
  },
  onTabCreated: (callback: (tab: any) => void) => {
    const listener = (_event: any, tab: any) => callback(tab)
    ipcRenderer.on('browser:tabCreated', listener)
    return () => ipcRenderer.removeListener('browser:tabCreated', listener)
  },
  onTabRemoved: (callback: (tabId: string) => void) => {
    const listener = (_event: any, tabId: string) => callback(tabId)
    ipcRenderer.on('browser:tabRemoved', listener)
    return () => ipcRenderer.removeListener('browser:tabRemoved', listener)
  },
  onActiveTabChanged: (callback: (tabId: string) => void) => {
    const listener = (_event: any, tabId: string) => callback(tabId)
    ipcRenderer.on('browser:activeTabChanged', listener)
    return () => ipcRenderer.removeListener('browser:activeTabChanged', listener)
  },
  onHistoryUpdated: (callback: () => void) => {
    const listener = () => callback()
    ipcRenderer.on('browser:historyUpdated', listener)
    return () => ipcRenderer.removeListener('browser:historyUpdated', listener)
  },
  onTextSelected: (callback: (payload: { text: string; url: string; title: string }) => void) => {
    const listener = (_event: any, payload: { text: string; url: string; title: string }) => callback(payload)
    ipcRenderer.on('browser:textSelected', listener)
    return () => ipcRenderer.removeListener('browser:textSelected', listener)
  }
})

// AI API
contextBridge.exposeInMainWorld('aiAPI', {
  sendMessage: (message: string, context?: any) =>
    ipcRenderer.invoke('ai:sendMessage', message, context),
  stopGeneration: () => ipcRenderer.invoke('ai:stopGeneration'),
  onPageContentRequest: () => ipcRenderer.invoke('ai:getPageContent'),
  runAgent: (goal: string, history?: {role: string; content: string}[]) => ipcRenderer.invoke('ai:runAgent', goal, history),
  onToken: (callback: (token: string) => void) => {
    const listener = (_event: any, token: string) => callback(token)
    ipcRenderer.on('ai:token', listener)
    return () => ipcRenderer.removeListener('ai:token', listener)
  },
  onDone: (callback: (fullText: string) => void) => {
    const listener = (_event: any, fullText: string) => callback(fullText)
    ipcRenderer.on('ai:done', listener)
    return () => ipcRenderer.removeListener('ai:done', listener)
  },
  onError: (callback: (error: string) => void) => {
    const listener = (_event: any, error: string) => callback(error)
    ipcRenderer.on('ai:error', listener)
    return () => ipcRenderer.removeListener('ai:error', listener)
  },
  onAgentStep: (callback: (step: any) => void) => {
    const listener = (_event: any, step: any) => callback(step)
    ipcRenderer.on('agent:step', listener)
    return () => ipcRenderer.removeListener('agent:step', listener)
  },
  onAgentComplete: (callback: (result: any) => void) => {
    const listener = (_event: any, result: any) => callback(result)
    ipcRenderer.on('agent:complete', listener)
    return () => ipcRenderer.removeListener('agent:complete', listener)
  }
})

// 记忆系统 API
contextBridge.exposeInMainWorld('memoryAPI', {
  getMemories: (category?: string) => ipcRenderer.invoke('memory:getMemories', category),
  addMemory: (memory: any) => ipcRenderer.invoke('memory:addMemory', memory),
  deleteMemory: (id: number) => ipcRenderer.invoke('memory:deleteMemory', id),
  searchMemories: (query: string) => ipcRenderer.invoke('memory:searchMemories', query)
})

// 技能系统 API
contextBridge.exposeInMainWorld('skillAPI', {
  getSkills: () => ipcRenderer.invoke('skill:getSkills'),
  createSkill: (skill: any) => ipcRenderer.invoke('skill:createSkill', skill),
  updateSkill: (id: string, updates: any) => ipcRenderer.invoke('skill:updateSkill', id, updates),
  deleteSkill: (id: string) => ipcRenderer.invoke('skill:deleteSkill', id),
  executeSkill: (id: string, params?: any) =>
    ipcRenderer.invoke('skill:executeSkill', id, params),
  onSkillSuggestion: (callback: (skill: any) => void) => {
    const listener = (_event: any, skill: any) => callback(skill)
    ipcRenderer.on('skill:suggestion', listener)
    return () => ipcRenderer.removeListener('skill:suggestion', listener)
  }
})

// 快捷键 API
contextBridge.exposeInMainWorld('shortcutAPI', {
  onFocusUrlBar: (callback: () => void) => {
    const listener = () => callback()
    ipcRenderer.on('shortcut:focusUrlBar', listener)
    return () => ipcRenderer.removeListener('shortcut:focusUrlBar', listener)
  },
  onToggleAI: (callback: () => void) => {
    const listener = () => callback()
    ipcRenderer.on('shortcut:toggleAI', listener)
    return () => ipcRenderer.removeListener('shortcut:toggleAI', listener)
  }
})

// 数据 API (历史/书签/下载)
contextBridge.exposeInMainWorld('dataAPI', {
  // 历史
  getHistory: (query?: string) => ipcRenderer.invoke('data:getHistory', query),
  clearHistory: () => ipcRenderer.invoke('data:clearHistory'),

  // 书签
  getBookmarks: () => ipcRenderer.invoke('data:getBookmarks'),
  addBookmark: (bookmark: any) => ipcRenderer.invoke('data:addBookmark', bookmark),
  updateBookmark: (id: number, updates: any) =>
    ipcRenderer.invoke('data:updateBookmark', id, updates),
  deleteBookmark: (id: number) => ipcRenderer.invoke('data:deleteBookmark', id),

  // 下载
  getDownloads: () => ipcRenderer.invoke('data:getDownloads'),
  onDownloadUpdated: (callback: (download: any) => void) => {
    const listener = (_event: any, download: any) => callback(download)
    ipcRenderer.on('data:downloadUpdated', listener)
    return () => ipcRenderer.removeListener('data:downloadUpdated', listener)
  },

  // 设置
  getPreferences: () => ipcRenderer.invoke('data:getPreferences'),
  setPreference: (key: string, value: any) =>
    ipcRenderer.invoke('data:setPreference', key, value)
})

// 浮层窗口 API
contextBridge.exposeInMainWorld('popupAPI', {
  showMenu: (x: number, y: number) => ipcRenderer.invoke('popup:showMenu', x, y),
  showPanel: (type: string) => ipcRenderer.invoke('popup:showPanel', type),
  hide: () => ipcRenderer.invoke('popup:hide'),
  getCurrentType: () => ipcRenderer.invoke('popup:getCurrentType'),
  sendAction: (action: string, ...args: any[]) => ipcRenderer.send('popup:action', action, ...args),
  // 直接在主进程导航当前标签页（不走 renderer 中转，更可靠）
  navigateTab: (url: string) => ipcRenderer.invoke('popup:navigateTab', url),
  onClosed: (callback: (type: string) => void) => {
    const listener = (_event: any, type: string) => callback(type)
    ipcRenderer.on('popup:closed', listener)
    return () => ipcRenderer.removeListener('popup:closed', listener)
  },
  onAction: (callback: (action: string, ...args: any[]) => void) => {
    const listener = (_event: any, action: string, ...args: any[]) => callback(action, ...args)
    // 监听所有 popup: 前缀的频道
    const channels = [
      'popup:newTab', 'popup:openHistory', 'popup:openSettings',
      'popup:openFavorites', 'popup:openDownloads', 'popup:close',
      'popup:navigate'
    ]
    channels.forEach(ch => {
      ipcRenderer.on(ch, (_e: any, ...a: any[]) => {
        const actionName = ch.replace('popup:', '')
        callback(actionName, ...a)
      })
    })
    return () => {
      channels.forEach(ch => ipcRenderer.removeAllListeners(ch))
    }
  }
})
