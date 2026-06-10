import { ipcMain } from 'electron'
import * as repo from '../db/repositories'

export function initDataIPC(): void {
  // 历史
  ipcMain.handle('data:getHistory', (_e, query?: string) => {
    return repo.getHistory(query)
  })

  ipcMain.handle('data:clearHistory', () => {
    repo.clearHistory()
  })

  // 书签
  ipcMain.handle('data:getBookmarks', () => {
    return repo.getBookmarks()
  })

  ipcMain.handle('data:addBookmark', (_e, bookmark: any) => {
    const id = repo.addBookmark(bookmark.title, bookmark.url, bookmark.parentId, bookmark.isFolder)
    return { ...bookmark, id }
  })

  ipcMain.handle('data:updateBookmark', (_e, id: number, updates: any) => {
    repo.updateBookmark(id, updates)
  })

  ipcMain.handle('data:deleteBookmark', (_e, id: number) => {
    repo.deleteBookmark(id)
  })

  // 下载
  ipcMain.handle('data:getDownloads', () => {
    return repo.getDownloads()
  })

  // 设置
  ipcMain.handle('data:getPreferences', () => {
    return repo.getPreferences()
  })

  ipcMain.handle('data:setPreference', (_e, key: string, value: any) => {
    repo.setPreference(key, typeof value === 'string' ? value : JSON.stringify(value))
  })

  // 记忆/知识
  ipcMain.handle('memory:getMemories', (_e, category?: string) => {
    return repo.getKnowledge(category)
  })

  ipcMain.handle('memory:addMemory', (_e, memory: any) => {
    const id = repo.addKnowledge(memory)
    return { ...memory, id }
  })

  ipcMain.handle('memory:deleteMemory', (_e, id: number) => {
    repo.deleteKnowledge(id)
  })

  ipcMain.handle('memory:searchMemories', (_e, query: string) => {
    return repo.searchKnowledge(query)
  })

  // 技能
  ipcMain.handle('skill:getSkills', () => {
    return repo.getSkills()
  })

  ipcMain.handle('skill:createSkill', (_e, skill: any) => {
    repo.addSkill(skill)
    return skill
  })

  ipcMain.handle('skill:updateSkill', (_e, id: string, updates: any) => {
    repo.updateSkill(id, updates)
  })

  ipcMain.handle('skill:deleteSkill', (_e, id: string) => {
    repo.deleteSkill(id)
  })
}
