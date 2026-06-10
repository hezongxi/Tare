import { create } from 'zustand'
import type { TabInfo } from '../lib/types'

interface TabState {
  tabs: TabInfo[]
  activeTabId: string | null
  setActiveTabId: (id: string) => void
  addTab: (tab: TabInfo) => void
  removeTab: (tabId: string) => void
  updateTab: (tabId: string, info: Partial<TabInfo>) => void
  reorderTabs: (fromIndex: number, toIndex: number) => void
}

export const useTabStore = create<TabState>((set) => ({
  tabs: [],
  activeTabId: null,

  setActiveTabId: (id: string) => set({ activeTabId: id }),

  addTab: (tab: TabInfo) => set((state) => {
    // 去重防御：如果已存在相同 ID 的标签，忽略
    if (state.tabs.some(t => t.id === tab.id)) return state
    return {
      tabs: [...state.tabs, tab],
      activeTabId: tab.id
    }
  }),

  removeTab: (tabId: string) => set((state) => {
    const newTabs = state.tabs.filter(t => t.id !== tabId)
    return { tabs: newTabs }
  }),

  updateTab: (tabId: string, info: Partial<TabInfo>) => set((state) => ({
    tabs: state.tabs.map(t => t.id === tabId ? { ...t, ...info } : t)
  })),

  reorderTabs: (fromIndex: number, toIndex: number) => set((state) => {
    const newTabs = [...state.tabs]
    const [removed] = newTabs.splice(fromIndex, 1)
    newTabs.splice(toIndex, 0, removed)
    return { tabs: newTabs }
  })
}))
