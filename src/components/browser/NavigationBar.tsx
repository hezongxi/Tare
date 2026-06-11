import React, { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  MoreHorizontal,
  RotateCw,
  Search,
  Settings,
  Star,
  UserCircle,
} from 'lucide-react'
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
  onToggleHistory,
  onOpenSettings,
  onToggleAI,
  onToggleFavorites,
  onOpenDownloads,
  showAI,
}: NavigationBarProps): React.ReactElement {
  const { tabs, activeTabId } = useTabStore()
  const activeTab = tabs.find(t => t.id === activeTabId)
  const [urlInput, setUrlInput] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const menuBtnRef = useRef<HTMLButtonElement>(null)
  const isTogglingRef = useRef(false)

  useEffect(() => {
    const unsub = window.popupAPI?.onAction((action) => {
      switch (action) {
        case 'newTab':
          window.browserAPI?.createTab()
          break
        case 'openHistory':
          onToggleHistory()
          break
        case 'openSettings':
          onOpenSettings()
          break
        case 'openFavorites':
          onToggleFavorites()
          break
        case 'openDownloads':
          onOpenDownloads()
          break
      }
    })
    return () => { unsub?.() }
  }, [onToggleHistory, onOpenSettings, onToggleFavorites, onOpenDownloads])

  useEffect(() => {
    isTogglingRef.current = false
    if (activeTab && !isFocused) {
      setUrlInput(activeTab.url || '')
    }

    const checkFavorite = async () => {
      if (!activeTab?.url) {
        setIsFavorited(false)
        return
      }
      try {
        const bookmarks = await window.dataAPI?.getBookmarks() || []
        if (isTogglingRef.current) return
        setIsFavorited(Boolean(bookmarks.find((b: any) => b.url === activeTab.url)))
      } catch {
        if (!isTogglingRef.current) setIsFavorited(false)
      }
    }

    checkFavorite()
  }, [activeTab?.url, activeTabId, isFocused])

  useEffect(() => {
    const handleFavoritesChanged = async () => {
      if (!activeTab?.url) return
      try {
        const bookmarks = await window.dataAPI?.getBookmarks() || []
        setIsFavorited(Boolean(bookmarks.find((b: any) => b.url === activeTab.url)))
      } catch {
        setIsFavorited(false)
      }
    }
    window.addEventListener('favorites-changed', handleFavoritesChanged)
    return () => window.removeEventListener('favorites-changed', handleFavoritesChanged)
  }, [activeTab?.url])

  useEffect(() => {
    const handleFocusUrlBar = () => {
      inputRef.current?.focus()
    }
    window.addEventListener('focus-url-bar', handleFocusUrlBar)
    return () => window.removeEventListener('focus-url-bar', handleFocusUrlBar)
  }, [])

  const handleNavigate = (event: React.FormEvent) => {
    event.preventDefault()
    if (!activeTabId || !urlInput.trim()) return

    window.browserAPI?.navigate(activeTabId, urlInput.trim())
    inputRef.current?.blur()
  }

  const handleToggleFavorite = async () => {
    if (!activeTab?.url || activeTab.isNewTab) return
    isTogglingRef.current = true
    try {
      const existing = await window.dataAPI?.getBookmarks() || []
      const found = existing.find((b: any) => b.url === activeTab.url)
      if (found) {
        await window.dataAPI?.deleteBookmark(found.id)
        setIsFavorited(false)
      } else {
        await window.dataAPI?.addBookmark({
          title: activeTab.title || activeTab.url,
          url: activeTab.url,
          parentId: 0,
          isFolder: false,
          sortOrder: 0,
        } as any)
        setIsFavorited(true)
      }
      window.dispatchEvent(new CustomEvent('favorites-changed'))
    } catch (e) {
      console.error('收藏操作失败:', e)
    } finally {
      setTimeout(() => { isTogglingRef.current = false }, 300)
    }
  }

  const navBtn = 'flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-all hover:bg-white hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-25'
  const iconBtn = 'flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-35'

  return (
    <div className="mx-3.5 flex h-[56px] items-center rounded-xl border border-slate-200/80 bg-white/90 px-4 shadow-[0_8px_24px_rgba(15,23,42,0.035)]">
      <div className="flex w-[172px] shrink-0 items-center justify-center gap-3 pr-2">
        <button
          type="button"
          onClick={() => activeTabId && window.browserAPI?.goBack(activeTabId)}
          disabled={!activeTab?.canGoBack}
          className={navBtn}
          title="后退"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => activeTabId && window.browserAPI?.goForward(activeTabId)}
          disabled={!activeTab?.canGoForward}
          className={navBtn}
          title="前进"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => activeTabId && window.browserAPI?.reload(activeTabId)}
          className={navBtn}
          title="刷新"
        >
          <RotateCw className={`h-4 w-4 ${activeTab?.isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <form onSubmit={handleNavigate} className="min-w-0 flex-1">
        <div className={`flex h-10 items-center gap-3 rounded-full border px-4 transition-all ${
          isFocused
            ? 'border-blue-200 bg-white shadow-[0_0_0_3px_rgba(59,130,246,0.08)]'
            : 'border-transparent bg-slate-100/80 hover:bg-slate-100'
        }`}>
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={urlInput}
            onChange={(event) => setUrlInput(event.target.value)}
            onFocus={() => {
              setIsFocused(true)
              setTimeout(() => inputRef.current?.select(), 0)
            }}
            onBlur={() => {
              setIsFocused(false)
              setUrlInput(activeTab?.url || '')
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') inputRef.current?.blur()
            }}
            placeholder="搜索或输入网址"
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>
      </form>

      <div className="ml-4 flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={handleToggleFavorite}
          disabled={!activeTab?.url || activeTab?.isNewTab}
          className={`${iconBtn} ${isFavorited ? 'bg-amber-50 text-amber-500 hover:bg-amber-100' : ''}`}
          title={isFavorited ? '取消收藏' : '收藏当前页'}
        >
          <Star className="h-4 w-4" fill={isFavorited ? 'currentColor' : 'none'} />
        </button>
        <button type="button" onClick={onOpenSettings} className={iconBtn} title="设置">
          <Settings className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onToggleAI}
          className={`${iconBtn} ${showAI ? 'bg-orange-50 text-orange-500 hover:bg-orange-100' : ''}`}
          title="AI 助手"
        >
          <Bot className="h-4 w-4" />
        </button>
        <div className="h-7 w-px bg-slate-200" />
        <button type="button" className={iconBtn} title="账户">
          <UserCircle className="h-5 w-5" />
        </button>
        <button
          ref={menuBtnRef}
          type="button"
          onClick={() => {
            if (!menuBtnRef.current) return
            const rect = menuBtnRef.current.getBoundingClientRect()
            const x = window.screenX + rect.right - 224
            const y = window.screenY + rect.bottom + 4
            window.popupAPI?.showMenu(x, y)
          }}
          className={iconBtn}
          title="菜单"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
