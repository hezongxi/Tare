import React from 'react'
import { Clock, Heart, Settings, Puzzle } from 'lucide-react'

interface SidebarProps {
  onToggleHistory: () => void
  onToggleFavorites: () => void
  onOpenSettings: () => void
  onToggleSkills: () => void
}

export function Sidebar({ onToggleHistory, onToggleFavorites, onOpenSettings, onToggleSkills }: SidebarProps): React.ReactElement {
  const sidebarBtns = [
    { icon: Clock, label: '历史记录', onClick: onToggleHistory },
    { icon: Heart, label: '收藏夹', onClick: onToggleFavorites },
    { icon: Puzzle, label: 'Skills 市场', onClick: onToggleSkills },
  ]

  return (
    <div className="w-14 bg-white border-r border-gray-100 flex flex-col items-center py-3 shrink-0 shadow-[1px_0_8px_rgba(0,0,0,0.04)]">
      {/* 功能按钮 */}
      <div className="flex flex-col items-center gap-1">
        {sidebarBtns.map(({ icon: Icon, label, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 hover:scale-110 active:scale-95 transition-all duration-200"
            title={label}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>

      {/* 底部设置 */}
      <div className="mt-auto">
        <button
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 hover:scale-110 active:scale-95 transition-all duration-200"
          title="设置"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
