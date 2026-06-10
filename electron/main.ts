import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron'
import path from 'path'
import { initDatabase, closeDatabase } from './db/connection'
import { TabManager } from './tabManager'
import { PopupManager } from './popupManager'
import { initBrowserIPC } from './ipc/browserHandlers'
import { initDataIPC } from './ipc/dataHandlers'
import { initAIIPC } from './ipc/aiHandlers'
import { initPopupIPC } from './ipc/popupHandlers'

let mainWindow: BrowserWindow | null = null
let tabManager: TabManager | null = null
let popupManager: PopupManager | null = null

/**
 * 注册全局快捷键
 */
function registerShortcuts(): void {
  if (!mainWindow || !tabManager) return

  // Ctrl+T: 新建标签页
  globalShortcut.register('CommandOrControl+T', () => {
    tabManager?.createTab()
  })

  // Ctrl+W: 关闭当前标签页
  globalShortcut.register('CommandOrControl+W', () => {
    if (!tabManager) return
    const activeId = tabManager.getActiveTabId()
    if (activeId) tabManager.closeTab(activeId)
  })

  // Ctrl+L: 聚焦 URL 栏
  globalShortcut.register('CommandOrControl+L', () => {
    mainWindow?.webContents.send('shortcut:focusUrlBar')
  })

  // Ctrl+Shift+I: 切换 AI 侧边栏
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    mainWindow?.webContents.send('shortcut:toggleAI')
  })

  // F5 / Ctrl+R: 刷新当前页
  globalShortcut.register('F5', () => {
    const id = tabManager?.getActiveTabId()
    if (id) tabManager?.reload(id)
  })

  // Alt+Left: 后退
  globalShortcut.register('Alt+Left', () => {
    const id = tabManager?.getActiveTabId()
    if (id) tabManager?.goBack(id)
  })

  // Alt+Right: 前进
  globalShortcut.register('Alt+Right', () => {
    const id = tabManager?.getActiveTabId()
    if (id) tabManager?.goForward(id)
  })
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    autoHideMenuBar: true,
    title: 'Tare',
    icon: path.join(__dirname, '../../resources/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  // 窗口控制 IPC
  ipcMain.handle('window:minimize', () => mainWindow?.minimize())
  ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })
  ipcMain.handle('window:close', () => mainWindow?.close())
  ipcMain.handle('window:isMaximized', () => mainWindow?.isMaximized() ?? false)

  // 窗口最大化状态变化时通知渲染进程
  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window:maximizedChanged', true)
  })
  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window:maximizedChanged', false)
  })

  // 移除原生菜单栏
  mainWindow.setMenuBarVisibility(false)
  mainWindow.removeMenu()

  // 初始化 TabManager
  tabManager = new TabManager(mainWindow)
  initBrowserIPC(tabManager)

  // 初始化 PopupManager
  popupManager = new PopupManager(mainWindow)
  const sendToRenderer = (channel: string, ...args: any[]) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(channel, ...args)
    }
  }
  initPopupIPC(popupManager, sendToRenderer, tabManager)

  // 开发模式加载 Vite dev server，生产模式加载打包文件
  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  // 页面加载完成后创建默认标签页
  mainWindow.webContents.on('did-finish-load', () => {
    if (tabManager && tabManager.getAllTabs().length === 0) {
      tabManager.createTab()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(async () => {
  // 全局错误处理
  process.on('uncaughtException', (error) => {
    console.error('[Main] Uncaught Exception:', error)
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('app:error', {
        type: 'uncaughtException',
        message: error.message
      })
    }
  })

  process.on('unhandledRejection', (reason: any) => {
    console.error('[Main] Unhandled Rejection:', reason)
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('app:error', {
        type: 'unhandledRejection',
        message: reason?.message || String(reason)
      })
    }
  })

  // 初始化数据库
  await initDatabase()
  console.log('[Main] DB initialized')

  // 初始化数据 IPC
  initDataIPC()

  createWindow()

  // 初始化 AI IPC
  if (mainWindow) {
    initAIIPC(mainWindow)
  }

  // 注册全局快捷键
  registerShortcuts()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
      registerShortcuts()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    globalShortcut.unregisterAll()
    app.quit()
  }
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('before-quit', () => {
  closeDatabase()
})

export { mainWindow }
