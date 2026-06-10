import React, { useState, useRef, useEffect } from 'react'
import { ArrowLeft, ArrowRight, RotateCw, Search, Heart, Settings, MoreVertical, Bot } from 'lucide-react'
import { useTabStore } from '../../stores/tabStore'

interface NavigationBarProps {
  onToggleHistory: () => void
  onOpenSettings: () => void
  onToggleAI: () => void
  onToggleFavorites: () => void
  onOpenDownloads: () => void
  showAI: boolean
}

export function NavigationBar({
  onToggleHistory, onOpenSettings, onToggleAI, onToggleFavorites, onOpenDownloads,
  showAI
}: NavigationBarProps): React.ReactElement {
  const { tabs, activeTabId } = useTabStore()
  const activeTab = tabs.find(t => t.id === activeTabId)
  const [urlInput, setUrlInput] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriteId, setFavoriteId] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const menuBtnRef = useRef<HTMLButtonElement>(null)
  // 防止 checkFavorite 异步回调覆盖用户点击后的状态
  const isTogglingRef = useRef(false)

  // 监听浮层操作回调
  useEffect(() => {
    const unsub = window.popupAPI?.onAction((action, ...args) => {
      switch (action) {
        case 'newTab': window.browserAPI?.createTab(); break
        case 'openHistory': onToggleHistory(); break
        case 'openSettings': onOpenSettings(); break
        case 'openFavorites': onToggleFavorites(); break
        case 'openDownloads': onOpenDownloads(); break
        // navigate 由 App.tsx 统一处理
      }
    })
    return () => { unsub?.() }
  }, [onToggleHistory, onOpenSettings, onToggleFavorites, onOpenDownloads])

  // 当活跃标签变化时更新 URL 输入框 + 检查收藏状态
  useEffect(() => {
    // URL 变化时重置，允许新一轮的 checkFavorite
    isTogglingRef.current = false
    if (activeTab && !isFocused) {
      setUrlInput(activeTab.url || '')
    }
    // 检查当前页是否已收藏
    const checkFavorite = async () => {
      if (!activeTab?.url) { setIsFavorited(false); setFavoriteId(null); return }
      try {
        const bookmarks = await window.dataAPI?.getBookmarks() || []
        // 如果用户在此期间点击了收藏按钮，跳过状态覆盖
        if (isTogglingRef.current) return
        const found = bookmarks.find((b: any) => b.url === activeTab.url)
        if (found) { setIsFavorited(true); setFavoriteId(found.id) }
        else { setIsFavorited(false); setFavoriteId(null) }
      } catch { if (!isTogglingRef.current) { setIsFavorited(false); setFavoriteId(null) } }
    }
    checkFavorite()
  }, [activeTab?.url, activeTabId, isFocused])

  // 监听收藏变更事件（从收藏夹面板触发），同步更新 Star 状态
  useEffect(() => {
    const handleFavoritesChanged = async () => {
      if (!activeTab?.url) return
      try {
        const bookmarks = await window.dataAPI?.getBookmarks() || []
        const found = bookmarks.find((b: any) => b.url === activeTab.url)
        if (found) { setIsFavorited(true); setFavoriteId(found.id) }
        else { setIsFavorited(false); setFavoriteId(null) }
      } catch { /* ignore */ }
    }
    window.addEventListener('favorites-changed', handleFavoritesChanged)
    return () => window.removeEventListener('favorites-changed', handleFavoritesChanged)
  }, [activeTab?.url])

  // 监听快捷键聚焦事件
  useEffect(() => {
    const handleFocusUrlBar = () => {
      inputRef.current?.focus()
    }
    window.addEventListener('focus-url-bar', handleFocusUrlBar)
    return () => window.removeEventListener('focus-url-bar', handleFocusUrlBar)
  }, [])

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeTabId || !urlInput.trim()) return

    window.browserAPI?.navigate(activeTabId, urlInput.trim())
    inputRef.current?.blur()
  }

  const handleGoBack = () => {
    if (activeTabId) window.browserAPI?.goBack(activeTabId)
  }

  const handleGoForward = () => {
    if (activeTabId) window.browserAPI?.goForward(activeTabId)
  }

  const handleReload = () => {
    if (activeTabId) window.browserAPI?.reload(activeTabId)
  }

  const handleFocus = () => {
    setIsFocused(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const handleBlur = () => {
    setIsFocused(false)
    if (activeTab?.url) {
      setUrlInput(activeTab.url)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      inputRef.current?.blur()
    }
  }

  // 一键收藏/取消收藏（基于 DB 实时查询，避免过期 state 导致的双击问题）
  const handleToggleFavorite = async () => {
    if (!activeTab?.url || activeTab.isNewTab) return
    // 标记正在切换，防止 checkFavorite 异步回调覆盖状态
    isTogglingRef.current = true
    try {
      // 基于 DB 实时查询判断当前是否已收藏
      const existing = await window.dataAPI?.getBookmarks() || []
      const found = existing.find((b: any) => b.url === activeTab.url)
      if (found) {
        // 已收藏 → 取消收藏
        await window.dataAPI?.deleteBookmark(found.id)
        setIsFavorited(false)
        setFavoriteId(null)
      } else {
        // 未收藏 → 添加收藏
        const result = await window.dataAPI?.addBookmark({
          title: activeTab.title || activeTab.url,
          url: activeTab.url,
          parentId: 0,
          isFolder: false,
          sortOrder: 0,
        } as any)
        if (result?.id) {
          setIsFavorited(true)
          setFavoriteId(result.id)
        }
      }
      // 通知收藏夹面板刷新
      window.dispatchEvent(new CustomEvent('favorites-changed'))
    } catch (e) {
      console.error('收藏操作失败:', e)
    } finally {
      // 延迟重置，确保 checkFavorite 的异步回调已经全部过期
      setTimeout(() => { isTogglingRef.current = false }, 300)
    }
  }

  const navBtn = "p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-150 hover:scale-105 active:scale-95"

  return (
    <div className="h-11 bg-white flex items-center px-3 gap-1.5 border-b border-gray-100">
      {/* 导航按钮 */}
      <button onClick={handleGoBack} disabled={!activeTab?.canGoBack} className={navBtn} title="后退">
        <ArrowLeft className="w-4 h-4" />
      </button>
      <button onClick={handleGoForward} disabled={!activeTab?.canGoForward} className={navBtn} title="前进">
        <ArrowRight className="w-4 h-4" />
      </button>
      <button onClick={handleReload} className={`${navBtn} ${activeTab?.isLoading ? 'pointer-events-none' : ''}`} title="刷新">
        <RotateCw className={`w-4 h-4 ${activeTab?.isLoading ? 'animate-spin' : ''}`} />
      </button>

      {/* URL 栏 */}
      <form onSubmit={handleNavigate} className="flex-1 flex items-center">
        <div className={`
          flex items-center w-full rounded-full px-4 py-1.5 gap-2 transition-all duration-200
          ${isFocused
            ? 'bg-white border border-orange-300/60 shadow-[0_0_0_3px_rgba(249,115,22,0.08),0_2px_8px_rgba(249,115,22,0.06)]'
            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200/60 shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)]'}
        `}>
          <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="搜索，或输入网址"
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
          />
        </div>
      </form>

      {/* 右侧按钮 */}
      <button
        onClick={handleToggleFavorite}
        disabled={!activeTab?.url || activeTab?.isNewTab}
        className={`p-1.5 rounded-lg transition-all duration-150 hover:scale-105 active:scale-95 ${
          isFavorited ? 'text-orange-500 bg-orange-50 hover:bg-orange-100' : 'hover:bg-gray-100 text-gray-500'
        }`}
        title={isFavorited ? '取消收藏' : '收藏当前页'}
      >
        <Heart className="w-4 h-4" fill={isFavorited ? 'currentColor' : 'none'} />
      </button>
      <button
        onClick={onOpenSettings}
        className="p-1.5 rounded-lg transition-all duration-150 hover:scale-105 active:scale-95 hover:bg-gray-100 text-gray-500"
        title="设置"
      >
        <Settings className="w-4 h-4" />
      </button>
      <div className="relative">
        <button
          ref={menuBtnRef}
          onClick={() => {
            if (menuBtnRef.current) {
              const rect = menuBtnRef.current.getBoundingClientRect()
              const x = window.screenX + rect.right - 224
              const y = window.screenY + rect.bottom + 4
              window.popupAPI?.showMenu(x, y)
            }
          }}
          className={navBtn}
          title="菜单"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Chat 按钮 — 渐变色 */}
      <button
        onClick={onToggleAI}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
          showAI
            ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-200/50 scale-105'
            : 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md hover:shadow-lg hover:shadow-orange-200/50 hover:scale-105 active:scale-95'
        }`}
        title="AI 助手"
      >
        <Bot className="w-3.5 h-3.5" />
        <span>Chat</span>
      </button>
    </div>
  )
}
