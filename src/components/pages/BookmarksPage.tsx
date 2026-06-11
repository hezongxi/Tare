import React, { useState, useEffect } from 'react'
import { Star, Search, Folder, Trash2, ExternalLink, Plus, Heart } from 'lucide-react'
import type { Bookmark as BookmarkType } from '../../lib/types'

type NavSection = 'navbar' | 'bookmarks'

export function BookmarksPage(): React.ReactElement {
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([])
  const [activeNav, setActiveNav] = useState<NavSection>('bookmarks')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')

  const loadBookmarks = async () => {
    const data = await window.dataAPI?.getBookmarks()
    setBookmarks(data || [])
  }

  useEffect(() => {
    loadBookmarks()
    const handleFavoritesChanged = () => loadBookmarks()
    window.addEventListener('favorites-changed', handleFavoritesChanged)
    return () => window.removeEventListener('favorites-changed', handleFavoritesChanged)
  }, [])

  const handleAdd = async () => {
    if (!newTitle.trim() || !newUrl.trim()) return
    const existing = await window.dataAPI?.getBookmarks() || []
    if (existing.some((b: any) => b.url === newUrl.trim())) return
    await window.dataAPI?.addBookmark({
      title: newTitle.trim(),
      url: newUrl.trim(),
      parentId: 0,
      isFolder: false,
      sortOrder: 0,
    } as any)
    setNewTitle('')
    setNewUrl('')
    setIsAdding(false)
    window.dispatchEvent(new CustomEvent('favorites-changed'))
    loadBookmarks()
  }

  const handleDelete = async (id: number) => {
    await window.dataAPI?.deleteBookmark(id)
    window.dispatchEvent(new CustomEvent('favorites-changed'))
    loadBookmarks()
  }

  const handleOpenUrl = async (url: string) => {
    // 在当前标签页导航到该 URL
    window.popupAPI?.navigateTab(url)
  }

  const filtered = searchQuery
    ? bookmarks.filter(b =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.url.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : bookmarks

  const navItems: { id: NavSection; label: string; icon: React.ComponentType<any> }[] = [
    { id: 'navbar', label: '导航栏', icon: Folder },
    { id: 'bookmarks', label: '收藏夹', icon: Folder },
  ]

  return (
    <div className="absolute inset-0 bg-white flex flex-col overflow-hidden">
      {/* 顶部标题 */}
      <div className="px-8 pt-8 pb-5 shrink-0 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2.5">
          <Star className="w-6 h-6 text-orange-500" fill="currentColor" />
          收藏
        </h1>
      </div>

      {/* 主体区域：左导航 + 右内容 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧导航 */}
        <div className="w-60 shrink-0 px-4 pb-4">
          <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
            {/* 搜索 */}
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索任意收藏内容，支持全文..."
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-xs text-gray-700 bg-white transition-all"
                />
              </div>
            </div>

            {/* 导航项 */}
            <div className="py-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                    activeNav === item.id
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-4 h-4 text-gray-400 shrink-0" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 添加按钮 */}
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="mt-3 flex items-center gap-1.5 px-4 py-2 text-xs text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors w-full justify-center"
          >
            <Plus className="w-3.5 h-3.5" />
            添加收藏
          </button>

          {/* 添加表单 */}
          {isAdding && (
            <div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="收藏名称"
                className="w-full bg-white text-sm text-gray-800 rounded-lg px-3 py-2 outline-none border border-gray-200 focus:border-orange-400/60 transition-all"
              />
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-white text-sm text-gray-800 rounded-lg px-3 py-2 outline-none border border-gray-200 focus:border-orange-400/60 transition-all"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                >
                  取消
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!newTitle.trim() || !newUrl.trim()}
                  className="px-3 py-1.5 text-xs text-white bg-gradient-to-r from-orange-500 to-rose-500 rounded-lg hover:shadow-sm transition-all disabled:opacity-40"
                >
                  添加
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 右侧内容区 */}
        <div className="flex-1 overflow-y-auto border-l border-gray-100 px-6 py-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <p className="text-sm">目录为空</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {filtered.map((bm) => (
                <div
                  key={bm.id}
                  className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Heart className="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors shrink-0" />
                  <button
                    onClick={() => handleOpenUrl(bm.url)}
                    className="flex-1 text-center min-w-0"
                  >
                    <p className="text-sm text-gray-800 truncate group-hover:text-gray-900">{bm.title}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{bm.url}</p>
                  </button>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => handleOpenUrl(bm.url)}
                      className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                      title="打开"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(bm.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                      title="删除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] text-gray-300 text-right mt-4 pr-2">概由 AI 生成仅供参考</p>
        </div>
      </div>
    </div>
  )
}
