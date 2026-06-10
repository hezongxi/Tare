import React, { useState, useEffect } from 'react'
import { Zap, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import type { AgentStep } from '../../lib/types'

export function AgentStatus(): React.ReactElement | null {
  const [steps, setSteps] = useState<AgentStep[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  useEffect(() => {
    if (!window.aiAPI) return

    // 监听 Agent 步骤（通过 dataAPI 的通用事件）
    // 这里简化处理，后续可以添加专用 IPC
  }, [])

  if (!isRunning && !result) return null

  return (
    <div className="bg-gray-800 border-b border-gray-600 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-4 h-4 text-yellow-400" />
        <span className="text-sm font-medium text-gray-200">Agent 执行中</span>
        {isRunning && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />}
      </div>

      <div className="space-y-1.5 max-h-40 overflow-y-auto">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            <span className="text-gray-500 shrink-0 w-5">#{step.stepNumber}</span>
            <div className="flex-1">
              <p className="text-gray-300">{step.thought}</p>
              {step.result && (
                <p className="text-gray-500 mt-0.5">→ {step.result}</p>
              )}
            </div>
            {step.status === 'done' && <CheckCircle className="w-3 h-3 text-green-400 shrink-0 mt-0.5" />}
            {step.status === 'failed' && <XCircle className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />}
          </div>
        ))}
      </div>

      {result && (
        <div className="mt-2 p-2 rounded bg-gray-700 text-xs text-gray-300">
          <strong>结果:</strong> {result}
        </div>
      )}
    </div>
  )
}
