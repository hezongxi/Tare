import React, { useEffect, useState } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { useTabStore } from '../../stores/tabStore'

export function TabBar(): React.ReactElement {
  const { tabs, activeTabId, setActiveTabId, addTab, removeTab, updateTab, reorderTabs } = useTabStore()
  const [isMaximized, setIsMaximized] = useState(false)

  // 设置 IPC 事件监听（带 cleanup）
  useEffect(() => {
    if (!window.browserAPI) return

    const unsubs = [
      window.browserAPI.onTabCreated((tab) => addTab(tab)),
      window.browserAPI.onTabRemoved((tabId) => removeTab(tabId)),
      window.browserAPI.onTabUpdated((tabId, info) => updateTab(tabId, info)),
      window.browserAPI.onActiveTabChanged((tabId) => setActiveTabId(tabId))
    ]

    return () => unsubs.forEach(fn => fn())
  }, [])

  // 监听窗口最大化状态
  useEffect(() => {
    if (!window.windowControlAPI) return
    // 获取初始状态
    window.windowControlAPI.isMaximized().then(setIsMaximized)
    // 监听状态变化
    const unsub = window.windowControlAPI.onMaximizedChanged(setIsMaximized)
    return () => unsub()
  }, [])

  const handleNewTab = async () => {
    await window.browserAPI?.createTab()
  }

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation()
    window.browserAPI?.closeTab(tabId)
  }

  const handleTabClick = (tabId: string) => {
    window.browserAPI?.switchTab(tabId)
  }

  return (
    <div
      className="h-9 bg-white flex items-center px-2 select-none"
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      {/* 标签区域 */}
      <div className="flex-1 flex items-center gap-0.5 overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`
              group flex items-center gap-1.5 px-3 h-7 min-w-[100px] max-w-[200px] rounded-lg cursor-pointer text-xs
              transition-colors duration-100 shrink-0
              ${tab.id === activeTabId
                ? 'bg-gray-200/80 text-gray-900'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}
            `}
            style={{ WebkitAppRegion: 'no-drag' } as any}
          >
            {/* Favicon 或加载指示器 */}
            {tab.isLoading ? (
              <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin text-orange-500" />
            ) : tab.favicon ? (
              <img src={tab.favicon} className="w-3.5 h-3.5 shrink-0" alt="" />
            ) : (
              <div className="w-3.5 h-3.5 shrink-0 rounded-sm bg-gray-300" />
            )}

            {/* 标题 */}
            <span className="truncate flex-1">{tab.title || '新标签页'}</span>

            {/* 关闭按钮 */}
            <button
              onClick={(e) => handleCloseTab(e, tab.id)}
              className="shrink-0 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-300 transition-opacity text-gray-500"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* 新建标签按钮 */}
        <button
          onClick={handleNewTab}
          className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
          style={{ WebkitAppRegion: 'no-drag' } as any}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* 窗口控制按钮 */}
      <div
        className="flex items-center h-full shrink-0 ml-2"
        style={{ WebkitAppRegion: 'no-drag' } as any}
      >
        {/* 最小化 */}
        <button
          onClick={() => window.windowControlAPI?.minimize()}
          className="w-11 h-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          title="最小化"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" className="text-gray-500">
            <line x1="0" y1="5" x2="10" y2="5" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>

        {/* 最大化/还原 */}
        <button
          onClick={() => window.windowControlAPI?.maximize()}
          className="w-11 h-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          title={isMaximized ? '还原' : '最大化'}
        >
          {isMaximized ? (
            // 还原图标：两个错位叠加的小方框
            <svg width="10" height="10" viewBox="0 0 10 10" className="text-gray-500">
              <rect x="2" y="0" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1" />
              <rect x="0" y="2" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          ) : (
            // 最大化图标：单个方框
            <svg width="10" height="10" viewBox="0 0 10 10" className="text-gray-500">
              <rect x="0.5" y="0.5" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          )}
        </button>

        {/* 关闭 */}
        <button
          onClick={() => window.windowControlAPI?.close()}
          className="w-11 h-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
          title="关闭"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" className="text-gray-500 hover:text-white">
            <line x1="0" y1="0" x2="10" y2="10" stroke="currentColor" strokeWidth="1.2" />
            <line x1="10" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
      </div>
    </div>
  )
}
