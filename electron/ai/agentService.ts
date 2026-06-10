import OpenAI from 'openai'
import { BrowserWindow } from 'electron'
import { getPreferences } from '../db/repositories'
import { serializePage, executeAction } from '../automation/actionExecutor'
import { TabManager } from '../tabManager'

interface AgentStep {
  stepNumber: number
  thought: string
  action: string
  params: Record<string, any>
  result?: string
  pageState?: string  // 保存该步骤执行时的页面快照
}

const VALID_ACTIONS = ['click', 'type', 'select', 'navigate', 'scroll', 'wait', 'extract', 'done']

let isRunning = false

/**
 * 解析 LLM 响应，增强容错
 * 返回 parsed step 和是否需要重试标记
 */
function parseResponse(content: string, step: number): { parsed: AgentStep; needsRetry: boolean } {
  let needsRetry = false

  // 尝试 JSON.parse
  let data: any = null
  try {
    data = JSON.parse(content)
  } catch {
    // JSON 解析失败
    needsRetry = true
    return {
      parsed: { stepNumber: step, thought: content, action: '', params: {} },
      needsRetry
    }
  }

  let thought = (data.thought || '').toString().trim()
  let action = (data.action || '').toString().trim()
  let params = data.params || {}

  // 如果 params 不是对象，重置
  if (typeof params !== 'object' || params === null || Array.isArray(params)) {
    params = {}
  }

  // 尝试从 action 字段中解析嵌套 JSON（有些模型会把完整 JSON 塞进 action 字段）
  if (!VALID_ACTIONS.includes(action) && action) {
    try {
      const inner = JSON.parse(action)
      if (inner.action && VALID_ACTIONS.includes(inner.action)) {
        action = inner.action
      }
      if (inner.params && typeof inner.params === 'object') {
        params = inner.params
      }
      if (inner.thought && !thought) {
        thought = inner.thought
      }
    } catch { /* not JSON, ignore */ }
  }

  // 如果 action 仍然不合法，从 thought 推断
  if (!VALID_ACTIONS.includes(action)) {
    if (thought.match(/选择|选取|下拉|select|选中/i)) {
      action = 'select'
    } else if (thought.match(/输入|填写|填入|键入|type/i)) {
      action = 'type'
    } else if (thought.match(/点击|单击|click/i)) {
      action = 'click'
    } else if (thought.match(/导航|跳转|打开.*网址|navigate/i)) {
      action = 'navigate'
    } else if (thought.match(/滚动|翻页|scroll/i)) {
      action = 'scroll'
    } else if (thought.match(/完成|结束|done/i)) {
      action = 'done'
    }

    // 如果推断出了有效 action 但原始 action 为空/不合法，标记需要重试
    if (action && VALID_ACTIONS.includes(action)) {
      needsRetry = false  // 推断成功，不需要重试
    } else {
      action = ''  // 无法推断，需要重试
      needsRetry = true
    }
  }

  // 尝试从 thought 中提取 params 信息（当 params 缺失关键字段时）
  if ((action === 'type' || action === 'select') && !params.text) {
    // 从 thought 中提取引号内的文本
    const match = thought.match(/[''""](.*?)[''""]/)
    if (match) {
      params.text = match[1]
    }
  }

  if ((action === 'click' || action === 'type' || action === 'select') && !params.ref) {
    // 从 thought 中提取 ref 编号
    const refMatch = thought.match(/ref[=:：]?\s*(\d+)/i) || thought.match(/\[(\d+)\]/) || thought.match(/元素\s*(\d+)/)
    if (refMatch) {
      params.ref = parseInt(refMatch[1])
    }
  }

  return {
    parsed: { stepNumber: step, thought, action, params },
    needsRetry
  }
}

/**
 * 运行 Agent 推理循环 (ReAct 模式)
 */
export async function runAgent(
  goal: string,
  tabManager: TabManager,
  mainWindow: BrowserWindow,
  maxSteps = 30
): Promise<{ success: boolean; summary: string; steps: AgentStep[] }> {
  if (isRunning) {
    return { success: false, summary: '已有 Agent 任务在运行中', steps: [] }
  }

  isRunning = true
  const steps: AgentStep[] = []

  const prefs = getPreferences()
  const client = new OpenAI({
    apiKey: prefs.openaiApiKey,
    baseURL: prefs.openaiBaseUrl || 'https://api.openai.com/v1'
  })
  const model = prefs.model || 'gpt-4o'

  const systemPrompt = `你是一个浏览器自动化 Agent。你的任务是根据用户的目标，通过一系列操作来完成浏览器中的任务。

你可以使用以下操作:
- click: 点击页面元素。参数: {ref: 元素编号} 或 {text: "元素文本"}
- type: 在输入框中输入文本。参数: {ref: 元素编号, text: "要输入的文本"} 或 {field: "输入框标识", text: "要输入的文本"}
- select: 选择下拉框选项。参数: {ref: 元素编号, text: "选项文本"}。用于 select 下拉选择框，text 是要选择的选项文字
- navigate: 导航到 URL。参数: {url: "目标URL"}
- scroll: 滚动页面。参数: {direction: "up" | "down"}
- wait: 等待。参数: {seconds: 秒数}
- extract: 提取页面内容。参数: {selector: "CSS选择器"}
- done: 任务完成。参数: {summary: "结果摘要"}

每次响应必须是严格 JSON 格式，包含三个字段: thought, action, params。

正确示例 1 - 点击操作:
{"thought": "需要点击姓名输入框", "action": "click", "params": {"ref": 3}}

正确示例 2 - 输入操作:
{"thought": "在姓名输入框中输入张三", "action": "type", "params": {"ref": 3, "text": "张三"}}

正确示例 3 - 下拉选择操作:
{"thought": "在性别下拉框中选择男", "action": "select", "params": {"ref": 5, "text": "男"}}

正确示例 4 - 完成:
{"thought": "所有表单字段已填写完毕", "action": "done", "params": {"summary": "已成功填写姓名、性别和电话"}}

重要规则:
1. action 字段必须是上述操作名之一(click/type/select/navigate/scroll/wait/extract/done)，不能为空
2. params 字段必须包含对应操作所需的参数
3. 仔细分析当前页面状态中的 [ref=N] 元素编号，用 ref 参数指定要操作的元素
4. 对于下拉选择框(select 元素，页面状态会显示 options 列表)，必须使用 select 操作，text 参数填写要选择的选项文本
5. 对于普通输入框(input/textarea)，使用 type 操作
6. 填写表单时：先分析页面元素列表，找到对应元素的 ref 编号，然后执行对应操作，每个字段都需要单独一次操作
7. 每次只执行一个操作，确保每步都正确
8. 如果任务完成，使用 "done" 操作并总结结果
9. 如果遇到错误或无法继续，也使用 "done" 并说明原因
10. 用中文思考和回答`

  /**
   * 调用 LLM 获取响应
   */
  const callLLM = async (msgs: OpenAI.Chat.ChatCompletionMessageParam[]): Promise<string> => {
    const response = await client.chat.completions.create({
      model,
      messages: msgs,
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    })
    return response.choices[0]?.message?.content || '{}'
  }

  try {
    for (let step = 1; step <= maxSteps; step++) {
      // 获取当前页面状态
      const activeView = tabManager.getActiveView()
      let pageState = '无活跃页面'
      if (activeView) {
        pageState = await serializePage(activeView)
      }

      // 构建消息
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `目标: ${goal}` }
      ]

      // 添加历史步骤（使用该步骤当时的页面快照）
      for (const s of steps) {
        messages.push({
          role: 'assistant',
          content: JSON.stringify({ thought: s.thought, action: s.action, params: s.params })
        })
        messages.push({
          role: 'user',
          content: `操作结果: ${s.result}\n\n当时页面状态:\n${s.pageState || '(未知)'}`
        })
      }

      if (steps.length === 0) {
        messages.push({
          role: 'user',
          content: `当前页面状态:\n${pageState}\n\n请开始执行任务。`
        })
      }

      // 通知渲染进程当前步骤
      mainWindow.webContents.send('agent:step', {
        stepNumber: step,
        status: 'thinking'
      })

      // 调用 LLM
      let content = await callLLM(messages)

      // 解析响应
      let { parsed, needsRetry } = parseResponse(content, step)

      // 如果需要重试，追加纠正消息重新调用
      if (needsRetry) {
        messages.push({ role: 'assistant', content })
        messages.push({
          role: 'user',
          content: `你的响应格式不正确。请严格按照以下 JSON 格式重新输出，action 必须是 click/type/select/navigate/scroll/wait/extract/done 之一，不能为空:\n{"thought": "你的思考", "action": "操作名", "params": {"ref": 编号, "text": "文本"}}`
        })
        content = await callLLM(messages)
        const retryResult = parseResponse(content, step)
        parsed = retryResult.parsed
        needsRetry = retryResult.needsRetry

        // 重试后仍然失败，终止
        if (needsRetry || !parsed.action) {
          parsed.action = 'done'
          parsed.params = { summary: `Agent 响应格式错误，无法解析操作。原始响应: ${content}` }
        }
      }

      // 通知渲染进程思考过程
      mainWindow.webContents.send('agent:step', {
        stepNumber: step,
        thought: parsed.thought,
        action: parsed.action,
        status: 'acting'
      })

      // 执行动作
      let result = ''
      if (activeView && parsed.action !== 'done') {
        result = await executeAction(activeView, parsed.action, parsed.params)
        // 等待页面更新
        await new Promise(resolve => setTimeout(resolve, 1000))
      } else if (parsed.action === 'done') {
        result = parsed.params.summary || '任务完成'
      } else {
        result = '无可用的浏览器视图'
      }

      parsed.result = result
      parsed.pageState = pageState  // 保存当前步骤的页面快照
      steps.push(parsed)

      // 通知渲染进程结果
      mainWindow.webContents.send('agent:step', {
        stepNumber: step,
        thought: parsed.thought,
        action: parsed.action,
        result,
        status: 'done'
      })

      // 如果任务完成
      if (parsed.action === 'done') {
        isRunning = false
        mainWindow.webContents.send('agent:complete', {
          success: true,
          summary: result,
          steps
        })
        return { success: true, summary: result, steps }
      }
    }

    // 达到最大步骤数
    const summary = `达到最大步骤数 (${maxSteps})，部分完成任务`
    isRunning = false
    mainWindow.webContents.send('agent:complete', {
      success: false,
      summary,
      steps
    })
    return { success: false, summary, steps }

  } catch (err: any) {
    isRunning = false
    const summary = `Agent 执行出错: ${err.message}`
    mainWindow.webContents.send('agent:complete', {
      success: false,
      summary,
      steps
    })
    return { success: false, summary, steps }
  }
}

export function isAgentRunning(): boolean {
  return isRunning
}
