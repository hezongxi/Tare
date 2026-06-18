import { ipcMain, BrowserWindow } from 'electron'
import { sendChatMessage, stopGeneration } from '../ai/chatService'
import { runAgent, stopAgent } from '../ai/agentService'
import { getTabManager } from './browserHandlers'
import { executeSkill } from '../skills/skillEngine'

export function initAIIPC(mainWindow: BrowserWindow): void {
  // 聊天
  ipcMain.handle('ai:sendMessage', async (_e, message: string, context?: any) => {
    await sendChatMessage(message, context || {}, mainWindow)
  })

  ipcMain.handle('ai:stopGeneration', () => {
    stopGeneration()
    stopAgent()
  })

  // Agent 任务执行
  ipcMain.handle('ai:runAgent', async (_e, goal: string, history?: any[]) => {
    const tabManager = getTabManager()
    if (!tabManager) {
      mainWindow.webContents.send('agent:complete', {
        success: false,
        summary: 'TabManager 未初始化',
        steps: []
      })
      return
    }
    await runAgent(goal, tabManager, mainWindow, history)
  })

  // 技能执行
  ipcMain.handle('skill:executeSkill', async (_e, skillId: string, params?: Record<string, string>) => {
    const tabManager = getTabManager()
    if (!tabManager) return { success: false, result: 'TabManager 未初始化' }
    return await executeSkill(skillId, tabManager, mainWindow, params)
  })
}
