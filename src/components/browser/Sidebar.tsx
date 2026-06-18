import React from 'react'
import {
  Bot,
  Clock,
  FileText,
  Globe,
  Heart,
  Home,
  PenLine,
  Search,
  Settings,
} from 'lucide-react'
import { useTabStore } from '../../stores/tabStore'

interface SidebarProps {
  onToggleHistory: () => void
  onToggleFavorites: () => void
  onOpenSettings: () => void
  onToggleSkills: () => void
  onToggleAI: () => void
  showAI: boolean
}

export function Sidebar({
  onToggleHistory,
  onToggleFavorites,
  onOpenSettings,
  onToggleSkills,
  onToggleAI,
  showAI,
}: SidebarProps): React.ReactElement {
  const { activeTabId, tabs } = useTabStore()
  const activeTab = tabs.find(tab => tab.id === activeTabId)
  const isNewTab = !activeTab || activeTab.isNewTab

  const mainItems = [
    {
      icon: Home,
      label: '新标签页',
      active: isNewTab,
      onClick: () => window.browserAPI?.createTab(),
    },
    {
      icon: Bot,
      label: 'AI 助手',
      active: showAI,
      onClick: onToggleAI,
    },
    {
      icon: Search,
      label: '智能搜索',
      active: false,
      onClick: () => window.dispatchEvent(new CustomEvent('focus-url-bar')),
    },
    {
      icon: Globe,
      label: '网页翻译',
      active: false,
      onClick: onToggleSkills,
    },
    {
      icon: FileText,
      label: '内容总结',
      active: false,
      onClick: onToggleSkills,
    },
    {
      icon: PenLine,
      label: 'AI 写作助手',
      active: false,
      onClick: onToggleSkills,
    },
  ]

  const lowerItems = [
    { icon: Clock, label: '历史记录', onClick: onToggleHistory },
    { icon: Heart, label: '收藏夹', onClick: onToggleFavorites },
  ]

  return (
    <aside className="flex w-[172px] shrink-0 flex-col bg-white/80 px-4 pb-5 pt-7 shadow-[0_10px_30px_rgba(15,23,42,0.03)]">
      <nav className="space-y-1">
        {mainItems.map(({ icon: Icon, label, active, onClick }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            title={label}
            className={`flex h-9 w-full items-center justify-center gap-2 rounded-lg px-2 text-sm font-medium transition-all ${
              active
                ? 'bg-blue-50 text-blue-600 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.05)]'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate text-center">{label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-1">
        {lowerItems.map(({ icon: Icon, label, onClick }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            title={label}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-lg px-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900"
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate text-center">{label}</span>
          </button>
        ))}

        <div className="mx-2 my-3 h-px bg-slate-200" />

        <button
          type="button"
          onClick={onOpenSettings}
          className="flex h-9 w-full items-center justify-center gap-2 rounded-lg px-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900"
          title="设置"
        >
          <Settings className="h-4 w-4 shrink-0" />
          <span className="text-center">设置</span>
        </button>
      </div>
    </aside>
  )
}
