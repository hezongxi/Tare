import React, { useCallback, useEffect, useState } from 'react'
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
}

const PRESET_MODELS = [
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4-turbo',
  'gpt-3.5-turbo',
  'deepseek-chat',
  'deepseek-reasoner',
]

export function AISidebar({ isOpen, onClose }: Props): React.ReactElement | null {
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [mode, setMode] = useState<ChatMode>('qa')
  const [showHistory, setShowHistory] = useState(false)
  const [currentModel, setCurrentModel] = useState('')
  const [skills, setSkills] = useState<Skill[]>([])

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

  useEffect(() => {
    loadFromStorage()
  }, [])

  useEffect(() => {
    window.dataAPI?.getPreferences().then(prefs => {
      setCurrentModel(prefs?.model || 'deepseek-v3-pro')
    })
  }, [])

  useEffect(() => {
    window.skillAPI?.getSkills().then(list => setSkills(list || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (sessions.length === 0 && isOpen) {
      createSession(mode)
    } else if (!currentSessionId && sessions.length > 0) {
      setCurrentSession(sessions[0].id)
    }
  }, [isOpen, sessions.length, currentSessionId])

  useEffect(() => {
    if (!window.aiAPI) return

    let currentContent = ''

    const unsub1 = window.aiAPI.onToken((token: string) => {
      currentContent += token
      setStreamingContent(currentContent)
    })

    const unsub2 = window.aiAPI.onDone((fullText: string) => {
      const msg: ChatMessage = {
        role: 'assistant',
        content: fullText || currentContent,
        timestamp: new Date().toISOString(),
      }
      addMessage(msg)
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
  }, [currentSessionId])

  const handleSend = useCallback(async (message: string) => {
    if (!message.trim()) return

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
        await window.aiAPI?.runAgent(message)
      } catch (e) {
        addMessage({
          role: 'assistant',
          content: `Agent 执行失败: ${e}`,
          timestamp: new Date().toISOString(),
        })
        setIsLoading(false)
      }
      return
    }

    let pageContext = ''
    try {
      pageContext = await window.aiAPI?.onPageContentRequest() || ''
    } catch {
      pageContext = ''
    }
    await window.aiAPI?.sendMessage(message, { pageContent: pageContext })
  }, [mode, currentSessionId])

  const handleStop = async () => {
    await window.aiAPI?.stopGeneration()
    setIsLoading(false)
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
      case 'skills':
        if (skills.length === 0) {
          addMessage({
            role: 'assistant',
            content: '当前没有可用的 Skills。使用 `/skill-creator` 创建新技能。',
            timestamp: new Date().toISOString(),
          })
        } else {
          const skillList = skills.map(s => `- **${s.name}**: ${s.description}`).join('\n')
          addMessage({
            role: 'assistant',
            content: `可用技能列表：\n${skillList}`,
            timestamp: new Date().toISOString(),
          })
        }
        break
      case 'skill-creator':
        addMessage({
          role: 'assistant',
          content: '请在设置页面中创建新技能，或告诉我你想创建什么类型的技能，我可以帮你设计。',
          timestamp: new Date().toISOString(),
        })
        break
    }
  }, [skills, mode])

  if (!isOpen) return null

  const suggestionPrompts = [
    { icon: FileText, label: '帮我总结当前网页内容', prompt: '帮我总结当前网页内容' },
    { icon: Languages, label: '翻译当前网页为中文', prompt: '请把当前网页翻译成中文' },
    { icon: ListChecks, label: '提取当前网页的关键要点', prompt: '请提取当前网页的关键要点' },
    { icon: MessageSquare, label: '解释当前网页中的专业术语', prompt: '请解释当前网页中的专业术语' },
  ]

  return (
    <aside className="ml-[6px] flex w-[476px] shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.03)]">
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
      />
    </aside>
  )
}
