import React, { useState, useEffect } from 'react'
import {
  Zap, Search, FileText, Image, HardDrive, Film,
  CheckCircle2, Loader2, AlertCircle, FolderOpen, Download
} from 'lucide-react'

interface DownloadItem {
  id: number
  url: string
  filename: string
  save_path: string
  total_bytes: number
  received_bytes: number
  status: string
  created_at: string
  completed_at: string | null
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-500" />
    case 'downloading': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
    case 'failed':
    case 'cancelled': return <AlertCircle className="w-4 h-4 text-red-400" />
    default: return <Download className="w-4 h-4 text-gray-400" />
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case 'completed': return '已完成'
    case 'downloading': return '下载中'
    case 'failed': return '失败'
    case 'cancelled': return '已取消'
    default: return status
  }
}

export function DownloadsPage(): React.ReactElement {
  const [downloads, setDownloads] = useState<DownloadItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const loadDownloads = async () => {
    const data = await window.dataAPI?.getDownloads()
    setDownloads(data || [])
  }

  useEffect(() => {
    loadDownloads()
    const unsub = window.dataAPI?.onDownloadUpdated(() => loadDownloads())
    return () => { unsub?.() }
  }, [])

  const filtered = searchQuery
    ? downloads.filter(d => d.filename.toLowerCase().includes(searchQuery.toLowerCase()))
    : downloads

  return (
    <div className="absolute inset-0 bg-white flex flex-col overflow-hidden">
      {/* 顶部区域 */}
      <div className="px-8 pt-8 pb-5 shrink-0">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2.5 mb-5">
          <Zap className="w-6 h-6 text-orange-500" />
          下载记录
        </h1>
        <div className="max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索下载记录"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm text-gray-800 bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="flex items-center gap-6 mb-6">
              <FileText className="w-12 h-12 text-gray-300" />
              <Image className="w-12 h-12 text-gray-300" />
              <HardDrive className="w-12 h-12 text-gray-300" />
              <Film className="w-12 h-12 text-gray-300" />
            </div>
            <p className="text-sm text-gray-500">
              {searchQuery ? '未找到匹配的下载内容' : '您下载的文件会显示在此处'}
            </p>
          </div>
        ) : (
          <div className="max-w-3xl space-y-1">
            {filtered.map((dl) => {
              const progress = dl.total_bytes > 0 ? Math.round((dl.received_bytes / dl.total_bytes) * 100) : 0
              return (
                <div
                  key={dl.id}
                  className="group flex items-start gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="mt-0.5 shrink-0">{getStatusIcon(dl.status)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">{dl.filename}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">{getStatusText(dl.status)}</span>
                      {dl.status === 'downloading' && (
                        <>
                          <span className="text-xs text-gray-300">·</span>
                          <span className="text-xs text-gray-400">{progress}%</span>
                          <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden max-w-40">
                            <div
                              className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </>
                      )}
                      {dl.status === 'completed' && dl.total_bytes > 0 && (
                        <>
                          <span className="text-xs text-gray-300">·</span>
                          <span className="text-xs text-gray-400">{formatBytes(dl.total_bytes)}</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-300 mt-0.5">
                      {new Date(dl.created_at).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  {dl.status === 'completed' && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                        title="打开所在文件夹"
                      >
                        <FolderOpen className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
