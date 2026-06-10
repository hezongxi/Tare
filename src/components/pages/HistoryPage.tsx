import React, { useState, useEffect } from 'react'
import { Clock, Search, Trash2 } from 'lucide-react'
import type { HistoryEntry } from '../../lib/types'

export function HistoryPage(): React.ReactElement {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [query, setQuery] = useState('')

  const loadHistory = async () => {
    const data = await window.dataAPI?.getHistory(query || undefined)
    setHistory(data || [])
  }

  useEffect(() => {
    loadHistory()
    const unsub = window.browserAPI?.onHistoryUpdated(() => loadHistory())
    return () => { unsub?.() }
  }, [query])

  const handleClear = async () => {
    await window.dataAPI?.clearHistory()
    setHistory([])
  }

  const handleOpenUrl = async (url: string) => {
    window.popupAPI?.navigateTab(url)
  }

  return (
    <div className="absolute inset-0 bg-white flex flex-col overflow-hidden">
      {/* 顶部区域 */}
      <div className="px-8 pt-8 pb-5 shrink-0">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-orange-500" />
            历史记录
          </h1>
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            清除历史
          </button>
        </div>
        <div className="max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索历史记录..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm text-gray-800 bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-sm text-gray-500">
              {query ? '未找到匹配的历史记录' : '暂无历史记录'}
            </p>
          </div>
        ) : (
          <div className="max-w-3xl space-y-0.5">
            {history.map((entry) => (
              <div
                key={entry.id}
                onClick={() => handleOpenUrl(entry.url)}
                className="group relative flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                {/* hover 左侧橙色指示条 */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-0 bg-orange-500 rounded-full transition-all duration-200 group-hover:h-8" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate group-hover:text-gray-900">{entry.title || entry.url}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{entry.url}</p>
                  <p className="text-xs text-gray-300 mt-0.5">
                    访问 {entry.visit_count} 次 · {new Date(entry.last_visited).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
