import { Database } from 'sql.js'
import { getDatabase } from './connection'
import { saveDatabase } from './connection'
import {
  getSkills as _getSkills,
  addSkill as _addSkill,
  updateSkill as _updateSkill,
  deleteSkill as _deleteSkill
} from '../skills/skillStore'

// ===== 历史记录 =====
export function addHistoryVisit(url: string, title: string): void {
  const db = getDatabase()
  const now = new Date().toISOString()
  const existing = db.exec(`SELECT id, visit_count FROM history WHERE url = ?`, [url])

  if (existing.length > 0 && existing[0].values.length > 0) {
    const id = existing[0].values[0][0] as number
    const count = (existing[0].values[0][1] as number) + 1
    db.run(`UPDATE history SET visit_count = ?, last_visited = ?, title = ? WHERE id = ?`, [
      count, now, title, id
    ])
  } else {
    db.run(`INSERT INTO history (url, title, visit_count, last_visited, created_at) VALUES (?, ?, 1, ?, ?)`, [
      url, title, now, now
    ])
  }
  saveDatabase()
}

export function getHistory(query?: string, limit = 100): any[] {
  const db = getDatabase()
  if (query) {
    const result = db.exec(
      `SELECT id, url, title, visit_count, last_visited, created_at 
       FROM history WHERE url LIKE ? OR title LIKE ? 
       ORDER BY last_visited DESC LIMIT ?`,
      [`%${query}%`, `%${query}%`, limit]
    )
    return formatResult(result)
  }
  const result = db.exec(
    `SELECT id, url, title, visit_count, last_visited, created_at 
     FROM history ORDER BY last_visited DESC LIMIT ?`, [limit]
  )
  return formatResult(result)
}

export function clearHistory(): void {
  const db = getDatabase()
  db.run(`DELETE FROM history`)
  saveDatabase()
}

// ===== 书签 =====
export function getBookmarks(): any[] {
  const db = getDatabase()
  const result = db.exec(
    `SELECT id, title, url, parent_id, is_folder, sort_order, created_at 
     FROM bookmarks ORDER BY sort_order ASC, id ASC`
  )
  return formatResult(result)
}

export function addBookmark(title: string, url: string, parentId = 0, isFolder = false): number {
  const db = getDatabase()
  const now = new Date().toISOString()
  db.run(
    `INSERT INTO bookmarks (title, url, parent_id, is_folder, sort_order, created_at) VALUES (?, ?, ?, ?, 0, ?)`,
    [title, url, parentId, isFolder ? 1 : 0, now]
  )
  saveDatabase()
  const result = db.exec(`SELECT last_insert_rowid()`)
  return result[0]?.values[0][0] as number
}

export function updateBookmark(id: number, updates: { title?: string; url?: string; parentId?: number; sortOrder?: number }): void {
  const db = getDatabase()
  const fields: string[] = []
  const values: any[] = []

  if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title) }
  if (updates.url !== undefined) { fields.push('url = ?'); values.push(updates.url) }
  if (updates.parentId !== undefined) { fields.push('parent_id = ?'); values.push(updates.parentId) }
  if (updates.sortOrder !== undefined) { fields.push('sort_order = ?'); values.push(updates.sortOrder) }

  if (fields.length > 0) {
    values.push(id)
    db.run(`UPDATE bookmarks SET ${fields.join(', ')} WHERE id = ?`, values)
    saveDatabase()
  }
}

export function deleteBookmark(id: number): void {
  const db = getDatabase()
  // 递归删除文件夹及其内容
  db.run(`DELETE FROM bookmarks WHERE id = ?`, [id])
  db.run(`DELETE FROM bookmarks WHERE parent_id = ?`, [id])
  saveDatabase()
}

// ===== 下载记录 =====
export function addDownload(url: string, filename: string, savePath: string, totalBytes: number): number {
  const db = getDatabase()
  const now = new Date().toISOString()
  db.run(
    `INSERT INTO downloads (url, filename, save_path, total_bytes, received_bytes, status, created_at) VALUES (?, ?, ?, ?, 0, 'downloading', ?)`,
    [url, filename, savePath, totalBytes, now]
  )
  saveDatabase()
  const result = db.exec(`SELECT last_insert_rowid()`)
  return result[0]?.values[0][0] as number
}

export function updateDownload(id: number, updates: { receivedBytes?: number; status?: string; completedAt?: string }): void {
  const db = getDatabase()
  const fields: string[] = []
  const values: any[] = []

  if (updates.receivedBytes !== undefined) { fields.push('received_bytes = ?'); values.push(updates.receivedBytes) }
  if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status) }
  if (updates.completedAt !== undefined) { fields.push('completed_at = ?'); values.push(updates.completedAt) }

  if (fields.length > 0) {
    values.push(id)
    db.run(`UPDATE downloads SET ${fields.join(', ')} WHERE id = ?`, values)
    saveDatabase()
  }
}

export function getDownloads(): any[] {
  const db = getDatabase()
  const result = db.exec(
    `SELECT id, url, filename, save_path, total_bytes, received_bytes, status, created_at, completed_at 
     FROM downloads ORDER BY created_at DESC`
  )
  return formatResult(result)
}

// ===== 偏好设置 =====
export function getPreferences(): Record<string, string> {
  const db = getDatabase()
  const result = db.exec(`SELECT key, value FROM preferences`)
  const prefs: Record<string, string> = {}
  if (result.length > 0) {
    for (const row of result[0].values) {
      prefs[row[0] as string] = row[1] as string
    }
  }
  return prefs
}

export function setPreference(key: string, value: string): void {
  const db = getDatabase()
  const now = new Date().toISOString()
  db.run(
    `INSERT OR REPLACE INTO preferences (key, value, updated_at) VALUES (?, ?, ?)`,
    [key, value, now]
  )
  saveDatabase()
}

// ===== 技能（委托给文件系统存储）=====
export function getSkills(): any[] { return _getSkills() }
export function addSkill(skill: any): void { _addSkill(skill) }
export function updateSkill(id: string, updates: any): void { _updateSkill(id, updates) }
export function deleteSkill(id: string): void { _deleteSkill(id) }

// ===== 记忆/知识 =====
export function getKnowledge(category?: string): any[] {
  const db = getDatabase()
  if (category) {
    const result = db.exec(
      `SELECT id, category, title, content, source_url, confidence, usage_count, created_at, last_used 
       FROM knowledge WHERE category = ? ORDER BY created_at DESC`, [category]
    )
    return formatResult(result)
  }
  const result = db.exec(
    `SELECT id, category, title, content, source_url, confidence, usage_count, created_at, last_used 
     FROM knowledge ORDER BY created_at DESC`
  )
  return formatResult(result)
}

export function addKnowledge(entry: any): number {
  const db = getDatabase()
  const now = new Date().toISOString()
  db.run(
    `INSERT INTO knowledge (category, title, content, source_url, confidence, usage_count, created_at) 
     VALUES (?, ?, ?, ?, ?, 0, ?)`,
    [entry.category, entry.title, JSON.stringify(entry.content), entry.sourceUrl || null, entry.confidence || 0.8, now]
  )
  saveDatabase()
  const result = db.exec(`SELECT last_insert_rowid()`)
  return result[0]?.values[0][0] as number
}

export function deleteKnowledge(id: number): void {
  const db = getDatabase()
  db.run(`DELETE FROM knowledge WHERE id = ?`, [id])
  saveDatabase()
}

export function searchKnowledge(query: string): any[] {
  const db = getDatabase()
  const result = db.exec(
    `SELECT id, category, title, content, source_url, confidence, usage_count, created_at, last_used 
     FROM knowledge WHERE title LIKE ? OR content LIKE ? ORDER BY confidence DESC LIMIT 20`,
    [`%${query}%`, `%${query}%`]
  )
  return formatResult(result)
}

// ===== 对话历史 =====
export function saveConversation(id: string, tabId: string | null, messages: any[], contextUrl?: string): void {
  const db = getDatabase()
  const now = new Date().toISOString()
  db.run(
    `INSERT OR REPLACE INTO conversations (id, tab_id, messages, context_url, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, tabId, JSON.stringify(messages), contextUrl || null, now, now]
  )
  saveDatabase()
}

export function getConversations(tabId?: string): any[] {
  const db = getDatabase()
  if (tabId) {
    const result = db.exec(
      `SELECT id, tab_id, messages, context_url, created_at, updated_at 
       FROM conversations WHERE tab_id = ? ORDER BY updated_at DESC`, [tabId]
    )
    return formatResult(result)
  }
  const result = db.exec(
    `SELECT id, tab_id, messages, context_url, created_at, updated_at 
     FROM conversations ORDER BY updated_at DESC LIMIT 50`
  )
  return formatResult(result)
}

// ===== 操作历史 =====
export function addOperation(sessionId: string, type: string, url?: string, selector?: string, inputData?: string, result?: string): void {
  const db = getDatabase()
  const now = new Date().toISOString()
  db.run(
    `INSERT INTO operation_history (session_id, operation_type, url, selector, input_data, result, timestamp) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [sessionId, type, url || null, selector || null, inputData || null, result || null, now]
  )
  // 操作历史不立即保存，定期批量保存
}

export function getOperationsBySession(sessionId: string): any[] {
  const db = getDatabase()
  const result = db.exec(
    `SELECT id, session_id, operation_type, url, selector, input_data, result, timestamp 
     FROM operation_history WHERE session_id = ? ORDER BY timestamp ASC`, [sessionId]
  )
  return formatResult(result)
}

// ===== 工具函数 =====
function formatResult(result: any[]): any[] {
  if (!result || result.length === 0) return []
  const { columns, values } = result[0]
  return values.map((row: any[]) => {
    const obj: any = {}
    columns.forEach((col: string, i: number) => {
      obj[col] = row[i]
    })
    return obj
  })
}
