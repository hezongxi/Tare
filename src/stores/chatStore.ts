import { create } from 'zustand'
import type { ChatMessage, ChatSession } from '../lib/types'

const STORAGE_KEY = 'ai-chat-sessions'

interface ChatState {
  sessions: ChatSession[]
  currentSessionId: string | null

  // 操作
  createSession: (mode: 'qa' | 'agent') => string
  deleteSession: (id: string) => void
  setCurrentSession: (id: string | null) => void
  addMessage: (msg: ChatMessage) => void
  updateStreamingContent: (content: string) => void
  loadFromStorage: () => void
  saveToStorage: () => void
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}

function saveSessions(sessions: ChatSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  } catch { /* ignore */ }
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  currentSessionId: null,

  createSession: (mode) => {
    const id = generateId()
    const now = new Date().toISOString()
    const session: ChatSession = {
      id,
      title: '新对话',
      messages: [],
      mode,
      createdAt: now,
      updatedAt: now,
    }
    set((state) => {
      const sessions = [session, ...state.sessions]
      saveSessions(sessions)
      return { sessions, currentSessionId: id }
    })
    return id
  },

  deleteSession: (id) => {
    set((state) => {
      const sessions = state.sessions.filter(s => s.id !== id)
      const currentSessionId = state.currentSessionId === id
        ? (sessions.length > 0 ? sessions[0].id : null)
        : state.currentSessionId
      saveSessions(sessions)
      return { sessions, currentSessionId }
    })
  },

  setCurrentSession: (id) => {
    set({ currentSessionId: id })
  },

  addMessage: (msg) => {
    set((state) => {
      if (!state.currentSessionId) return state
      const sessions = state.sessions.map(s => {
        if (s.id !== state.currentSessionId) return s
        const messages = [...s.messages, msg]
        // 取第一条用户消息前 20 字符作为标题
        let title = s.title
        if (s.messages.length === 0 && msg.role === 'user') {
          title = msg.content.slice(0, 20) + (msg.content.length > 20 ? '...' : '')
        }
        return { ...s, messages, title, updatedAt: new Date().toISOString() }
      })
      saveSessions(sessions)
      return { sessions }
    })
  },

  updateStreamingContent: (_content) => {
    // 流式内容不持久化，仅用于 UI 显示
    // 最终消息通过 addMessage 持久化
  },

  loadFromStorage: () => {
    const sessions = loadSessions()
    set({
      sessions,
      currentSessionId: sessions.length > 0 ? sessions[0].id : null
    })
  },

  saveToStorage: () => {
    saveSessions(get().sessions)
  },
}))
