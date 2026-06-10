import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { TabBar } from './components/browser/TabBar'
import { NavigationBar } from './components/browser/NavigationBar'
import { Sidebar } from './components/browser/Sidebar'
import { AISidebar } from './components/ai/AISidebar'
import { SettingsPage } from './components/pages/SettingsPage'
import { DownloadsPage } from './components/pages/DownloadsPage'
import { BookmarksPage } from './components/pages/BookmarksPage'
import { HistoryPage } from './components/pages/HistoryPage'
import { SkillsPage } from './components/pages/SkillsPage'
import { ChatMessages } from './components/ai/ChatMessages'
import { ChatInput, type ChatMode } from './components/ai/ChatInput'
import { AppIcon } from './components/common/AppIcon'
import { useTabStore } from './stores/tabStore'
import {
  MessageCircle, Search, Globe, FileText,
  Lightbulb, Clock, Plus, Send, Bot, Loader2,
  ArrowRight, Sparkles, Zap, BookOpen
} from 'lucide-react'
import type { ChatMessage } from './lib/types'

const LEFT_SIDEBAR_WIDTH = 56

function App(): React.ReactElement {
  const { tabs, activeTabId } = useTabStore()
  const activeTab = tabs.find(t => t.id === activeTabId)

  // 面板状态
  const [showAI, setShowAI] = useState(false)
  const [currentPanel, setCurrentPanel] = useState<string | null>(null)

  const closeAllPanels = () => {
    window.popupAPI?.hide()
    setCurrentPanel(null)
  }

  // 当右侧面板状态变化时，通知主进程调整 BrowserView 宽度
  useEffect(() => {
    let width = 0
    if (currentPanel) width = 384
    else if (showAI) width = 380
    window.browserAPI?.setSidebarWidth(width)
  }, [showAI, currentPanel])

  useEffect(() => {
    const handleFocusUrlBar = () => {
      window.dispatchEvent(new CustomEvent('focus-url-bar'))
    }
    const handleToggleAI = () => {
      setShowAI(prev => !prev)
    }

    const unsub1 = window.shortcutAPI?.onFocusUrlBar(handleFocusUrlBar)
    const unsub2 = window.shortcutAPI?.onToggleAI(handleToggleAI)

    // 监听浮层窗口关闭事件，重置面板状态
    const unsub3 = window.popupAPI?.onClosed((_type) => {
      setCurrentPanel(null)
      window.browserAPI?.setSidebarWidth(showAI ? 380 : 0)
    })

    return () => { unsub1?.(); unsub2?.(); unsub3?.() }
  }, [showAI])

  const handleToggleHistory = useCallback(() => {
    window.browserAPI?.createTab('browser://history/')
  }, [])

  const handleToggleFavorites = useCallback(() => {
    window.browserAPI?.createTab('browser://favourites/')
  }, [])

  const handleOpenSettings = useCallback(() => {
    window.browserAPI?.createTab('browser://settings/')
  }, [])

  const handleToggleSkills = useCallback(() => {
    window.browserAPI?.createTab('browser://skills/')
  }, [])

  const handleToggleDownloads = useCallback(() => {
    window.browserAPI?.createTab('browser://downloads/')
  }, [])

  const handleToggleAI = useCallback(() => {
    setShowAI(prev => !prev)
  }, [])

  return (
    <div className="h-screen flex flex-col bg-white text-gray-900 overflow-hidden">
      {/* 标签栏 */}
      <TabBar />

      {/* 导航栏 */}
      <NavigationBar
        onToggleHistory={handleToggleHistory}
        onOpenSettings={handleOpenSettings}
        onToggleAI={handleToggleAI}
        onToggleFavorites={handleToggleFavorites}
        onOpenDownloads={handleToggleDownloads}
        showAI={showAI}
      />

      {/* 主内容区：左侧边栏 + 内容 + 面板 */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* 左侧边栏 */}
        <Sidebar onToggleHistory={handleToggleHistory} onToggleFavorites={handleToggleFavorites} onOpenSettings={handleOpenSettings} onToggleSkills={handleToggleSkills} />

        {/* 浏览器内容区 */}
        <div className="flex-1 bg-gray-50 relative">
          {activeTab?.isNewTab && <NewTabPage />}
          {activeTab?.url?.startsWith('browser://settings') && <SettingsPage />}
          {activeTab?.url?.startsWith('browser://downloads') && <DownloadsPage />}
          {activeTab?.url?.startsWith('browser://favourites') && <BookmarksPage />}
          {activeTab?.url?.startsWith('browser://history') && <HistoryPage />}
          {activeTab?.url?.startsWith('browser://skills') && <SkillsPage />}
        </div>

        {/* AI 侧边栏 */}
        <AISidebar isOpen={showAI} onClose={() => setShowAI(false)} />
      </div>
    </div>
  )
}

/** 根据时间显示问候语 */
function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 9) return '早上好'
  if (h < 12) return '上午好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
}

/**
 * 新标签页组件（含 AI 对话集成）—— 极致打磨版
 */
function NewTabPage(): React.ReactElement {
  const [chatMode, setChatMode] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [inputFocused, setInputFocused] = useState(false)
  const [mode, setMode] = useState<ChatMode>('qa')
  const greeting = useMemo(() => getGreeting(), [])

  // 设置流式响应监听
  useEffect(() => {
    if (!window.aiAPI) return

    let currentContent = ''

    const unsub1 = window.aiAPI.onToken((token: string) => {
      currentContent += token
      setStreamingContent(currentContent)
    })

    const unsub2 = window.aiAPI.onDone((fullText: string) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: fullText || currentContent,
        timestamp: new Date().toISOString()
      }])
      setIsLoading(false)
      setStreamingContent('')
      currentContent = ''
    })

    const unsub3 = window.aiAPI.onError((error: string) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `抱歉，出现错误: ${error}`,
        timestamp: new Date().toISOString()
      }])
      setIsLoading(false)
      setStreamingContent('')
      currentContent = ''
    })

    // Agent 事件监听
    const unsub4 = window.aiAPI.onAgentStep((step: any) => {
      const stepIcon = step.status === 'done' ? '✓' : step.status === 'thinking' ? '🤔' : '⚡'
      let stepText = ''
      if (step.thought) stepText += `**思考:** ${step.thought}\n`
      if (step.action && step.action !== 'done') stepText += `**操作:** ${step.action}\n`
      if (step.result) stepText += `**结果:** ${step.result}`
      if (stepText) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `${stepIcon} **步骤 #${step.stepNumber}**\n${stepText}`,
          timestamp: new Date().toISOString()
        }])
      }
    })

    const unsub5 = window.aiAPI.onAgentComplete((result: any) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: result.success
          ? `🎉 **任务完成!**\n${result.summary}`
          : `⚠️ **任务未完成**\n${result.summary}`,
        timestamp: new Date().toISOString()
      }])
      setIsLoading(false)
      setStreamingContent('')
    })

    return () => { unsub1(); unsub2(); unsub3(); unsub4(); unsub5() }
  }, [])

  const handleSend = useCallback(async (message: string) => {
    if (!message.trim()) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setStreamingContent('')
    setChatMode(true)
    setInputValue('')

    if (mode === 'agent') {
      try {
        await window.aiAPI?.runAgent(message)
      } catch (e) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Agent 执行失败: ${e}`,
          timestamp: new Date().toISOString()
        }])
        setIsLoading(false)
      }
    } else {
      try {
        let pageContext = ''
        try {
          pageContext = await window.aiAPI?.onPageContentRequest() || ''
        } catch (e) {}
        await window.aiAPI?.sendMessage(message, { pageContent: pageContext })
      } catch (e) {
        console.error('AI send failed:', e)
      }
    }
  }, [mode])

  const handleStop = async () => {
    await window.aiAPI?.stopGeneration()
    setIsLoading(false)
    if (streamingContent) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: streamingContent + '\n\n*[已停止生成]*',
        timestamp: new Date().toISOString()
      }])
      setStreamingContent('')
    }
  }

  // 对话模式
  if (chatMode) {
    return (
      <div className="absolute inset-0 flex flex-col bg-mesh">
        <div className="flex-1 overflow-hidden">
          <ChatMessages
            messages={messages}
            isLoading={isLoading}
            streamingContent={streamingContent}
          />
        </div>
        <ChatInput
          isLoading={isLoading}
          onSend={handleSend}
          onStop={handleStop}
          mode={mode}
          onModeChange={setMode}
        />
      </div>
    )
  }

  const recommendCards = [
    {
      icon: Search,
      title: '智能搜索',
      desc: '一键搜索热门内容，AI 帮你找到最佳答案',
      accent: 'bg-blue-500',
      iconBg: 'bg-gradient-to-br from-blue-400 to-blue-600',
    },
    {
      icon: Globe,
      title: '网页翻译',
      desc: '翻译任意网页，打破语言壁垒',
      accent: 'bg-emerald-500',
      iconBg: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
    },
    {
      icon: FileText,
      title: '内容总结',
      desc: 'AI 帮你提炼网页要点，节省阅读时间',
      accent: 'bg-violet-500',
      iconBg: 'bg-gradient-to-br from-violet-400 to-violet-600',
    },
    {
      icon: Sparkles,
      title: 'AI 写作助手',
      desc: '帮你润色、续写、改写任意文本',
      accent: 'bg-amber-500',
      iconBg: 'bg-gradient-to-br from-amber-400 to-amber-600',
    },
  ]

  const featureButtons = [
    { icon: MessageCircle, label: '全部对话', gradient: 'from-orange-400 to-rose-500' },
    { icon: Lightbulb, label: '妙趣广场', gradient: 'from-yellow-400 to-amber-500' },
    { icon: Clock, label: '定时任务', gradient: 'from-blue-400 to-indigo-500' },
    { icon: BookOpen, label: '阅读模式', gradient: 'from-emerald-400 to-teal-500' },
  ]

  // 初始着陆页
  return (
    <div className="absolute inset-0 flex flex-col items-center overflow-y-auto bg-mesh">

      {/* ── 顶部区域：Logo + 问候语 ── */}
      <div className="mt-12 mb-6 flex flex-col items-center animate-fade-in-up">
        <AppIcon className="w-16 h-16 mb-3 drop-shadow-lg" />
        <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
          Tare
        </h1>
        <p className="text-sm text-gray-400 mt-2 font-light tracking-wide">
          {greeting}，今天想探索什么？
        </p>
      </div>

      {/* ── AI 输入框 ── */}
      <div className="w-full max-w-lg px-6 mb-8 animate-fade-in-up delay-100">
        <div className={`
          bg-white rounded-2xl border overflow-hidden transition-all duration-300
          ${inputFocused
            ? 'border-orange-300 shadow-input-focus'
            : 'border-gray-200/80 shadow-card hover:shadow-card-hover'}
        `}>
          <div className="flex items-center px-4 py-3 gap-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shrink-0 shadow-sm">
              <MessageCircle className="w-3.5 h-3.5 text-white" />
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend(inputValue)
                }
              }}
              placeholder="问我任何问题，或输入网址..."
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
            />
            <button
              onClick={() => handleSend(inputValue)}
              disabled={!inputValue.trim() || isLoading}
              className="p-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white transition-all shadow-sm hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between px-4 py-1.5 border-t border-gray-100/80">
            <div className="flex items-center gap-2">
              <button className="px-1.5 py-0.5 rounded hover:bg-gray-100 text-gray-400 text-xs transition-colors">@ 引用</button>
              <button className="px-1.5 py-0.5 rounded hover:bg-gray-100 text-gray-400 text-xs transition-colors">📎 附件</button>
            </div>
            <span className="text-xs text-gray-300 font-light">默认模式</span>
          </div>
        </div>
      </div>

      {/* ── 推荐卡片区 ── */}
      <div className="w-full max-w-lg px-6 mb-8 animate-fade-in-up delay-200">
        <p className="text-xs font-medium text-gray-400 mb-3 pl-1 tracking-wide">AI 能力</p>
        <div className="flex flex-col">
          {recommendCards.map((card, idx) => (
            <button
              key={card.title}
              onClick={() => handleSend(`请帮我${card.title}`)}
              className="w-full flex items-center gap-3 px-4 py-3.5 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-200 text-left group hover:-translate-y-px hover:shadow-card-hover shadow-card"
              style={{ animationDelay: `${(idx + 2) * 80}ms`, marginTop: idx === 0 ? 0 : 12 }}
            >
              <div className={`w-1 h-8 rounded-full ${card.accent} opacity-60 group-hover:opacity-100 transition-opacity shrink-0`} />
              <div className={`w-9 h-9 rounded-lg ${card.iconBg} flex items-center justify-center shadow-sm shrink-0`}>
                <card.icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 group-hover:text-gray-900">{card.title}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{card.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* ── 功能按钮组 ── */}
      <div className="w-full max-w-lg px-6 mb-8 animate-fade-in-up delay-300">
        <div className="flex gap-2.5 justify-center flex-wrap">
          {featureButtons.map((btn) => (
            <button
              key={btn.label}
              className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-px transition-all duration-200 group"
            >
              <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${btn.gradient} flex items-center justify-center shadow-sm`}>
                <btn.icon className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs text-gray-600 group-hover:text-gray-800 font-medium">{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 底部提示 ── */}
      <div className="pb-8 text-center animate-fade-in-up delay-400">
        <p className="text-xs text-gray-400 font-light flex items-center gap-1.5 justify-center">
          <Zap className="w-3 h-3 text-orange-400" />
          设为默认浏览器，即可免费获得会员，畅享智能代理
        </p>
      </div>
    </div>
  )
}

export default App
