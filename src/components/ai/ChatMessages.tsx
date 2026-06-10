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
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
      <Bot className="w-4 h-4 text-white" />
    </div>
  )

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
      {messages.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center h-full text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center mb-4 shadow-lg shadow-orange-200/40">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <p className="text-base font-semibold text-gray-700 mb-1">你好！我是 AI 助手</p>
          <p className="text-sm text-gray-400 font-light">可以帮你理解网页内容、回答问题、翻译和总结</p>
        </div>
      )}

      {messages.map((msg, i) => (
        <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          {msg.role === 'assistant' && aiAvatar}
          <div className={`
            max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed
            ${msg.role === 'user'
              ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-sm'
              : 'bg-gray-50 text-gray-800 border border-gray-100 shadow-sm'}
          `}>
            {msg.role === 'assistant' ? (
              <div className="prose prose-sm max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_code]:bg-gray-200 [&_code]:px-1 [&_code]:rounded [&_pre]:bg-gray-200 [&_pre]:p-2 [&_pre]:rounded-lg [&_pre]:text-xs">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            ) : (
              <p>{msg.content}</p>
            )}
          </div>
          {msg.role === 'user' && (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-0.5">
              <User className="w-4 h-4 text-gray-600" />
            </div>
          )}
        </div>
      ))}

      {/* 流式输出 */}
      {isLoading && streamingContent && (
        <div className="flex gap-2.5 justify-start">
          {aiAvatar}
          <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm bg-gray-50 text-gray-800 border border-gray-100 shadow-sm leading-relaxed">
            <div className="prose prose-sm max-w-none [&_p]:my-1">
              <ReactMarkdown>{streamingContent}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* 三点跳动加载动画 */}
      {isLoading && !streamingContent && (
        <div className="flex gap-2.5 justify-start">
          {aiAvatar}
          <div className="bg-gray-50 rounded-2xl px-5 py-4 flex items-center gap-1.5 border border-gray-100 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-orange-400 bounce-dot-1" />
            <div className="w-2 h-2 rounded-full bg-orange-400 bounce-dot-2" />
            <div className="w-2 h-2 rounded-full bg-orange-400 bounce-dot-3" />
          </div>
        </div>
      )}
    </div>
  )
}
