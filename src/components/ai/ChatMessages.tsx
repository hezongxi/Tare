import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Bot, User } from 'lucide-react'
import type { ChatMessage } from '../../lib/types'

interface Props {
  messages: ChatMessage[]
  isLoading: boolean
  streamingContent: string
}

export function ChatMessages({ messages, isLoading, streamingContent }: Props): React.ReactElement {
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages, streamingContent])

  const aiAvatar = (
    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-rose-500 shadow-[0_8px_18px_rgba(244,63,94,0.25)]">
      <Bot className="h-4 w-4 text-white" />
    </div>
  )

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-6 py-5">
      {messages.length === 0 && !isLoading && (
        <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 shadow-[0_16px_34px_rgba(244,63,94,0.25)]">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <p className="text-lg font-semibold text-slate-900">你好！我是 AI 助手</p>
          <p className="mt-3 max-w-[320px] text-sm leading-6 text-slate-500">
            可以帮你理解网页内容、回答问题、翻译和总结
          </p>
        </div>
      )}

      <div className="space-y-5">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && aiAvatar}
            <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
              msg.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'border border-slate-200 bg-white text-slate-800'
            }`}>
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm max-w-none [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_ol]:my-1 [&_p]:my-1 [&_pre]:rounded-lg [&_pre]:bg-slate-100 [&_pre]:p-2 [&_pre]:text-xs [&_ul]:my-1">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                <User className="h-4 w-4 text-slate-500" />
              </div>
            )}
          </div>
        ))}

        {isLoading && streamingContent && (
          <div className="flex justify-start gap-3">
            {aiAvatar}
            <div className="max-w-[82%] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 shadow-sm">
              <div className="prose prose-sm max-w-none [&_p]:my-1">
                <ReactMarkdown>{streamingContent}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {isLoading && !streamingContent && (
          <div className="flex justify-start gap-3">
            {aiAvatar}
            <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="bounce-dot-1 h-2 w-2 rounded-full bg-orange-400" />
              <div className="bounce-dot-2 h-2 w-2 rounded-full bg-orange-400" />
              <div className="bounce-dot-3 h-2 w-2 rounded-full bg-orange-400" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
