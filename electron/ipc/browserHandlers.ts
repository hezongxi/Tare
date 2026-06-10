import { ipcMain } from 'electron'
import { TabManager } from '../tabManager'

let tabManager: TabManager | null = null

export function initBrowserIPC(manager: TabManager): void {
  tabManager = manager

  ipcMain.handle('browser:createTab', (_e, url?: string) => {
    return tabManager!.createTab(url)
  })

  ipcMain.handle('browser:closeTab', (_e, tabId: string) => {
    tabManager!.closeTab(tabId)
  })

  ipcMain.handle('browser:switchTab', (_e, tabId: string) => {
    tabManager!.switchTab(tabId)
  })

  ipcMain.handle('browser:navigate', (_e, tabId: string, url: string) => {
    tabManager!.navigate(tabId, url)
  })

  ipcMain.handle('browser:goBack', (_e, tabId: string) => {
    tabManager!.goBack(tabId)
  })

  ipcMain.handle('browser:goForward', (_e, tabId: string) => {
    tabManager!.goForward(tabId)
  })

  ipcMain.handle('browser:reload', (_e, tabId: string) => {
    tabManager!.reload(tabId)
  })

  ipcMain.handle('browser:reorderTabs', (_e, fromIndex: number, toIndex: number) => {
    tabManager!.reorderTabs(fromIndex, toIndex)
  })

  // 设置右侧面板宽度（面板打开时缩小 BrowserView）
  ipcMain.handle('browser:setSidebarWidth', (_e, width: number) => {
    tabManager!.setSidebarWidth(width)
  })

  // 缩放
  ipcMain.handle('browser:setZoomLevel', (_e, level: number) => {
    tabManager!.setZoomLevel(level)
  })
  ipcMain.handle('browser:getZoomLevel', () => {
    return tabManager!.getZoomLevel()
  })

  // 开发者工具
  ipcMain.handle('browser:openDevTools', () => {
    tabManager!.openDevTools()
  })

  // 打印
  ipcMain.handle('browser:print', () => {
    tabManager!.printPage()
  })

  // 页面查找
  ipcMain.handle('browser:findInPage', (_e, text: string, options?: any) => {
    tabManager!.findInPage(text, options)
  })
  ipcMain.handle('browser:stopFindInPage', () => {
    tabManager!.stopFindInPage()
  })

  // AI 获取页面内容
  ipcMain.handle('ai:getPageContent', async () => {
    return await tabManager!.getPageContent()
  })
}

export function getTabManager(): TabManager | null {
  return tabManager
}
