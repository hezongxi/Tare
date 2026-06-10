import { ipcMain } from 'electron'
import { PopupManager } from '../popupManager'
import { TabManager } from '../tabManager'

/**
 * 浮层窗口相关 IPC handler
 */
export function initPopupIPC(popupManager: PopupManager, sendToRenderer: (channel: string, ...args: any[]) => void, tabManager: TabManager): void {
  // 显示菜单浮层
  ipcMain.handle('popup:showMenu', (_e, x: number, y: number) => {
    popupManager.showMenu(x, y)
  })

  // 显示面板浮层
  ipcMain.handle('popup:showPanel', (_e, type: string) => {
    popupManager.showPanel(type)
  })

  // 关闭浮层
  ipcMain.handle('popup:hide', () => {
    popupManager.hidePopup()
  })

  // 获取当前浮层类型
  ipcMain.handle('popup:getCurrentType', () => {
    return popupManager.getCurrentType()
  })

  // 浮层操作回调 — 子窗口发送操作，转发给主窗口渲染进程
  ipcMain.on('popup:action', (_e, action: string, ...args: any[]) => {
    sendToRenderer(`popup:${action}`, ...args)
  })

  // 浮层导航 — 直接在主进程导航当前标签页，不走 renderer 中转
  ipcMain.handle('popup:navigateTab', (_e, url: string) => {
    const activeTabId = tabManager.getActiveTabId()
    if (activeTabId && url) {
      tabManager.navigate(activeTabId, url)
      return { success: true }
    }
    return { success: false, error: 'no active tab' }
  })
}
