import { create } from 'zustand'
import type { ChatMessage, ChatSession } from '../lib/types'

const STORAGE_KEY = 'ai-chat-sessions'

interface ChatState {
  sessions: ChatSession[]
  currentSessionId: string | null

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

function createEmptySession(mode: 'qa' | 'agent' = 'qa'): ChatSession {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    title: '新对话',
    messages: [],
    mode,
    createdAt: now,
    updatedAt: now,
  }
}

function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    }
  } catch {
    // ignore corrupt local data
  }
  return []
}

function saveSessions(sessions: ChatSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  } catch {
    // ignore storage failures
  }
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  currentSessionId: null,

  createSession: (mode) => {
    const session = createEmptySession(mode)
    set((state) => {
      const sessions = [session, ...state.sessions]
      saveSessions(sessions)
      return { sessions, currentSessionId: session.id }
    })
    return session.id
  },

  deleteSession: (id) => {
    set((state) => {
      let sessions = state.sessions.filter(s => s.id !== id)
      const deletedSession = state.sessions.find(s => s.id === id)

      if (sessions.length === 0) {
        sessions = [createEmptySession(deletedSession?.mode || 'qa')]
      }

      const currentSessionId = state.currentSessionId === id
        ? sessions[0].id
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
      let currentSessionId = state.currentSessionId
      let sessions = state.sessions

      if (!currentSessionId || sessions.every(s => s.id !== currentSessionId)) {
        const session = createEmptySession('qa')
        currentSessionId = session.id
        sessions = [session, ...sessions]
      }

      const nextSessions = sessions.map(s => {
        if (s.id !== currentSessionId) return s

        const messages = [...s.messages, msg]
        let title = s.title
        if (s.messages.length === 0 && msg.role === 'user') {
          title = msg.content.slice(0, 20) + (msg.content.length > 20 ? '...' : '')
        }

        return { ...s, messages, title, updatedAt: new Date().toISOString() }
      })

      saveSessions(nextSessions)
      return { sessions: nextSessions, currentSessionId }
    })
  },

  updateStreamingContent: (_content) => {
    // Streaming text is UI-only; final content is persisted through addMessage.
  },

  loadFromStorage: () => {
    let sessions = loadSessions()
    if (sessions.length === 0) {
      sessions = [createEmptySession('qa')]
      saveSessions(sessions)
    }

    set({
      sessions,
      currentSessionId: sessions[0].id,
    })
  },

  saveToStorage: () => {
    saveSessions(get().sessions)
  },
}))
