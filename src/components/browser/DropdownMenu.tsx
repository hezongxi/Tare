import React, { useEffect, useRef, useState } from 'react'
import {
  Plus, ExternalLink, Clock, Heart, Download,
  Search, Printer, Code, Settings, Info,
  Minus, ChevronRight, ZoomIn, ZoomOut, X
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { AppIcon } from '../common/AppIcon'

interface DropdownMenuProps {
  isOpen: boolean
  onClose: () => void
  onNewTab: () => void
  onOpenHistory: () => void
  onOpenSettings: () => void
  onOpenFavorites: () => void
  onOpenDownloads: () => void
  isPopup?: boolean
}

type MenuItemType = 'item' | 'divider' | 'zoom'

interface MenuItem {
  type: MenuItemType
  icon?: LucideIcon
  label?: string
  shortcut?: string
  hasSubmenu?: boolean
  danger?: boolean
  onClick?: () => void
}

// Electron zoomLevel ↔ percentage 转换 (zoomLevel 0 = 100%)
const ZOOM_STEPS = [25, 33, 50, 67, 75, 80, 90, 100, 110, 125, 150, 175, 200]

function percentToLevel(pct: number): number {
  // Electron uses log scale: level = log(1.2, pct/100)
  return Math.log(pct / 100) / Math.log(1.2)
}

function levelToPercent(level: number): number {
  return Math.round(Math.pow(1.2, level) * 100)
}

export function DropdownMenu({ isOpen, onClose, onNewTab, onOpenHistory, onOpenSettings, onOpenFavorites, onOpenDownloads, isPopup }: DropdownMenuProps): React.ReactElement | null {
  const menuRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(100)
  const [showFindBar, setShowFindBar] = useState(false)
  const [findText, setFindText] = useState('')
  const [showAbout, setShowAbout] = useState(false)
  const findInputRef = useRef<HTMLInputElement>(null)

  // 打开菜单时获取当前缩放级别
  useEffect(() => {
    if (isOpen || isPopup) {
      window.browserAPI?.getZoomLevel().then(level => {
        setZoom(levelToPercent(level))
      }).catch(() => {})
    }
  }, [isOpen, isPopup])

  // 点击外部关闭
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('keydown', handleEsc)
    }, 0)
    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleEsc)
      // 关闭时停止查找
      if (showFindBar) {
        window.browserAPI?.stopFindInPage()
      }
    }
  }, [isOpen, onClose, showFindBar])

  // 聚焦查找输入框
  useEffect(() => {
    if (showFindBar) {
      setTimeout(() => findInputRef.current?.focus(), 50)
    }
  }, [showFindBar])

  if (!isOpen && !isPopup) return null

  const handleZoomOut = async () => {
    const idx = ZOOM_STEPS.findIndex(s => s >= zoom)
    const newZoom = ZOOM_STEPS[Math.max(0, idx - 1)] || 25
    setZoom(newZoom)
    await window.browserAPI?.setZoomLevel(percentToLevel(newZoom))
  }

  const handleZoomIn = async () => {
    const idx = ZOOM_STEPS.findIndex(s => s >= zoom)
    const newZoom = ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, idx + 1)] || 200
    setZoom(newZoom)
    await window.browserAPI?.setZoomLevel(percentToLevel(newZoom))
  }

  const handleZoomReset = async () => {
    setZoom(100)
    await window.browserAPI?.setZoomLevel(0)
  }

  const handleFindSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (findText) {
      window.browserAPI?.findInPage(findText, { forward: true, findNext: false })
    }
  }

  const handleFindClose = () => {
    setShowFindBar(false)
    setFindText('')
    window.browserAPI?.stopFindInPage()
  }

  const handleAbout = () => {
    setShowAbout(true)
  }

  const menuItems: MenuItem[] = [
    { type: 'item', icon: Plus, label: '新建标签页', shortcut: 'Ctrl+T', onClick: onNewTab },
    { type: 'item', icon: ExternalLink, label: '新建窗口', shortcut: 'Ctrl+N', onClick: () => { window.browserAPI?.createTab() } },
    { type: 'divider' },
    { type: 'item', icon: Clock, label: '历史记录', shortcut: 'Ctrl+H', onClick: onOpenHistory },
    { type: 'item', icon: Heart, label: '收藏夹', shortcut: 'Ctrl+B', onClick: onOpenFavorites },
    { type: 'item', icon: Download, label: '下载管理', shortcut: 'Ctrl+J', onClick: onOpenDownloads },
    { type: 'divider' },
    { type: 'zoom' },
    { type: 'item', icon: Search, label: '页面查找', shortcut: 'Ctrl+F', onClick: () => setShowFindBar(true) },
    { type: 'item', icon: Printer, label: '打印', shortcut: 'Ctrl+P', onClick: () => { window.browserAPI?.print() } },
    { type: 'divider' },
    { type: 'item', icon: Code, label: '开发者工具', shortcut: 'F12', onClick: () => { window.browserAPI?.openDevTools() } },
    { type: 'divider' },
    { type: 'item', icon: Settings, label: '设置', onClick: onOpenSettings },
    { type: 'item', icon: Info, label: '关于 Tare', onClick: handleAbout },
  ]

  // popup 模式下的容器样式
  const containerClass = isPopup
    ? 'w-full h-full p-1'
    : 'absolute right-0 top-full mt-1 w-56 bg-white rounded-xl border border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-[100] overflow-hidden py-1.5 animate-fade-in-up'

  return (
    <div
      ref={menuRef}
      className={containerClass}
      style={isPopup ? { background: 'transparent' } : { animationDuration: '0.15s' }}
    >
      <div className={isPopup ? 'bg-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden py-1.5' : ''}>
      {menuItems.map((item, idx) => {
        if (item.type === 'divider') {
          return <div key={`div-${idx}`} className="my-1.5 mx-3 h-px bg-gray-100" />
        }

        if (item.type === 'zoom') {
          return (
            <div key="zoom" className="flex items-center justify-between px-3 py-1.5">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <ZoomIn className="w-4 h-4 text-gray-400" />
                <span>缩放</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleZoomOut}
                  className="w-6 h-6 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button
                  onClick={handleZoomReset}
                  className="text-xs text-gray-600 w-10 text-center font-medium hover:text-orange-500 transition-colors cursor-pointer"
                >
                  {zoom}%
                </button>
                <button
                  onClick={handleZoomIn}
                  className="w-6 h-6 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          )
        }

        const Icon = item.icon!
        return (
          <button
            key={item.label}
            onClick={() => { item.onClick?.(); if (item.label !== '页面查找' && item.label !== '关于 Tare') onClose() }}
            className={`
              w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors
              ${item.danger
                ? 'text-red-500 hover:bg-red-50'
                : 'text-gray-700 hover:bg-gray-50'}
            `}
          >
            <Icon className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="flex-1 text-center">{item.label}</span>
            {item.shortcut && (
              <span className="text-[10px] text-gray-400 font-mono">{item.shortcut}</span>
            )}
            {item.hasSubmenu && (
              <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            )}
          </button>
        )
      })}

      {/* 页面查找输入栏 */}
      {showFindBar && (
        <div className="border-t border-gray-100 px-3 py-2">
          <form onSubmit={handleFindSubmit} className="flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input
              ref={findInputRef}
              type="text"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFindSubmit(e as any)
                if (e.key === 'Escape') handleFindClose()
              }}
              placeholder="在页面中查找..."
              className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400"
              autoFocus
            />
            <button type="button" onClick={handleFindClose} className="p-0.5 rounded hover:bg-gray-100 text-gray-400">
              <X className="w-3 h-3" />
            </button>
          </form>
        </div>
      )}

      {/* 关于对话框 */}
      {showAbout && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30" onClick={() => setShowAbout(false)}>
          <div className="bg-white rounded-2xl p-6 w-80 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <AppIcon className="w-10 h-10 shrink-0 drop-shadow-sm" />
              <div>
                <h3 className="text-base font-semibold text-gray-800">Tare</h3>
                <p className="text-xs text-gray-400">v1.0.0</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              基于 Electron + React 的 AI 智能浏览器，集成大模型对话与自动化操作能力。
            </p>
            <button
              onClick={() => setShowAbout(false)}
              className="w-full py-2 rounded-lg bg-gradient-to-r from-orange-500 to-rose-500 text-white text-sm font-medium hover:shadow-md transition-all"
            >
              确定
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
