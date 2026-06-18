import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Bot,
  Clock,
  FileText,
  Languages,
  ListChecks,
  MessageSquare,
  Plus,
  X,
} from 'lucide-react'
import { useChatStore } from '../../stores/chatStore'
import type { ChatMessage, Skill } from '../../lib/types'
import { ChatInput, type ChatMode } from './ChatInput'
import { ChatMessages } from './ChatMessages'

interface Props {
  isOpen: boolean
  onClose: () => void
  width: number
  minWidth: number
  maxWidth: number
  onResize: (width: number) => void
  selectedTextDraft?: {
    id: number
    text: string
    url: string
    title: string
  } | null
}

const PRESET_MODELS = [
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4-turbo',
  'gpt-3.5-turbo',
  'deepseek-chat',
  'deepseek-reasoner',
]

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error || '未知错误')
}

export function AISidebar({ isOpen, onClose, width, minWidth, maxWidth, onResize, selectedTextDraft }: Props): React.ReactElement | null {
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [mode, setMode] = useState<ChatMode>(
    () => (localStorage.getItem('ai-sidebar-mode') === 'agent' ? 'agent' : 'qa')
  )

  // mode 变化时持久化
  useEffect(() => {
    localStorage.setItem('ai-sidebar-mode', mode)
  }, [mode])
  const [showHistory, setShowHistory] = useState(false)
  const [currentModel, setCurrentModel] = useState('')
  const [skills, setSkills] = useState<Skill[]>([])
  const resizeStateRef = useRef<{ startX: number; startWidth: number } | null>(null)
  const timeoutRef = useRef<number | null>(null)

  const {
    sessions,
    currentSessionId,
    createSession,
    deleteSession,
    setCurrentSession,
    addMessage,
    loadFromStorage,
  } = useChatStore()

  const currentSession = sessions.find(s => s.id === currentSessionId)
  const messages = currentSession?.messages || []

  const stopLoading = useCallback(() => {
    setIsLoading(false)
    setStreamingContent('')
  }, [])

  useEffect(() => {
    loadFromStorage()
  }, [])

  useEffect(() => {
    window.dataAPI?.getPreferences().then(prefs => {
      setCurrentModel(prefs?.model || 'deepseek-chat')
    })
  }, [])

  useEffect(() => {
    window.skillAPI?.getSkills().then(list => setSkills(list || [])).catch(() => {})
  }, [])

  // 监听新标签页创建事件，重置 AI 状态
  useEffect(() => {
    if (!window.browserAPI) return
    const unsub = window.browserAPI.onTabCreated((tab) => {
      // 如果是新标签页（没有 URL），重置 AI 对话状态
      if (tab.isNewTab) {
        console.log('[AISidebar] New tab created, resetting AI state')
        setCurrentSession(null)
        setStreamingContent('')
        setIsLoading(false)
      }
    })
    return () => unsub()
  }, [setCurrentSession])

  // 重置超时计时器（agent 模式每步重置）
  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    const ms = mode === 'agent' ? 300000 : 120000
    timeoutRef.current = window.setTimeout(() => {
      window.aiAPI?.stopGeneration().catch(() => {})
      addMessage({
        role: 'assistant',
        content: '请求超时了，已自动停止。你可以检查 API Key、模型名称或网络后再试。',
        timestamp: new Date().toISOString(),
      })
      stopLoading()
    }, ms)
  }, [mode, addMessage, stopLoading])

  useEffect(() => {
    if (!isLoading) {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
      return
    }
    resetTimeout()
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    }
  }, [isLoading, resetTimeout])

  useEffect(() => {
    if (!window.aiAPI) return

    let currentContent = ''

    const unsub1 = window.aiAPI.onToken((token: string) => {
      currentContent += token
      setStreamingContent(currentContent)
    })

    const unsub2 = window.aiAPI.onDone((fullText: string) => {
      // fullText === '' 表示清除当前流式内容（Agent 降级/重试时用）
      if (fullText === '') {
        setStreamingContent('')
        currentContent = ''
        return  // 不添加消息，不停止 loading
      }
      const content = fullText || currentContent
      if (content.trim()) {
        const msg: ChatMessage = {
          role: 'assistant',
          content,
          timestamp: new Date().toISOString(),
        }
        addMessage(msg)
      }
      setIsLoading(false)
      setStreamingContent('')
      currentContent = ''
    })

    const unsub3 = window.aiAPI.onError((error: string) => {
      addMessage({
        role: 'assistant',
        content: `抱歉，出现错误: ${error}`,
        timestamp: new Date().toISOString(),
      })
      setIsLoading(false)
      setStreamingContent('')
      currentContent = ''
    })

    const unsub4 = window.aiAPI.onAgentStep((step: any) => {
      resetTimeout()
      let stepText = ''
      if (step.thought) stepText += `**思考:** ${step.thought}\n`
      if (step.action && step.action !== 'done') stepText += `**操作:** ${step.action}\n`
      if (step.result) stepText += `**结果:** ${step.result}`
      if (stepText) {
        addMessage({
          role: 'assistant',
          content: `**步骤 #${step.stepNumber}**\n${stepText}`,
          timestamp: new Date().toISOString(),
        })
      }
    })

    const unsub5 = window.aiAPI.onAgentComplete((result: any) => {
      addMessage({
        role: 'assistant',
        content: result.success
          ? `**任务完成**\n${result.summary}`
          : `**任务未完成**\n${result.summary}`,
        timestamp: new Date().toISOString(),
      })
      setIsLoading(false)
      setStreamingContent('')
    })

    return () => {
      unsub1()
      unsub2()
      unsub3()
      unsub4()
      unsub5()
    }
  }, [])

  const handleSend = useCallback(async (message: string) => {
    if (!message.trim()) return

    const history = messages.slice(-16).map(({ role, content }) => ({ role, content }))

    if (!currentSessionId) {
      createSession(mode)
    }

    addMessage({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    })

    setIsLoading(true)
    setStreamingContent('')

    if (mode === 'agent') {
      try {
        await window.aiAPI?.runAgent(message, history)
        stopLoading()
      } catch (e) {
        addMessage({
          role: 'assistant',
          content: `Agent 执行失败: ${e}`,
          timestamp: new Date().toISOString(),
        })
        stopLoading()
      }
      return
    }

    try {
      let pageContext = ''
      try {
        pageContext = await window.aiAPI?.onPageContentRequest() || ''
      } catch {
        pageContext = ''
      }
      await window.aiAPI?.sendMessage(message, { pageContent: pageContext, history })
    } catch (error) {
      addMessage({
        role: 'assistant',
        content: `请求失败：${getErrorMessage(error)}`,
        timestamp: new Date().toISOString(),
      })
      stopLoading()
    }
  }, [mode, currentSessionId, messages, createSession, addMessage, stopLoading])

  const handleStop = async () => {
    await window.aiAPI?.stopGeneration()
    stopLoading()
    if (streamingContent) {
      addMessage({
        role: 'assistant',
        content: `${streamingContent}\n\n*[已停止生成]*`,
        timestamp: new Date().toISOString(),
      })
      setStreamingContent('')
    }
  }

  const handleNewChat = () => {
    window.aiAPI?.stopGeneration().catch(() => {})
    stopLoading()
    createSession(mode)
    setShowHistory(false)
  }

  const handleCommand = useCallback(async (command: string, arg?: string) => {
    switch (command) {
      case 'clear':
        handleNewChat()
        break
      case 'history':
        setShowHistory(prev => !prev)
        break
      case 'model':
        if (arg) {
          await window.dataAPI?.setPreference('model', arg)
          setCurrentModel(arg)
          addMessage({
            role: 'assistant',
            content: `已切换模型为 **${arg}**`,
            timestamp: new Date().toISOString(),
          })
        }
        break
      case 'skill':
        if (arg) {
          const skillName = skills.find(s => s.id === arg)?.name || arg
          addMessage({
            role: 'assistant',
            content: `正在执行技能「${skillName}」...`,
            timestamp: new Date().toISOString(),
          })
          try {
            await window.skillAPI?.executeSkill(arg)
            addMessage({
              role: 'assistant',
              content: `技能「${skillName}」执行完成。`,
              timestamp: new Date().toISOString(),
            })
          } catch (e: any) {
            addMessage({
              role: 'assistant',
              content: `技能执行失败: ${e?.message || e}`,
              timestamp: new Date().toISOString(),
            })
          }
        }
        break
    }
  }, [mode, skills])

  if (!isOpen) return null

  const suggestionPrompts = [
    { icon: FileText, label: '帮我总结当前网页内容', prompt: '帮我总结当前网页内容' },
    { icon: Languages, label: '翻译当前网页为中文', prompt: '请把当前网页翻译成中文' },
    { icon: ListChecks, label: '提取当前网页的关键要点', prompt: '请提取当前网页的关键要点' },
    { icon: MessageSquare, label: '解释当前网页中的专业术语', prompt: '请解释当前网页中的专业术语' },
  ]

  const handleResizeStart = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    resizeStateRef.current = { startX: event.clientX, startWidth: width }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const state = resizeStateRef.current
      if (!state) return
      const deltaX = moveEvent.clientX - state.startX
      const nextWidth = Math.min(maxWidth, Math.max(minWidth, state.startWidth - deltaX))
      onResize(nextWidth)
    }

    const handleMouseUp = () => {
      resizeStateRef.current = null
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <aside
      className="relative flex shrink-0 flex-col overflow-hidden bg-white shadow-[0_10px_30px_rgba(15,23,42,0.03)]"
      style={{ width, minWidth, maxWidth }}
    >
      <div
        className="absolute left-0 top-0 z-50 h-full w-2 cursor-col-resize transition-colors hover:bg-blue-400/20"
        onMouseDown={handleResizeStart}
        onDoubleClick={() => onResize(476)}
        title="拖动调整 AI 助手宽度"
      />
      <header className="flex h-[54px] shrink-0 items-center justify-between border-b border-slate-200 px-5">
        <div className="flex min-w-0 items-center gap-3">
          <Bot className="h-5 w-5 shrink-0 text-orange-500" />
          <span className="text-base font-semibold text-slate-900">AI 助手</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
            {mode === 'agent' ? '智能体' : '问答'}
          </span>
          {currentModel && (
            <span className="truncate text-sm text-slate-500">{currentModel}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHistory(prev => !prev)}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              showHistory ? 'bg-orange-50 text-orange-500' : 'text-slate-500 hover:bg-slate-100'
            }`}
            title="对话历史"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
            title="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {showHistory && (
        <section className="max-h-64 shrink-0 overflow-y-auto border-b border-slate-200 bg-slate-50/70 px-3 py-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              对话历史
            </span>
            <button
              type="button"
              onClick={handleNewChat}
              className="flex h-7 items-center gap-1 rounded-full px-2 text-xs font-medium text-orange-500 transition-colors hover:bg-orange-50"
            >
              <Plus className="h-3.5 w-3.5" />
              新建
            </button>
          </div>

          {sessions.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-400">暂无对话记录</div>
          ) : (
            <div className="space-y-1">
              {sessions.slice(0, 15).map(session => (
                <button
                  key={session.id}
                  type="button"
                  className={`group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-center transition-colors ${
                    session.id === currentSessionId
                      ? 'border border-orange-200 bg-orange-50 text-orange-700'
                      : 'text-slate-700 hover:bg-white'
                  }`}
                  onClick={() => {
                    setCurrentSession(session.id)
                    setMode(session.mode)
                    setShowHistory(false)
                  }}
                >
                  <span className="min-w-0 flex-1 text-center">
                    <span className="block truncate text-xs font-semibold">{session.title}</span>
                    <span className="mt-0.5 block text-[10px] text-slate-400">
                      {session.messages.length} 条消息 · {new Date(session.updatedAt).toLocaleDateString('zh-CN')}
                    </span>
                  </span>
                  <span
                    onClick={(event) => {
                      event.stopPropagation()
                      if (session.id === currentSessionId) {
                        window.aiAPI?.stopGeneration().catch(() => {})
                        stopLoading()
                      }
                      deleteSession(session.id)
                    }}
                    className="flex h-5 w-5 items-center justify-center rounded-full text-slate-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                    title="删除"
                  >
                    <X className="h-3 w-3" />
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      <ChatMessages
        messages={messages}
        isLoading={isLoading}
        streamingContent={streamingContent}
      />

      {messages.length === 0 && !isLoading && (
        <section className="shrink-0 px-6 pb-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-600">猜你想问</h3>
          <div className="space-y-2">
            {suggestionPrompts.map(({ icon: Icon, label, prompt }) => (
              <button
                key={label}
                type="button"
                onClick={() => handleSend(prompt)}
                className="flex h-8 w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-center text-xs text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="min-w-0 flex-1 truncate text-center">{label}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <ChatInput
        isLoading={isLoading}
        onSend={handleSend}
        onStop={handleStop}
        mode={mode}
        onModeChange={setMode}
        onCommand={handleCommand}
        availableSkills={skills}
        availableModels={PRESET_MODELS}
        selectedTextDraft={selectedTextDraft}
      />
    </aside>
  )
}





