import React, { useState, useEffect, useCallback } from 'react'
import { Bot, X, MessageSquare, Plus, Clock } from 'lucide-react'
import { ChatMessages } from './ChatMessages'
import { ChatInput, type ChatMode } from './ChatInput'
import { useChatStore } from '../../stores/chatStore'
import type { ChatMessage, Skill } from '../../lib/types'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const PRESET_MODELS = [
  'gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo',
  'deepseek-chat', 'deepseek-reasoner',
]

export function AISidebar({ isOpen, onClose }: Props): React.ReactElement | null {
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [mode, setMode] = useState<ChatMode>('qa')
  const [showHistory, setShowHistory] = useState(false)
  const [currentModel, setCurrentModel] = useState('')
  const [skills, setSkills] = useState<Skill[]>([])

  const {
    sessions, currentSessionId,
    createSession, deleteSession, setCurrentSession,
    addMessage, loadFromStorage
  } = useChatStore()

  const currentSession = sessions.find(s => s.id === currentSessionId)
  const messages = currentSession?.messages || []

  // 初始化：从 localStorage 加载
  useEffect(() => {
    loadFromStorage()
  }, [])

  // 加载当前模型
  useEffect(() => {
    window.dataAPI?.getPreferences().then(prefs => {
      setCurrentModel(prefs?.model || 'gpt-4o')
    })
  }, [])

  // 加载 skills 列表
  useEffect(() => {
    window.skillAPI?.getSkills().then(list => setSkills(list || [])).catch(() => {})
  }, [])

  // 自动创建第一个会话
  useEffect(() => {
    if (sessions.length === 0 && isOpen) {
      createSession(mode)
    } else if (!currentSessionId && sessions.length > 0) {
      setCurrentSession(sessions[0].id)
    }
  }, [isOpen, sessions.length, currentSessionId])

  // 设置流式响应监听
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
        timestamp: new Date().toISOString()
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
        timestamp: new Date().toISOString()
      })
      setIsLoading(false)
      setStreamingContent('')
      currentContent = ''
    })

    const unsub4 = window.aiAPI.onAgentStep((step: any) => {
      const stepIcon = step.status === 'done' ? '✅' : step.status === 'thinking' ? '🤔' : '⚡'
      let stepText = ''
      if (step.thought) stepText += `**思考:** ${step.thought}\n`
      if (step.action && step.action !== 'done') stepText += `**操作:** ${step.action}\n`
      if (step.result) stepText += `**结果:** ${step.result}`
      if (stepText) {
        addMessage({
          role: 'assistant',
          content: `${stepIcon} **步骤 #${step.stepNumber}**\n${stepText}`,
          timestamp: new Date().toISOString()
        })
      }
    })

    const unsub5 = window.aiAPI.onAgentComplete((result: any) => {
      addMessage({
        role: 'assistant',
        content: result.success
          ? `🎉 **任务完成!**\n${result.summary}`
          : `⚠️ **任务未完成**\n${result.summary}`,
        timestamp: new Date().toISOString()
      })
      setIsLoading(false)
      setStreamingContent('')
    })

    return () => { unsub1(); unsub2(); unsub3(); unsub4(); unsub5() }
  }, [currentSessionId])

  const handleSend = useCallback(async (message: string) => {
    // 确保有活跃会话
    if (!currentSessionId) {
      createSession(mode)
    }

    const userMsg: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    }
    addMessage(userMsg)
    setIsLoading(true)
    setStreamingContent('')

    if (mode === 'agent') {
      try {
        await window.aiAPI?.runAgent(message)
      } catch (e) {
        addMessage({
          role: 'assistant',
          content: `Agent 执行失败: ${e}`,
          timestamp: new Date().toISOString()
        })
        setIsLoading(false)
      }
    } else {
      let pageContext = ''
      try {
        pageContext = await window.aiAPI?.onPageContentRequest() || ''
      } catch { /* ignore */ }
      await window.aiAPI?.sendMessage(message, { pageContent: pageContext })
    }
  }, [mode, currentSessionId])

  const handleStop = async () => {
    await window.aiAPI?.stopGeneration()
    setIsLoading(false)
    if (streamingContent) {
      addMessage({
        role: 'assistant',
        content: streamingContent + '\n\n*[已停止生成]*',
        timestamp: new Date().toISOString()
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
      case 'clear': {
        // 新建对话代替清空
        handleNewChat()
        break
      }
      case 'history':
        setShowHistory(prev => !prev)
        break
      case 'model':
        if (arg) {
          await window.dataAPI?.setPreference('model', arg)
          setCurrentModel(arg)
          addMessage({
            role: 'assistant',
            content: `✅ 已切换模型为 **${arg}**`,
            timestamp: new Date().toISOString()
          })
        }
        break
      case 'skills':
        // 显示 skills 列表作为消息
        if (skills.length === 0) {
          addMessage({
            role: 'assistant',
            content: '当前没有可用的 Skills。使用 `/skill-creator` 创建新技能。',
            timestamp: new Date().toISOString()
          })
        } else {
          const skillList = skills.map(s => `- **${s.name}**: ${s.description}`).join('\n')
          addMessage({
            role: 'assistant',
            content: `可用技能列表：\n${skillList}`,
            timestamp: new Date().toISOString()
          })
        }
        break
      case 'skill-creator':
        addMessage({
          role: 'assistant',
          content: '请在设置页面中创建新技能，或告诉我你想创建什么类型的技能，我可以帮你设计。',
          timestamp: new Date().toISOString()
        })
        break
    }
  }, [skills, mode])

  if (!isOpen) return null

  return (
    <div className="w-[380px] bg-white border-l border-gray-100 flex flex-col shrink-0 shadow-[-4px_0_16px_rgba(0,0,0,0.05)]">
      {/* 渐变装饰条 */}
      <div className="h-0.5 bg-gradient-to-r from-orange-500 to-rose-500 shrink-0" />

      {/* 头部 */}
      <div className="h-11 flex items-center justify-between px-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium text-gray-800">AI 助手</span>
          <span className="text-xs text-gray-400 px-1.5 py-0.5 bg-gray-100 rounded-full">
            {mode === 'agent' ? '智能体' : '问答'}
          </span>
          {currentModel && (
            <span className="text-xs text-gray-400 px-1.5 py-0.5 bg-gray-50 rounded-full border border-gray-100">
              {currentModel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowHistory(prev => !prev)} className={`p-1 rounded hover:bg-gray-100 transition-colors ${showHistory ? 'text-orange-500 bg-orange-50' : 'text-gray-400'}`} title="对话历史">
            <MessageSquare className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-400" title="关闭">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 对话历史面板 */}
      {showHistory && (
        <div className="border-b border-gray-100 bg-gray-50/50 max-h-60 overflow-y-auto">
          <div className="p-2 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> 对话历史
            </span>
            <button
              onClick={handleNewChat}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-orange-500 hover:bg-orange-50 transition-colors"
            >
              <Plus className="w-3 h-3" /> 新建
            </button>
          </div>
          {sessions.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-gray-400">暂无对话记录</div>
          ) : (
            <div className="px-1 pb-1">
              {sessions.slice(0, 15).map(session => (
                <div
                  key={session.id}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-lg mx-0.5 cursor-pointer group transition-colors ${
                    session.id === currentSessionId
                      ? 'bg-orange-50 text-orange-700 border border-orange-200/60'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => { setCurrentSession(session.id); setMode(session.mode); setShowHistory(false) }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{session.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {session.messages.length} 条消息 · {new Date(session.updatedAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSession(session.id) }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition-all"
                    title="删除"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 消息列表 */}
      <ChatMessages
        messages={messages}
        isLoading={isLoading}
        streamingContent={streamingContent}
      />

      {/* 输入框 */}
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
    </div>
  )
}
