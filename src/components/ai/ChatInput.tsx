import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Square, FileText, Languages, ListChecks, MessageCircle, Zap, Puzzle, Wand2, Cpu, Clock, Trash2 } from 'lucide-react'
import type { Skill } from '../../lib/types'

export type ChatMode = 'qa' | 'agent'

interface Command {
  id: string
  label: string
  description: string
  icon: React.ComponentType<any>
  subItems?: { id: string; label: string }[]
}

interface Props {
  isLoading: boolean
  onSend: (message: string) => void
  onStop: () => void
  mode: ChatMode
  onModeChange: (mode: ChatMode) => void
  onCommand?: (command: string, arg?: string) => void
  availableSkills?: Skill[]
  availableModels?: string[]
}

export function ChatInput({ isLoading, onSend, onStop, mode, onModeChange, onCommand, availableSkills = [], availableModels = [] }: Props): React.ReactElement {
  const [input, setInput] = useState('')
  const [showCommands, setShowCommands] = useState(false)
  const [selectedCmdIndex, setSelectedCmdIndex] = useState(0)
  const [showSubItems, setShowSubItems] = useState<string | null>(null) // which command
  const [subIndex, setSubIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const commandRef = useRef<HTMLDivElement>(null)

  // 构建命令列表
  const baseCommands: Command[] = [
    { id: 'skills', label: '/skills', description: '浏览可用 Skills', icon: Puzzle },
    { id: 'skill-creator', label: '/skill-creator', description: '创建新 Skill', icon: Wand2 },
    { id: 'model', label: '/model', description: '切换 AI 模型', icon: Cpu, subItems: availableModels.map(m => ({ id: m, label: m })) },
    { id: 'history', label: '/history', description: '查看对话历史', icon: Clock },
    { id: 'clear', label: '/clear', description: '新建对话', icon: Trash2 },
  ]

  // 根据输入过滤命令
  const query = input.startsWith('/') ? input.slice(1).toLowerCase() : ''
  const filteredCommands = query
    ? baseCommands.filter(c => c.id.includes(query) || c.label.includes(query))
    : baseCommands

  // 点击外部关闭命令面板
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (commandRef.current && !commandRef.current.contains(e.target as Node)) {
        setShowCommands(false)
        setShowSubItems(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
    // 检测 / 前缀
    if (input.startsWith('/') || (textareaRef.current?.value || '').startsWith('/')) {
      setShowCommands(true)
      setSelectedCmdIndex(0)
      setShowSubItems(null)
    } else {
      setShowCommands(false)
      setShowSubItems(null)
    }
  }

  const executeCommand = useCallback((cmdId: string, arg?: string) => {
    setInput('')
    setShowCommands(false)
    setShowSubItems(null)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    onCommand?.(cmdId, arg)
  }, [onCommand])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showCommands) {
      if (showSubItems) {
        // 子菜单导航
        const items = baseCommands.find(c => c.id === showSubItems)?.subItems || []
        if (e.key === 'ArrowUp') { e.preventDefault(); setSubIndex(i => Math.max(0, i - 1)) }
        else if (e.key === 'ArrowDown') { e.preventDefault(); setSubIndex(i => Math.min(items.length - 1, i + 1)) }
        else if (e.key === 'Enter') { e.preventDefault(); executeCommand(showSubItems, items[subIndex]?.id) }
        else if (e.key === 'Escape') { setShowSubItems(null); setShowCommands(true) }
        return
      }
      // 主命令导航
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedCmdIndex(i => Math.max(0, i - 1)) }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedCmdIndex(i => Math.min(filteredCommands.length - 1, i + 1)) }
      else if (e.key === 'Enter') {
        e.preventDefault()
        const cmd = filteredCommands[selectedCmdIndex]
        if (cmd?.subItems && cmd.subItems.length > 0) {
          setShowSubItems(cmd.id)
          setSubIndex(0)
        } else if (cmd) {
          executeCommand(cmd.id)
        }
      } else if (e.key === 'Escape') {
        setShowCommands(false)
      }
      return
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return
    onSend(input.trim())
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const qaActions = [
    { icon: FileText, label: '总结本页', prompt: '请总结当前网页的主要内容' },
    { icon: Languages, label: '翻译本页', prompt: '请将当前网页内容翻译为中文' },
    { icon: ListChecks, label: '提取要点', prompt: '请提取当前网页的关键要点，以列表形式展示' },
  ]

  const agentActions = [
    { icon: Zap, label: '搜索内容', prompt: '请在搜索框中搜索：' },
    { icon: FileText, label: '提取页面', prompt: '请提取当前页面的所有文本内容' },
  ]

  const quickActions = mode === 'agent' ? agentActions : qaActions

  const modeBtn = (m: ChatMode, icon: React.ReactNode, label: string) => (
    <button
      type="button"
      onClick={() => onModeChange(m)}
      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
        mode === m
          ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-sm'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
      }`}
    >
      {icon}
      {label}
    </button>
  )

  return (
    <div className="border-t border-gray-100 p-3 space-y-2 bg-white relative">
      {/* 命令面板 */}
      {showCommands && (
        <div
          ref={commandRef}
          className="absolute bottom-full left-3 right-3 mb-1 bg-white rounded-xl border border-gray-200 shadow-lg max-h-60 overflow-y-auto z-50"
        >
          <div className="px-3 py-2 border-b border-gray-100">
            <span className="text-xs text-gray-400 font-medium">输入 / 选择命令</span>
          </div>
          {showSubItems ? (
            // 子项列表（如模型列表）
            <div>
              <button
                onClick={() => { setShowSubItems(null); setShowCommands(true) }}
                className="w-full px-3 py-1.5 text-left text-xs text-gray-400 hover:bg-gray-50 flex items-center gap-1"
              >
                ← 返回
              </button>
              {(baseCommands.find(c => c.id === showSubItems)?.subItems || []).map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => executeCommand(showSubItems, item.id)}
                  className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
                    i === subIndex ? 'bg-orange-50 text-orange-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5 text-gray-400" />
                  {item.label}
                </button>
              ))}
            </div>
          ) : (
            // 主命令列表
            filteredCommands.map((cmd, i) => (
              <button
                key={cmd.id}
                onClick={() => {
                  if (cmd.subItems && cmd.subItems.length > 0) {
                    setShowSubItems(cmd.id)
                    setSubIndex(0)
                  } else {
                    executeCommand(cmd.id)
                  }
                }}
                onMouseEnter={() => setSelectedCmdIndex(i)}
                className={`w-full px-3 py-2 text-left flex items-center gap-2.5 transition-colors ${
                  i === selectedCmdIndex ? 'bg-orange-50 text-orange-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <cmd.icon className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium">{cmd.label}</span>
                  <span className="text-xs text-gray-400 ml-2">{cmd.description}</span>
                </div>
                {cmd.subItems && cmd.subItems.length > 0 && (
                  <span className="text-xs text-gray-400">→</span>
                )}
              </button>
            ))
          )}
          {filteredCommands.length === 0 && !showSubItems && (
            <div className="px-3 py-4 text-center text-xs text-gray-400">无匹配命令</div>
          )}
        </div>
      )}

      {/* 模式切换 */}
      <div className="flex gap-1.5">
        {modeBtn('qa', <MessageCircle className="w-3 h-3" />, '智能问答')}
        {modeBtn('agent', <Zap className="w-3 h-3" />, '智能体')}
      </div>

      {/* 快捷操作 */}
      <div className="flex gap-1.5">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => onSend(action.prompt)}
            disabled={isLoading}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white hover:bg-gray-50 text-xs text-gray-600 border border-gray-200 hover:shadow-sm transition-all duration-150 disabled:opacity-50"
          >
            <action.icon className="w-3 h-3" />
            {action.label}
          </button>
        ))}
      </div>

      {/* 输入框 */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex-1 bg-gray-50 rounded-2xl px-3.5 py-2.5 border border-gray-200/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] focus-within:border-orange-300/60 focus-within:shadow-[0_0_0_2px_rgba(249,115,22,0.08)] transition-all duration-200">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder={mode === 'agent' ? '描述你想让 AI 完成的任务... 输入 / 查看命令' : '输入消息，/ 查看命令，Shift+Enter 换行...'}
            rows={1}
            className="w-full bg-transparent text-sm text-gray-800 outline-none resize-none placeholder-gray-400 leading-relaxed"
          />
        </div>
        {isLoading ? (
          <button
            onClick={handleStop}
            type="button"
            className="p-2.5 rounded-2xl bg-red-500 hover:bg-red-400 text-white transition-all shadow-sm hover:shadow-md active:scale-95"
            title="停止生成"
          >
            <Square className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white transition-all shadow-sm hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none active:scale-95"
            title="发送"
          >
            <Send className="w-4 h-4" />
          </button>
        )}
      </form>
    </div>
  )
}
