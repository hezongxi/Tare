import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  Bot,
  ChevronDown,
  Clock,
  File,
  FileText,
  Gem,
  Globe,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Search,
  Send,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react'
import { AISidebar } from './components/ai/AISidebar'
import { ChatInput, type ChatMode } from './components/ai/ChatInput'
import { ChatMessages } from './components/ai/ChatMessages'
import { NavigationBar } from './components/browser/NavigationBar'
import { TabBar } from './components/browser/TabBar'
import { AppIcon } from './components/common/AppIcon'
import { BookmarksPage } from './components/pages/BookmarksPage'
import { DownloadsPage } from './components/pages/DownloadsPage'
import { HistoryPage } from './components/pages/HistoryPage'
import { SettingsPage } from './components/pages/SettingsPage'
import { SkillsPage } from './components/pages/SkillsPage'
import type { ChatMessage } from './lib/types'
import { useTabStore } from './stores/tabStore'

const DEFAULT_AI_PANEL_WIDTH = 476
const MIN_AI_PANEL_WIDTH = 360
const MAX_AI_PANEL_WIDTH = 640

interface SelectedTextDraft {
  id: number
  text: string
  url: string
  title: string
}

function App(): React.ReactElement {
  const { tabs, activeTabId } = useTabStore()
  const activeTab = tabs.find(t => t.id === activeTabId)
  const [showAI, setShowAI] = useState(true)
  const [aiPanelWidth, setAiPanelWidth] = useState(DEFAULT_AI_PANEL_WIDTH)
  const [selectedTextDraft, setSelectedTextDraft] = useState<SelectedTextDraft | null>(null)

  useEffect(() => {
    window.browserAPI?.setSidebarWidth(showAI ? aiPanelWidth : 0)
  }, [showAI, aiPanelWidth])

  useEffect(() => {
    const handleFocusUrlBar = () => {
      window.dispatchEvent(new CustomEvent('focus-url-bar'))
    }
    const handleToggleAI = () => {
      setShowAI(prev => !prev)
    }

    const unsub1 = window.shortcutAPI?.onFocusUrlBar(handleFocusUrlBar)
    const unsub2 = window.shortcutAPI?.onToggleAI(handleToggleAI)
    return () => {
      unsub1?.()
      unsub2?.()
    }
  }, [])

  useEffect(() => {
    const unsub = window.browserAPI?.onTextSelected((payload) => {
      setShowAI(true)
      setSelectedTextDraft({
        id: Date.now(),
        text: payload.text,
        url: payload.url,
        title: payload.title
      })
    })

    return () => unsub?.()
  }, [])

  const handleToggleHistory = useCallback(() => {
    window.browserAPI?.createTab('browser://history/')
  }, [])

  const handleToggleFavorites = useCallback(() => {
    window.browserAPI?.createTab('browser://favourites/')
  }, [])

  const handleOpenSettings = useCallback(() => {
    window.browserAPI?.createTab('browser://settings/')
  }, [])

  const handleToggleDownloads = useCallback(() => {
    window.browserAPI?.createTab('browser://downloads/')
  }, [])

  const handleToggleAI = useCallback(() => {
    setShowAI(prev => !prev)
  }, [])

  const showNewTab = !activeTab || activeTab.isNewTab

  // Debug logging
  console.log('[App] activeTab:', activeTab?.id || 'null', 'isNewTab:', activeTab?.isNewTab, 'showNewTab:', showNewTab)

  return (
    <div className="h-screen overflow-hidden bg-[#f4f7fc] text-slate-900">
      <div className="h-full flex flex-col">
        <TabBar />
        <NavigationBar
          onToggleHistory={handleToggleHistory}
          onOpenSettings={handleOpenSettings}
          onToggleAI={handleToggleAI}
          onToggleFavorites={handleToggleFavorites}
          onOpenDownloads={handleToggleDownloads}
          showAI={showAI}
        />

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <main className="relative min-w-0 flex-1 overflow-hidden">
            {showNewTab && <NewTabPage key={activeTabId || 'new'} />}
            {activeTab?.url?.startsWith('browser://settings') && <SettingsPage />}
            {activeTab?.url?.startsWith('browser://downloads') && <DownloadsPage />}
            {activeTab?.url?.startsWith('browser://favourites') && <BookmarksPage />}
            {activeTab?.url?.startsWith('browser://history') && <HistoryPage />}
            {activeTab?.url?.startsWith('browser://skills') && <SkillsPage />}
          </main>

          <AISidebar
            isOpen={showAI}
            onClose={() => setShowAI(false)}
            width={aiPanelWidth}
            minWidth={MIN_AI_PANEL_WIDTH}
            maxWidth={MAX_AI_PANEL_WIDTH}
            onResize={setAiPanelWidth}
            selectedTextDraft={selectedTextDraft}
          />
        </div>
      </div>
    </div>
  )
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 9) return '早上好'
  if (h < 12) return '上午好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
}

function NewTabPage(): React.ReactElement {
  const [chatMode, setChatMode] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [inputFocused, setInputFocused] = useState(false)
  const [mode, setMode] = useState<ChatMode>('qa')
  const [showModeMenu, setShowModeMenu] = useState(false)
  const modeMenuRef = useRef<HTMLDivElement>(null)
  const greeting = useMemo(() => getGreeting(), [])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!modeMenuRef.current?.contains(event.target as Node)) {
        setShowModeMenu(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

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
        timestamp: new Date().toISOString(),
      }])
      setIsLoading(false)
      setStreamingContent('')
      currentContent = ''
    })

    const unsub3 = window.aiAPI.onError((error: string) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `抱歉，出现错误: ${error}`,
        timestamp: new Date().toISOString(),
      }])
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
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `**步骤 #${step.stepNumber}**\n${stepText}`,
          timestamp: new Date().toISOString(),
        }])
      }
    })

    const unsub5 = window.aiAPI.onAgentComplete((result: any) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: result.success
          ? `**任务完成**\n${result.summary}`
          : `**任务未完成**\n${result.summary}`,
        timestamp: new Date().toISOString(),
      }])
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

    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
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
          timestamp: new Date().toISOString(),
        }])
        setIsLoading(false)
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
      await window.aiAPI?.sendMessage(message, { pageContent: pageContext })
    } catch (e) {
      console.error('AI send failed:', e)
      setIsLoading(false)
    }
  }, [mode])

  const handleStop = async () => {
    await window.aiAPI?.stopGeneration()
    setIsLoading(false)
    if (streamingContent) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `${streamingContent}\n\n*[已停止生成]*`,
        timestamp: new Date().toISOString(),
      }])
      setStreamingContent('')
    }
  }

  if (chatMode) {
    return (
      <div className="absolute inset-0 flex flex-col bg-app-surface">
        <div className="flex-1 min-h-0 overflow-hidden">
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

  const abilityCards = [
    {
      icon: Search,
      title: '智能搜索',
      desc: '更强大的 AI 搜索，快速找到你需要的答案',
      iconClass: 'from-blue-500 to-indigo-500',
      prompt: '帮我进行智能搜索',
    },
    {
      icon: Globe,
      title: '网页翻译',
      desc: '翻译任意网页，打破语言障碍',
      iconClass: 'from-emerald-500 to-teal-500',
      prompt: '帮我翻译这个网页',
    },
    {
      icon: FileText,
      title: '内容总结',
      desc: 'AI 帮你总结网页要点，节省阅读时间',
      iconClass: 'from-violet-500 to-fuchsia-500',
      prompt: '帮我总结当前网页内容',
    },
    {
      icon: Sparkles,
      title: 'AI 写作助手',
      desc: '帮你构思、写作、改写各类文本',
      iconClass: 'from-amber-500 to-orange-500',
      prompt: '帮我写一段文本',
    },
  ]

  const promptChips = [
    { icon: Search, label: '帮我总结这篇论文', prompt: '帮我总结这篇论文' },
    { icon: Sparkles, label: '生成一份周报', prompt: '生成一份周报' },
    { icon: Globe, label: '翻译这个网页', prompt: '翻译这个网页' },
    { icon: Star, label: '写一封邮件', prompt: '写一封邮件' },
  ]

  const quickActions = [
    { icon: MessageCircle, label: '全局对话', colorClass: 'from-orange-500 to-rose-500' },
    {
      icon: Zap,
      label: '技能市场',
      colorClass: 'from-amber-500 to-orange-500',
      onClick: () => window.browserAPI?.createTab('browser://skills/'),
    },
    { icon: Clock, label: '定时任务', colorClass: 'from-blue-500 to-indigo-500' },
    { icon: BookOpen, label: '阅读模式', colorClass: 'from-emerald-500 to-teal-500' },
    { icon: MoreHorizontal, label: '更多', colorClass: 'from-slate-500 to-slate-600' },
  ]

  const recentFiles = [
    { icon: FileText, name: '产品需求文档.pdf', type: 'PDF 文档', colorClass: 'text-orange-500 bg-orange-50' },
    { icon: Gem, name: '设计规范.sketch', type: 'Sketch 文件', colorClass: 'text-amber-500 bg-amber-50' },
    { icon: File, name: '技术方案.md', type: 'Markdown', colorClass: 'text-slate-500 bg-slate-100' },
    { icon: FileText, name: '用户调研报告.docx', type: 'Word 文档', colorClass: 'text-blue-500 bg-blue-50' },
  ]

  const submit = () => handleSend(inputValue)

  return (
    <div className="tare-new-tab-page absolute inset-0 overflow-y-auto bg-app-surface">
      <div className="grid min-h-full place-items-center px-4 py-8">
        <div
          className="flex flex-col"
          style={{ width: 'min(720px, 100%)', rowGap: 'clamp(14px, 2vh, 28px)' }}
        >
        <section className="flex flex-col items-center">
          <AppIcon className="mb-3 h-16 w-16 rounded-2xl shadow-[0_12px_28px_rgba(15,23,42,0.12)]" />
          <h1 className="text-[32px] font-bold leading-none text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">
            Tare
          </h1>
          <p className="mt-3 text-[15px] text-slate-500">
            {greeting}，有什么可以帮你？
          </p>
        </section>

        <section className="p-5">
          <form
            onSubmit={(event) => {
              event.preventDefault()
              submit()
            }}
            style={{ padding: 15 }}
            className={`flex min-h-[114px] flex-col justify-between overflow-visible rounded-[22px] border bg-white transition-all duration-200 ${
              inputFocused
                ? 'border-rose-300 shadow-[0_0_0_3px_rgba(244,63,94,0.08),0_18px_40px_rgba(15,23,42,0.08)]'
                : 'border-orange-200 shadow-[0_18px_40px_rgba(15,23,42,0.07)]'
            }`}
          >
            <div className="flex flex-1 items-center gap-4 px-6 py-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-[0_6px_14px_rgba(248,113,113,0.32)]">
                <Bot className="h-4 w-4" />
              </div>
              <input
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    submit()
                  }
                }}
                placeholder="向我提问，或输入网址..."
                className="min-w-0 flex-1 bg-transparent text-[15px] text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center justify-between px-6 pb-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100"
                  title="添加附件"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <div ref={modeMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setShowModeMenu(prev => !prev)}
                    className="flex h-8 items-center gap-2 rounded-full bg-slate-100 px-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200"
                    aria-haspopup="menu"
                    aria-expanded={showModeMenu}
                  >
                    <Sparkles className="h-4 w-4" />
                    {mode === 'agent' ? '智能体模式' : '智能对话模式'}
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showModeMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showModeMenu && (
                    <div className="absolute left-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-[0_14px_32px_rgba(15,23,42,0.14)]">
                      {([
                        { value: 'qa', label: '智能对话模式' },
                        { value: 'agent', label: '智能体模式' },
                      ] as const).map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => {
                            setMode(item.value)
                            setShowModeMenu(false)
                          }}
                          className={`flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            mode === item.value
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                          role="menuitem"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-500 transition-all hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                title="发送"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </section>

        <section className="flex flex-wrap justify-center" style={{ gap: 'clamp(10px, 1.2vw, 14px)' }}>
          {promptChips.map(({ icon: Icon, label, prompt }) => (
            <button
              key={label}
              type="button"
              onClick={() => handleSend(prompt)}
              className="flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-600 shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-800"
            >
              <Icon className="h-3.5 w-3.5 text-slate-400" />
              {label}
            </button>
          ))}
        </section>

        <section className="grid grid-cols-2" style={{ gap: 'clamp(16px, 1.8vw, 24px)' }}>
          {abilityCards.map(({ icon: Icon, title, desc, iconClass, prompt }) => (
            <button
              key={title}
              type="button"
              onClick={() => handleSend(prompt)}
              className="group flex min-h-[66px] items-center gap-4 rounded-lg border border-slate-200 bg-white px-4 text-center shadow-[0_12px_28px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_34px_rgba(15,23,42,0.09)]"
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${iconClass} text-white shadow-[0_8px_18px_rgba(15,23,42,0.16)]`}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1 text-center">
                <span className="block text-sm font-semibold text-slate-800">{title}</span>
                <span className="mt-1 block truncate text-xs text-slate-500">{desc}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
        </section>

        <section className="flex flex-col" style={{ rowGap: 'clamp(8px, 1.2vh, 14px)' }}>
          <h2 className="text-sm font-semibold text-slate-800">快捷操作</h2>
          <div className="flex" style={{ gap: 'clamp(10px, 1.2vw, 14px)' }}>
            {quickActions.map(({ icon: Icon, label, colorClass, onClick }, index) => (
              <button
                key={label}
                type="button"
                onClick={onClick}
                className={`flex h-11 min-w-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-[0_10px_22px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 hover:border-slate-300 ${
                  index === quickActions.length - 1 ? 'w-[68px]' : 'w-[144px]'
                }`}
              >
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${colorClass} text-white`}>
                  <Icon className="h-3 w-3" />
                </span>
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col" style={{ rowGap: 'clamp(8px, 1.2vh, 14px)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">最近使用</h2>
            <button type="button" className="flex items-center justify-center gap-1 text-center text-xs text-slate-500 hover:text-slate-700">
              查看全部
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="grid grid-cols-4" style={{ gap: 'clamp(10px, 1.2vw, 14px)' }}>
            {recentFiles.map(({ icon: Icon, name, type, colorClass }) => (
              <button
                key={name}
                type="button"
                className="flex min-h-[96px] flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-3 text-center shadow-[0_12px_28px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 hover:border-slate-300"
              >
                <span className={`mb-2 flex h-7 w-7 items-center justify-center rounded-md ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="block truncate text-sm font-semibold text-slate-800">{name}</span>
                <span className="mt-1 block text-xs text-slate-500">{type}</span>
              </button>
            ))}
          </div>
        </section>
        </div>
      </div>
    </div>
  )
}

export default App
