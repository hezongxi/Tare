import React from 'react'
import ReactDOM from 'react-dom/client'
import { DropdownMenu } from './components/browser/DropdownMenu'
import './index.css'

/**
 * 浮层窗口入口
 * 根据 URL 参数 type 渲染不同组件
 */

function getPopupType(): string {
  const params = new URLSearchParams(window.location.search)
  return params.get('type') || 'menu'
}

function PopupApp(): React.ReactElement {
  const type = getPopupType()

  const sendAction = (action: string, ...args: any[]) => {
    window.popupAPI?.sendAction(action, ...args)
  }

  const handleClose = () => {
    window.popupAPI?.hide()
  }

  if (type === 'menu') {
    return (
      <div style={{ width: '100%', height: '100%', background: 'transparent' }}>
        <DropdownMenu
          isOpen={true}
          onClose={handleClose}
          onNewTab={() => { sendAction('newTab'); handleClose() }}
          onOpenHistory={() => { sendAction('openHistory'); handleClose() }}
          onOpenSettings={() => { sendAction('openSettings'); handleClose() }}
          onOpenFavorites={() => { sendAction('openFavorites'); handleClose() }}
          onOpenDownloads={() => { sendAction('openDownloads'); handleClose() }}
          isPopup={true}
        />
      </div>
    )
  }

  return <div className="p-4 text-gray-500 text-sm">未知面板类型: {type}</div>
}

const rootEl = document.getElementById('popup-root')
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <PopupApp />
    </React.StrictMode>
  )
}
