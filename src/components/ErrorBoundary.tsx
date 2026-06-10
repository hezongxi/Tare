import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-8">
          <AlertTriangle className="w-16 h-16 text-yellow-400 mb-4" />
          <h1 className="text-2xl font-bold mb-2">出了点问题</h1>
          <p className="text-gray-400 text-sm mb-6 max-w-md text-center">
            应用遇到了意外错误，请尝试刷新页面。
          </p>
          {this.state.error && (
            <div className="bg-gray-800 rounded-lg p-4 mb-6 max-w-md w-full">
              <p className="text-red-400 text-xs font-mono break-words">
                {this.state.error.message}
              </p>
            </div>
          )}
          <button
            onClick={this.handleReload}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            刷新页面
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
