import { BrowserWindow } from 'electron'
import path from 'path'

/**
 * 浮层窗口管理器
 * 解决 BrowserView 覆盖 webContents 浮层的问题
 * 通过子 BrowserWindow 渲染浮层 UI
 */
export class PopupManager {
  private mainWindow: BrowserWindow
  private popupWindow: BrowserWindow | null = null
  private currentType: string = ''

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
  }

  /**
   * 显示菜单浮层
   */
  showMenu(x: number, y: number): void {
    this.hidePopup()
    this.currentType = 'menu'

    this.popupWindow = new BrowserWindow({
      x: Math.round(x),
      y: Math.round(y),
      width: 240,
      height: 440,
      frame: false,
      transparent: true,
      hasShadow: false,
      resizable: false,
      movable: false,
      parent: this.mainWindow,
      modal: false,
      skipTaskbar: true,
      focusable: true,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload/index.js'),
        sandbox: false,
      }
    })

    this.loadPopupContent('menu')
    this.setupPopupEvents()

    this.popupWindow.once('ready-to-show', () => {
      this.popupWindow?.show()
      this.popupWindow?.focus()
    })
  }

  /**
   * 显示右侧面板
   */
  showPanel(type: string): void {
    this.hidePopup()
    this.currentType = type

    const [winX, winY] = this.mainWindow.getPosition()
    const [winWidth, winHeight] = this.mainWindow.getSize()

    // 面板定位在窗口右侧
    const panelWidth = 384
    const panelX = winX + winWidth - panelWidth
    const panelY = winY

    this.popupWindow = new BrowserWindow({
      x: Math.round(panelX),
      y: Math.round(panelY),
      width: panelWidth,
      height: winHeight,
      frame: false,
      transparent: false,
      resizable: false,
      movable: false,
      parent: this.mainWindow,
      modal: false,
      skipTaskbar: true,
      focusable: true,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload/index.js'),
        sandbox: false,
      }
    })

    this.loadPopupContent(type)
    this.setupPopupEvents()

    // 监听主窗口移动/缩放，同步面板位置和尺寸
    const moveHandler = () => {
      if (!this.popupWindow || this.popupWindow.isDestroyed()) return
      const [newX, newY] = this.mainWindow.getPosition()
      const [currentWidth, currentHeight] = this.mainWindow.getSize()
      this.popupWindow.setPosition(newX + currentWidth - panelWidth, newY)
      this.popupWindow.setSize(panelWidth, currentHeight)
    }
    this.mainWindow.on('move', moveHandler)
    this.mainWindow.on('resize', moveHandler)
    this.popupWindow.once('closed', () => {
      this.mainWindow.removeListener('move', moveHandler)
      this.mainWindow.removeListener('resize', moveHandler)
    })

    this.popupWindow.once('ready-to-show', () => {
      this.popupWindow?.show()
      this.popupWindow?.focus()
    })
  }

  /**
   * 关闭浮层
   */
  hidePopup(): void {
    if (this.popupWindow && !this.popupWindow.isDestroyed()) {
      this.popupWindow.destroy()
    }
    this.popupWindow = null
    this.currentType = ''
  }

  /**
   * 获取当前浮层类型
   */
  getCurrentType(): string {
    return this.currentType
  }

  private loadPopupContent(type: string): void {
    if (!this.popupWindow) return

    const rendererUrl = process.env.ELECTRON_RENDERER_URL
    if (rendererUrl) {
      this.popupWindow.loadURL(`${rendererUrl}/popup.html?type=${type}`)
    } else {
      this.popupWindow.loadFile(path.join(__dirname, '../renderer/popup.html'), {
        query: { type }
      })
    }
  }

  private setupPopupEvents(): void {
    if (!this.popupWindow) return

    // 监听窗口关闭，通知主窗口渲染进程重置状态
    this.popupWindow.once('closed', () => {
      this.sendToRenderer('popup:closed', this.currentType)
      this.popupWindow = null
      this.currentType = ''
    })

    // 失焦时自动关闭（菜单场景）
    if (this.currentType === 'menu') {
      this.popupWindow.on('blur', () => {
        // 延迟关闭，给点击事件时间处理
        setTimeout(() => {
          if (this.currentType === 'menu') {
            this.hidePopup()
          }
        }, 150)
      })
    }
  }

  private sendToRenderer(channel: string, ...args: any[]): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, ...args)
    }
  }
}
