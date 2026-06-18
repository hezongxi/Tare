import { BrowserView, BrowserWindow } from 'electron'
import type { WebContents } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import { addHistoryVisit } from './db/repositories'

export interface TabData {
  id: string
  url: string
  title: string
  favicon: string | null
  isLoading: boolean
  canGoBack: boolean
  canGoForward: boolean
  isNewTab: boolean  // 是否为新标签页（尚未导航）
  isInternalPage: boolean  // 是否为内部页面（browser://）
}

export class TabManager {
  private mainWindow: BrowserWindow
  private tabs: Map<string, { view: BrowserView; data: TabData }> = new Map()
  private tabOrder: string[] = []
  private activeTabId: string | null = null
  private sidebarWidth = 0  // AI 侧边栏宽度
  private lastSelectedTextByTab: Map<string, string> = new Map()

  // 布局常量
  private readonly TAB_BAR_HEIGHT = 52
  private readonly NAV_BAR_HEIGHT = 56
  private readonly LEFT_SIDEBAR_WIDTH = 0
  private readonly OUTER_GUTTER = 0
  private readonly MAIN_TOP_GAP = 0
  private readonly RIGHT_GUTTER = 0
  private readonly BOTTOM_GUTTER = 0
  private readonly SIDEBAR_OVERLAP = 0

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow

    // 窗口大小变化时重新计算 BrowserView 尺寸
    mainWindow.on('resize', () => this.resizeAllViews())
  }

  /**
   * 创建新标签页
   */
  createTab(url?: string): TabData {
    const id = uuidv4()
    const isInternalPage = url ? url.startsWith('browser://') : false
    const isNewTab = !url

    const view = new BrowserView({
      webPreferences: {
        sandbox: false,
        contextIsolation: true,
        nodeIntegration: false
      }
    })

    // 设置标准 Chrome User-Agent，避免被网站拒绝
    view.webContents.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
    )

    // 内部页面标题
    let title = '新标签页'
    if (isInternalPage) {
      if (url?.startsWith('browser://settings')) title = '设置'
      else if (url?.startsWith('browser://downloads')) title = '下载记录'
      else if (url?.startsWith('browser://favourites')) title = '收藏'
      else if (url?.startsWith('browser://history')) title = '历史记录'
      else if (url?.startsWith('browser://skills')) title = 'Skills 市场'
      else title = url || '内部页面'
    }

    const tabData: TabData = {
      id,
      url: url || '',
      title,
      favicon: null,
      isLoading: false,
      canGoBack: false,
      canGoForward: false,
      isNewTab,
      isInternalPage
    }

    this.tabs.set(id, { view, data: tabData })
    this.tabOrder.push(id)

    // 设置 BrowserView 位置和尺寸
    this.mainWindow.addBrowserView(view)
    if (isNewTab || isInternalPage) {
      // 新标签页/内部页面隐藏 BrowserView，让 React 组件正常显示
      view.setBounds({ x: 0, y: 0, width: 0, height: 0 })
    } else {
      this.updateViewBounds(id)
    }

    // 监听事件
    this.setupViewListeners(id, view)

    // 如果有 URL 且不是内部页面，开始导航
    if (url && !isInternalPage) {
      view.webContents.loadURL(url)
    }

    // 切换到新标签
    this.switchTab(id)

    // 通知渲染进程
    this.sendToRenderer('browser:tabCreated', tabData)

    return tabData
  }

  /**
   * 关闭标签页
   */
  closeTab(tabId: string): void {
    console.log('[TabManager] closeTab:', tabId, 'total tabs:', this.tabs.size)
    const tab = this.tabs.get(tabId)
    if (!tab) {
      console.warn('[TabManager] Tab not found:', tabId)
      return
    }

    // 销毁 BrowserView
    this.mainWindow.removeBrowserView(tab.view)
    // @ts-ignore - destroy is available
    tab.view.webContents.close()

    this.tabs.delete(tabId)
    const index = this.tabOrder.indexOf(tabId)
    if (index > -1) this.tabOrder.splice(index, 1)

    // 通知渲染进程
    this.sendToRenderer('browser:tabRemoved', tabId)

    // 如果关闭的是当前活跃标签，切换到相邻标签
    if (this.activeTabId === tabId) {
      if (this.tabOrder.length > 0) {
        const newIndex = Math.min(index, this.tabOrder.length - 1)
        this.switchTab(this.tabOrder[newIndex])
      } else {
        this.activeTabId = null
        // 如果没有标签了，创建一个新的
        this.createTab()
      }
    }
  }

  /**
   * 切换标签页
   */
  switchTab(tabId: string): void {
    const tab = this.tabs.get(tabId)
    if (!tab) return

    // 隐藏所有 BrowserView
    for (const [id, t] of this.tabs) {
      if (id !== tabId && t.view.webContents) {
        t.view.setBounds({ x: 0, y: 0, width: 0, height: 0 })
      }
    }

    this.activeTabId = tabId

    // 显示目标 BrowserView（新标签页/内部页面保持隐藏，让 React 组件显示）
    if (!tab.data.isNewTab && !tab.data.isInternalPage) {
      this.updateViewBounds(tabId)
    }

    // 通知渲染进程
    this.sendToRenderer('browser:activeTabChanged', tabId)
  }

  /**
   * 导航到 URL
   */
  navigate(tabId: string, url: string): void {
    const tab = this.tabs.get(tabId)
    if (!tab) return

    // 检测内部协议
    if (url.startsWith('browser://')) {
      tab.data.isInternalPage = true
      tab.data.isNewTab = false
      tab.data.url = url
      // 设置标题
      if (url.startsWith('browser://settings')) tab.data.title = '设置'
      else if (url.startsWith('browser://downloads')) tab.data.title = '下载记录'
      else if (url.startsWith('browser://favourites')) tab.data.title = '收藏'
      else if (url.startsWith('browser://history')) tab.data.title = '历史记录'
      else if (url.startsWith('browser://skills')) tab.data.title = 'Skills 市场'
      else tab.data.title = url
      // 隐藏 BrowserView
      tab.view.setBounds({ x: 0, y: 0, width: 0, height: 0 })
      this.sendToRenderer('browser:tabUpdated', tabId, { ...tab.data })
      return
    }

    // URL 智能处理
    let processedUrl = url
    if (!url.match(/^(https?|file):\/\//i)) {
      if (url.includes('.') && !url.includes(' ')) {
        processedUrl = `https://${url}`
      } else {
        processedUrl = `https://www.baidu.com/s?wd=${encodeURIComponent(url)}`
      }
    }

    tab.data.isNewTab = false
    tab.data.isInternalPage = false
    // 立即通知渲染进程，避免 UI 延迟更新
    this.sendToRenderer('browser:tabUpdated', tabId, { isNewTab: false, isInternalPage: false })
    // 从新标签页导航时，恢复 BrowserView 尺寸
    this.updateViewBounds(tabId)
    tab.view.webContents.loadURL(processedUrl)
  }

  /**
   * 后退
   */
  goBack(tabId: string): void {
    const tab = this.tabs.get(tabId)
    if (tab && tab.view.webContents.canGoBack()) {
      tab.view.webContents.goBack()
    }
  }

  /**
   * 前进
   */
  goForward(tabId: string): void {
    const tab = this.tabs.get(tabId)
    if (tab && tab.view.webContents.canGoForward()) {
      tab.view.webContents.goForward()
    }
  }

  /**
   * 刷新
   */
  reload(tabId: string): void {
    const tab = this.tabs.get(tabId)
    if (tab) {
      tab.view.webContents.reload()
    }
  }

  /**
   * 重新排序标签
   */
  reorderTabs(fromIndex: number, toIndex: number): void {
    const [removed] = this.tabOrder.splice(fromIndex, 1)
    this.tabOrder.splice(toIndex, 0, removed)
  }

  /**
   * 获取标签数据
   */
  getTabData(tabId: string): TabData | null {
    return this.tabs.get(tabId)?.data || null
  }

  /**
   * 获取所有标签
   */
  getAllTabs(): TabData[] {
    return this.tabOrder.map(id => this.tabs.get(id)!.data)
  }

  /**
   * 获取当前活跃标签 ID
   */
  getActiveTabId(): string | null {
    return this.activeTabId
  }

  /**
   * 获取当前活跃的 BrowserView
   */
  getActiveView(): BrowserView | null {
    if (!this.activeTabId) return null
    return this.tabs.get(this.activeTabId)?.view || null
  }

  /**
   * 获取当前活跃标签的数据（供 Agent 判断是否为内部页面）
   */
  getActiveTabData(): { isNewTab: boolean; isInternalPage: boolean; url: string } | null {
    if (!this.activeTabId) return null
    const tab = this.tabs.get(this.activeTabId)
    if (!tab) return null
    return {
      isNewTab: tab.data.isNewTab,
      isInternalPage: tab.data.isInternalPage || false,
      url: tab.data.url || ''
    }
  }

  /**
   * 准备活跃标签用于外部导航（如 Skill 执行）
   * 将标签标记为非新标签页并显示 BrowserView
   */
  prepareActiveTabForExternalNavigation(): void {
    if (!this.activeTabId) return
    const tab = this.tabs.get(this.activeTabId)
    if (!tab) return

    if (tab.data.isNewTab || tab.data.isInternalPage) {
      tab.data.isNewTab = false
      tab.data.isInternalPage = false
      this.sendToRenderer('browser:tabUpdated', this.activeTabId, { isNewTab: false, isInternalPage: false })
      this.updateViewBounds(this.activeTabId)
    }
  }

  /**
   * 设置侧边栏宽度（AI 侧边栏打开时调用）
   */
  setSidebarWidth(width: number): void {
    this.sidebarWidth = width
    this.resizeAllViews()
  }

  /**
   * 设置当前标签页缩放级别
   */
  setZoomLevel(level: number): void {
    if (!this.activeTabId) return
    const tab = this.tabs.get(this.activeTabId)
    if (tab && !tab.data.isNewTab) {
      tab.view.webContents.setZoomLevel(level)
    }
  }

  /**
   * 获取当前标签页缩放级别
   */
  getZoomLevel(): number {
    if (!this.activeTabId) return 0
    const tab = this.tabs.get(this.activeTabId)
    if (tab && !tab.data.isNewTab) {
      return tab.view.webContents.getZoomLevel()
    }
    return 0
  }

  /**
   * 打开当前页面的开发者工具
   */
  openDevTools(): void {
    if (!this.activeTabId) {
      this.openOrFocusDevTools(this.mainWindow.webContents)
      return
    }
    const tab = this.tabs.get(this.activeTabId)
    if (tab && !tab.data.isNewTab && !tab.data.isInternalPage) {
      this.openOrFocusDevTools(tab.view.webContents)
      return
    }
    this.openOrFocusDevTools(this.mainWindow.webContents)
  }

  private openOrFocusDevTools(webContents: WebContents): void {
    if (webContents.isDevToolsOpened()) {
      webContents.devToolsWebContents?.focus()
      return
    }
    webContents.openDevTools({ mode: 'detach' })
  }

  /**
   * 打印当前页面
   */
  printPage(): void {
    if (!this.activeTabId) return
    const tab = this.tabs.get(this.activeTabId)
    if (tab && !tab.data.isNewTab) {
      tab.view.webContents.print()
    }
  }

  /**
   * 页面内查找
   */
  findInPage(text: string, options?: { forward?: boolean; findNext?: boolean }): void {
    if (!this.activeTabId || !text) return
    const tab = this.tabs.get(this.activeTabId)
    if (tab && !tab.data.isNewTab) {
      tab.view.webContents.findInPage(text, options)
    }
  }

  /**
   * 停止页面查找
   */
  stopFindInPage(): void {
    if (!this.activeTabId) return
    const tab = this.tabs.get(this.activeTabId)
    if (tab && !tab.data.isNewTab) {
      tab.view.webContents.stopFindInPage('clearSelection')
    }
  }

  /**
   * 获取当前页面的 HTML 内容
   */
  async getPageContent(tabId?: string): Promise<string> {
    const id = tabId || this.activeTabId
    if (!id) return ''
    const tab = this.tabs.get(id)
    if (!tab || tab.data.isNewTab) return ''

    try {
      const jsCode = [
        '(function(){',
        'var body=document.body;',
        'if(!body)return JSON.stringify({title:"",url:location.href,meta:"",text:""});',
        'var title=document.title||"";',
        'var url=location.href;',
        'var meta=document.querySelector("meta[name=description]")?.content||"";',
        'var structured="";',
        // headings
        'var hds=[];',
        'document.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach(function(el){',
        '  var t=(el.innerText||"").trim();',
        '  if(t)hds.push(el.tagName+": "+t);',
        '});',
        'if(hds.length>0)structured+="\\u3010\\u6807\\u9898\\u7ed3\\u6784\\u3011\\n"+hds.join("\\n")+"\\n\\n";',
        // links
        'var lks=[];',
        'document.querySelectorAll("a[href]").forEach(function(el){',
        '  var t=(el.innerText||"").trim();',
        '  if(t&&t.length>1&&t.length<100)lks.push(t);',
        '});',
        'if(lks.length>0){',
        '  var u=[...new Set(lks)].slice(0,80);',
        '  structured+="\\u3010\\u94fe\\u63a5/\\u5bfc\\u822a\\u3011\\n"+u.join(" | ")+"\\n\\n";',
        '}',
        // list items
        'var items=[];',
        'document.querySelectorAll("li,[class*=item],[class*=title],[class*=news],[class*=hot]").forEach(function(el){',
        '  var t=(el.innerText||"").trim();',
        '  if(t&&t.length>2&&t.length<200)items.push(t);',
        '});',
        'if(items.length>0){',
        '  var u=[...new Set(items)].slice(0,60);',
        '  structured+="\\u3010\\u5217\\u8868/\\u6761\\u76ee\\u3011\\n"+u.join("\\n")+"\\n\\n";',
        '}',
        // body text
        'var clone=body.cloneNode(true);',
        'clone.querySelectorAll("script,style,noscript,svg,link,meta,iframe,input,button,form").forEach(function(el){el.remove();});',
        'var text=(clone.innerText||clone.textContent||"").trim();',
        'var lines=text.split("\\n").map(function(l){return l.trim();}).filter(function(l){return l.length>0;});',
        'text=lines.join("\\n").substring(0,5000);',
        // combine
        'var output="";',
        'if(structured)output+=structured;',
        'if(text)output+="\\u3010\\u6b63\\u6587\\u6587\\u672c\\u3011\\n"+text;',
        'return JSON.stringify({title:title,url:url,meta:meta,text:output.substring(0,6000)});',
        '})()'
      ].join(' ')
      const content = await tab.view.webContents.executeJavaScript(jsCode)
      return content
    } catch (err) {
      console.error('[TabManager] 获取页面内容失败:', err)
      return ''
    }
  }

  // ===== 私有方法 =====

  private setupViewListeners(tabId: string, view: BrowserView): void {
    const wc = view.webContents

    wc.on('console-message', (_event, _level, message) => {
      const marker = '__TARE_SELECTED_TEXT__'
      if (!message.startsWith(marker)) return
      if (tabId !== this.activeTabId) return

      try {
        const payload = JSON.parse(message.slice(marker.length))
        const text = String(payload.text || '').trim()
        if (!text || text === this.lastSelectedTextByTab.get(tabId)) return

        this.lastSelectedTextByTab.set(tabId, text)
        this.sendToRenderer('browser:textSelected', {
          text,
          url: String(payload.url || ''),
          title: String(payload.title || '')
        })
      } catch {
        // Ignore malformed console payloads from arbitrary pages.
      }
    })

    wc.on('dom-ready', () => {
      this.installSelectionBridge(tabId, view)
    })

    wc.on('did-finish-load', () => {
      this.installSelectionBridge(tabId, view)
    })

    wc.on('did-navigate', (_e, url) => {
      this.updateTabData(tabId, { url, isNewTab: false })
    })

    wc.on('did-navigate-in-page', (_e, url) => {
      this.updateTabData(tabId, { url })
    })

    wc.on('page-title-updated', (_e, title) => {
      this.updateTabData(tabId, { title })
      // 在获得真实标题后记录历史
      const tab = this.tabs.get(tabId)
      if (tab && tab.data.url) {
        addHistoryVisit(tab.data.url, title)
        // 通知渲染进程历史已更新
        this.sendToRenderer('browser:historyUpdated')
      }
    })

    wc.on('page-favicon-updated', (_e, favicons) => {
      if (favicons.length > 0) {
        this.updateTabData(tabId, { favicon: favicons[0] })
      }
    })

    wc.on('did-start-loading', () => {
      this.updateTabData(tabId, { isLoading: true })
    })

    wc.on('did-stop-loading', () => {
      this.updateTabData(tabId, {
        isLoading: false,
        canGoBack: wc.canGoBack(),
        canGoForward: wc.canGoForward()
      })
    })

    // 页面加载失败处理
    wc.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
      console.error(`[TabManager] 页面加载失败: ${errorCode} - ${errorDescription}, URL: ${validatedURL}`)

      // 忽略被取消的加载（errorCode = -3）
      if (errorCode === -3) return

      this.updateTabData(tabId, { isLoading: false })

      // 仅对主框架加载失败注入错误页面
      if (isMainFrame) {
        const errorHtml = `
          <html><head><meta charset="utf-8"><style>
            body { font-family: system-ui; background: #f8fafc; color: #334155;
                   display: flex; justify-content: center; align-items: center;
                   height: 100vh; margin: 0; }
            .container { text-align: center; max-width: 500px; padding: 40px; }
            h1 { color: #ef4444; font-size: 24px; margin-bottom: 12px; }
            p { color: #64748b; line-height: 1.6; font-size: 14px; }
            button { background: #f97316; color: white; border: none; padding: 10px 24px;
                     border-radius: 8px; cursor: pointer; font-size: 14px; margin-top: 20px; }
            button:hover { background: #ea580c; }
          </style></head><body>
            <div class="container">
              <h1>⚠️ 无法加载此页面</h1>
              <p>${errorDescription}</p>
              <p style="font-size:12px;color:#94a3b8">错误码: ${errorCode} | ${validatedURL}</p>
              <button onclick="location.reload()">重试</button>
            </div>
          </body></html>
        `
        wc.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`)
      }
    })

    // 处理新窗口打开（链接 target="_blank"）
    wc.setWindowOpenHandler(({ url }) => {
      this.createTab(url)
      return { action: 'deny' }
    })
  }

  private installSelectionBridge(tabId: string, view: BrowserView): void {
    const tab = this.tabs.get(tabId)
    if (!tab || tab.data.isNewTab || tab.data.isInternalPage) return

    const bridgeScript = `
      (() => {
        if (window.__tareSelectionBridgeInstalled) return;
        window.__tareSelectionBridgeInstalled = true;

        let lastText = '';
        let timer = 0;
        const marker = '__TARE_SELECTED_TEXT__';

        const normalize = (value) => (value || '').replace(/\\s+/g, ' ').trim();
        const emit = () => {
          const selection = window.getSelection && window.getSelection();
          const text = normalize(selection ? selection.toString() : '');
          if (!text || text.length < 2 || text === lastText) return;

          lastText = text;
          const clipped = text.length > 2000 ? text.slice(0, 2000) + '...' : text;
          console.info(marker + JSON.stringify({
            text: clipped,
            url: location.href,
            title: document.title
          }));
        };

        const schedule = () => {
          clearTimeout(timer);
          timer = window.setTimeout(emit, 260);
        };

        document.addEventListener('selectionchange', schedule, true);
        document.addEventListener('mouseup', schedule, true);
        document.addEventListener('keyup', schedule, true);
      })();
    `

    view.webContents.executeJavaScript(bridgeScript, true).catch(() => {
      // Some pages may block injection during transient navigations.
    })
  }

  private updateTabData(tabId: string, updates: Partial<TabData>): void {
    const tab = this.tabs.get(tabId)
    if (!tab) return

    Object.assign(tab.data, updates)
    this.sendToRenderer('browser:tabUpdated', tabId, tab.data)
  }

  private updateViewBounds(tabId: string): void {
    const tab = this.tabs.get(tabId)
    if (!tab) return

    // 新标签页/内部页面保持 BrowserView 隐藏
    if (tab.data.isNewTab || tab.data.isInternalPage) {
      tab.view.setBounds({ x: 0, y: 0, width: 0, height: 0 })
      return
    }

    const [winWidth, winHeight] = this.mainWindow.getSize()
    const topOffset = this.TAB_BAR_HEIGHT + this.NAV_BAR_HEIGHT + this.MAIN_TOP_GAP
    const leftOffset = this.OUTER_GUTTER + this.LEFT_SIDEBAR_WIDTH

    tab.view.setBounds({
      x: leftOffset,
      y: topOffset,
      width: winWidth - leftOffset - this.RIGHT_GUTTER - this.sidebarWidth + this.SIDEBAR_OVERLAP,
      height: winHeight - topOffset - this.BOTTOM_GUTTER
    })
  }

  private resizeAllViews(): void {
    for (const tabId of this.tabOrder) {
      if (tabId === this.activeTabId) {
        this.updateViewBounds(tabId)
      }
    }
  }

  private sendToRenderer(channel: string, ...args: any[]): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, ...args)
    }
  }
}
