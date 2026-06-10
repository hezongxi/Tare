import React, { useState, useEffect } from 'react'
import { Puzzle, Search, Play, ToggleLeft, ToggleRight } from 'lucide-react'
import type { Skill } from '../../lib/types'

export function SkillsPage(): React.ReactElement {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const loadSkills = async () => {
    setLoading(true)
    try {
      const data = await window.skillAPI?.getSkills()
      setSkills(data || [])
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => {
    loadSkills()
  }, [])

  const handleToggle = async (skill: Skill) => {
    try {
      await window.skillAPI?.updateSkill(skill.id, { enabled: !skill.enabled })
      loadSkills()
    } catch { /* ignore */ }
  }

  const handleExecute = async (skill: Skill) => {
    try {
      await window.skillAPI?.executeSkill(skill.id)
    } catch { /* ignore */ }
  }

  const filtered = searchQuery
    ? skills.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.description.toLowerCase().includes(searchQuery.toLowerCase()))
    : skills

  // 按分类分组
  const grouped = filtered.reduce<Record<string, Skill[]>>((acc, skill) => {
    const cat = skill.category || '其他'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(skill)
    return acc
  }, {})

  return (
    <div className="absolute inset-0 bg-white flex flex-col overflow-hidden">
      {/* 顶部区域 */}
      <div className="px-8 pt-8 pb-5 shrink-0">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2.5 mb-2">
          <Puzzle className="w-6 h-6 text-orange-500" />
          Skills 市场
        </h1>
        <p className="text-sm text-gray-400 mb-4">管理和运行自动化技能，在 AI 对话中输入 /skills 快速调用</p>
        <div className="max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索技能..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm text-gray-800 bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-8 h-8 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin mb-3" />
            <p className="text-sm">加载中...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Puzzle className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-sm text-gray-500">
              {searchQuery ? '未找到匹配的技能' : '暂无 Skills'}
            </p>
            <p className="text-xs text-gray-300 mt-1">使用 AI 对话中的 /skill-creator 命令创建新技能</p>
          </div>
        ) : (
          <div className="max-w-3xl">
            {Object.entries(grouped).map(([category, catSkills]) => (
              <div key={category} className="mb-6">
                <h2 className="text-sm font-semibold text-gray-500 tracking-wide mb-3 uppercase">{category}</h2>
                <div className="space-y-2">
                  {catSkills.map(skill => (
                    <div
                      key={skill.id}
                      className="group flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shrink-0 shadow-sm">
                        <Puzzle className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-800">{skill.name}</p>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                            {skill.successCount || 0} 次
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{skill.description}</p>
                        <div className="flex items-center gap-2 mt-2.5">
                          <button
                            onClick={() => handleExecute(skill)}
                            disabled={!skill.enabled}
                            className="flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-orange-50 text-orange-600 hover:bg-orange-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            <Play className="w-3 h-3" /> 执行
                          </button>
                          <button
                            onClick={() => handleToggle(skill)}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-colors ${
                              skill.enabled
                                ? 'bg-green-50 text-green-600 hover:bg-green-100'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            {skill.enabled
                              ? <><ToggleRight className="w-3 h-3" /> 已启用</>
                              : <><ToggleLeft className="w-3 h-3" /> 已禁用</>
                            }
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
