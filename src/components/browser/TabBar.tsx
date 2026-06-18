import React, { useEffect, useState } from 'react'
import { Home, Loader2, Plus, X } from 'lucide-react'
import { AppIcon } from '../common/AppIcon'
import { useTabStore } from '../../stores/tabStore'

export function TabBar(): React.ReactElement {
  const { tabs, activeTabId, setActiveTabId, addTab, removeTab, updateTab } = useTabStore()
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    if (!window.browserAPI) return

    const unsubs = [
      window.browserAPI.onTabCreated((tab) => addTab(tab)),
      window.browserAPI.onTabRemoved((tabId) => removeTab(tabId)),
      window.browserAPI.onTabUpdated((tabId, info) => updateTab(tabId, info)),
      window.browserAPI.onActiveTabChanged((tabId) => setActiveTabId(tabId)),
    ]

    return () => unsubs.forEach(fn => fn())
  }, [])

  useEffect(() => {
    if (!window.windowControlAPI) return
    window.windowControlAPI.isMaximized().then(setIsMaximized)
    const unsub = window.windowControlAPI.onMaximizedChanged(setIsMaximized)
    return () => unsub()
  }, [])

  const handleNewTab = async () => {
    await window.browserAPI?.createTab()
  }

  const handleCloseTab = (event: React.MouseEvent, tabId: string) => {
    event.stopPropagation()
    console.log('[TabBar] Closing tab:', tabId)
    window.browserAPI?.closeTab(tabId).then(() => {
      console.log('[TabBar] closeTab completed:', tabId)
    }).catch((err: any) => {
      console.error('[TabBar] closeTab error:', err)
    })
  }

  const handleTabClick = (tabId: string) => {
    window.browserAPI?.switchTab(tabId)
  }

  return (
    <header
      className="flex h-[52px] select-none items-center bg-[#f4f7fc] pl-5 pr-2"
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      <div className="flex w-[166px] shrink-0 items-center gap-2">
        <AppIcon className="h-8 w-8 rounded-lg shadow-[0_6px_16px_rgba(15,23,42,0.12)]" />
        <span className="truncate text-sm font-semibold text-slate-800">Tare AI 浏览器</span>
      </div>

      <div className="flex min-w-0 flex-1 items-end gap-2 self-end overflow-x-auto pb-1.5 pl-2">
        {tabs.map((tab) => {
          const active = tab.id === activeTabId
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className={`group flex h-10 min-w-[176px] max-w-[210px] items-center gap-2 rounded-t-xl px-3 text-center text-sm transition-all ${
                active
                  ? 'bg-white text-slate-800 shadow-[0_10px_26px_rgba(15,23,42,0.08)]'
                  : 'text-slate-500 hover:bg-white/70 hover:text-slate-700'
              }`}
              style={{ WebkitAppRegion: 'no-drag' } as any}
            >
              {tab.isLoading ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-orange-500" />
              ) : tab.favicon ? (
                <img src={tab.favicon} className="h-4 w-4 shrink-0 rounded-sm" alt="" />
              ) : (
                <Home className={`h-4 w-4 shrink-0 ${active ? 'text-blue-500' : 'text-slate-400'}`} />
              )}

              <span className="min-w-0 flex-1 truncate text-center">{tab.title || '新标签页'}</span>

              <span
                onClick={(event) => handleCloseTab(event, tab.id)}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all ${
                  active
                    ? 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                    : 'opacity-0 text-slate-400 hover:bg-slate-100 group-hover:opacity-100'
                }`}
              >
                <X className="h-3.5 w-3.5" />
              </span>
            </button>
          )
        })}

        <button
          type="button"
          onClick={handleNewTab}
          className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-white hover:text-slate-900"
          style={{ WebkitAppRegion: 'no-drag' } as any}
          title="新建标签页"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div
        className="ml-3 flex h-full shrink-0 items-center"
        style={{ WebkitAppRegion: 'no-drag' } as any}
      >
        <button
          type="button"
          onClick={() => window.windowControlAPI?.minimize()}
          className="flex h-full w-11 items-center justify-center text-slate-500 transition-colors hover:bg-white/70 hover:text-slate-800"
          title="最小化"
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <line x1="0" y1="5" x2="10" y2="5" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => window.windowControlAPI?.maximize()}
          className="flex h-full w-11 items-center justify-center text-slate-500 transition-colors hover:bg-white/70 hover:text-slate-800"
          title={isMaximized ? '还原' : '最大化'}
        >
          {isMaximized ? (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <rect x="2" y="0" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1" />
              <rect x="0" y="2" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <rect x="0.5" y="0.5" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          )}
        </button>

        <button
          type="button"
          onClick={() => window.windowControlAPI?.close()}
          className="flex h-full w-11 items-center justify-center text-slate-500 transition-colors hover:bg-red-500 hover:text-white"
          title="关闭"
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <line x1="0" y1="0" x2="10" y2="10" stroke="currentColor" strokeWidth="1.2" />
            <line x1="10" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
      </div>
    </header>
  )
}
