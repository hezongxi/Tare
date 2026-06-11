import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Bot,
  Clock,
  Cpu,
  MessageCircle,
  Puzzle,
  Send,
  Square,
  Trash2,
  Wand2,
  Zap,
} from 'lucide-react'
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

export function ChatInput({
  isLoading,
  onSend,
  onStop,
  mode,
  onModeChange,
  onCommand,
  availableModels = [],
}: Props): React.ReactElement {
  const [input, setInput] = useState('')
  const [showCommands, setShowCommands] = useState(false)
  const [selectedCmdIndex, setSelectedCmdIndex] = useState(0)
  const [showSubItems, setShowSubItems] = useState<string | null>(null)
  const [subIndex, setSubIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const commandRef = useRef<HTMLDivElement>(null)

  const baseCommands: Command[] = useMemo(() => [
    { id: 'skills', label: '/skills', description: '浏览可用 Skills', icon: Puzzle },
    { id: 'skill-creator', label: '/skill-creator', description: '创建新 Skill', icon: Wand2 },
    { id: 'model', label: '/model', description: '切换 AI 模型', icon: Cpu, subItems: availableModels.map(m => ({ id: m, label: m })) },
    { id: 'history', label: '/history', description: '查看对话历史', icon: Clock },
    { id: 'clear', label: '/clear', description: '新建对话', icon: Trash2 },
  ], [availableModels])

  const query = input.startsWith('/') ? input.slice(1).toLowerCase() : ''
  const filteredCommands = query
    ? baseCommands.filter(c => c.id.includes(query) || c.label.includes(query))
    : baseCommands

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (commandRef.current && !commandRef.current.contains(event.target as Node)) {
        setShowCommands(false)
        setShowSubItems(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const resizeTextarea = () => {
    if (!textareaRef.current) return
    textareaRef.current.style.height = 'auto'
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 112)}px`
  }

  const handleChange = (value: string) => {
    setInput(value)
    setSelectedCmdIndex(0)
    setShowSubItems(null)
    setShowCommands(value.startsWith('/'))
    requestAnimationFrame(resizeTextarea)
  }

  const executeCommand = useCallback((cmdId: string, arg?: string) => {
    setInput('')
    setShowCommands(false)
    setShowSubItems(null)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    onCommand?.(cmdId, arg)
  }, [onCommand])

  const handleSubmit = (event?: React.FormEvent) => {
    event?.preventDefault()
    if (!input.trim() || isLoading) return
    onSend(input.trim())
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (showCommands) {
      if (showSubItems) {
        const items = baseCommands.find(c => c.id === showSubItems)?.subItems || []
        if (event.key === 'ArrowUp') {
          event.preventDefault()
          setSubIndex(i => Math.max(0, i - 1))
        } else if (event.key === 'ArrowDown') {
          event.preventDefault()
          setSubIndex(i => Math.min(items.length - 1, i + 1))
        } else if (event.key === 'Enter') {
          event.preventDefault()
          executeCommand(showSubItems, items[subIndex]?.id)
        } else if (event.key === 'Escape') {
          setShowSubItems(null)
          setShowCommands(false)
        }
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setSelectedCmdIndex(i => Math.max(0, i - 1))
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        setSelectedCmdIndex(i => Math.min(filteredCommands.length - 1, i + 1))
      } else if (event.key === 'Enter') {
        event.preventDefault()
        const cmd = filteredCommands[selectedCmdIndex]
        if (cmd?.subItems && cmd.subItems.length > 0) {
          setShowSubItems(cmd.id)
          setSubIndex(0)
        } else if (cmd) {
          executeCommand(cmd.id)
        }
      } else if (event.key === 'Escape') {
        setShowCommands(false)
      }
      return
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }

  const toggleMode = () => {
    onModeChange(mode === 'qa' ? 'agent' : 'qa')
  }

  return (
    <div className="relative shrink-0 border-t border-slate-200 bg-white px-4 pb-4 pt-3">
      {showCommands && (
        <div
          ref={commandRef}
          className="absolute bottom-full left-4 right-4 z-50 mb-2 max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-[0_18px_42px_rgba(15,23,42,0.14)]"
        >
          <div className="border-b border-slate-100 px-3 py-2 text-xs font-semibold text-slate-400">
            输入 / 选择命令
          </div>
          {showSubItems ? (
            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  setShowSubItems(null)
                  setShowCommands(true)
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-center text-xs text-slate-500 transition-colors hover:bg-slate-50"
              >
                返回
              </button>
              {(baseCommands.find(c => c.id === showSubItems)?.subItems || []).map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => executeCommand(showSubItems, item.id)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-center text-sm transition-colors ${
                    index === subIndex ? 'bg-orange-50 text-orange-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Cpu className="h-3.5 w-3.5 text-slate-400" />
                  {item.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="py-1">
              {filteredCommands.map((cmd, index) => (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={() => {
                    if (cmd.subItems && cmd.subItems.length > 0) {
                      setShowSubItems(cmd.id)
                      setSubIndex(0)
                    } else {
                      executeCommand(cmd.id)
                    }
                  }}
                  onMouseEnter={() => setSelectedCmdIndex(index)}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-center transition-colors ${
                    index === selectedCmdIndex ? 'bg-orange-50 text-orange-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <cmd.icon className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="min-w-0 flex-1 text-center">
                    <span className="text-sm font-semibold">{cmd.label}</span>
                    <span className="ml-2 text-xs text-slate-400">{cmd.description}</span>
                  </span>
                  {cmd.subItems && cmd.subItems.length > 0 && (
                    <span className="text-xs text-slate-400">→</span>
                  )}
                </button>
              ))}
              {filteredCommands.length === 0 && (
                <div className="px-3 py-4 text-center text-xs text-slate-400">无匹配命令</div>
              )}
            </div>
          )}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex min-h-[48px] items-end gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-[0_8px_22px_rgba(15,23,42,0.04)] focus-within:border-blue-200 focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.08)]"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(event) => handleChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息，/ 选择命令，Shift + Enter 换行"
          rows={1}
          className="max-h-28 min-h-[28px] flex-1 resize-none bg-transparent py-1 text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-400"
        />
        {isLoading ? (
          <button
            type="button"
            onClick={onStop}
            className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-400"
            title="停止生成"
          >
            <Square className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-500 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
            title="发送"
          >
            <Send className="h-4 w-4" />
          </button>
        )}
      </form>

      <div className="mt-2 flex items-center justify-between px-1 text-xs text-slate-400">
        <button
          type="button"
          onClick={toggleMode}
          className="flex items-center gap-1 rounded-full px-1.5 py-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          title="切换 AI 模式"
        >
          {mode === 'agent' ? <Zap className="h-3.5 w-3.5" /> : <MessageCircle className="h-3.5 w-3.5" />}
          {mode === 'agent' ? '智能体' : '智能问答'}
        </button>
        <span className="flex items-center gap-1">
          <Bot className="h-3.5 w-3.5" />
          AI 可能会犯错，请核实重要信息
        </span>
      </div>
    </div>
  )
}
