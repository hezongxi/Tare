import OpenAI from 'openai'
import { BrowserWindow } from 'electron'
import { getPreferences, addSkill } from '../db/repositories'
import { serializePage, executeAction } from '../automation/actionExecutor'
import { TabManager } from '../tabManager'
import { v4 as uuidv4 } from 'uuid'

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
let agentAbortController: AbortController | null = null

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
  history?: { role: string; content: string }[],
  maxSteps = 30
): Promise<{ success: boolean; summary: string; steps: AgentStep[] }> {
  if (isRunning) {
    const result = { success: false, summary: '已有智能体任务正在运行，请先停止当前任务。', steps: [] }
    mainWindow.webContents.send('agent:complete', result)
    return result
  }

  isRunning = true
  const steps: AgentStep[] = []

  const prefs = getPreferences()
  console.log('[Agent] prefs loaded:', { 
    hasKey: !!prefs.openaiApiKey, 
    keyPrefix: prefs.openaiApiKey?.slice(0, 8), 
    baseUrl: prefs.openaiBaseUrl, 
    model: prefs.model 
  })
  if (!prefs.openaiApiKey) {
    isRunning = false
    agentAbortController = null
    const result = { success: false, summary: '请先在设置中配置 API Key。', steps }
    mainWindow.webContents.send('agent:complete', result)
    return result
  }

  const model = prefs.model || 'gpt-4o'
  agentAbortController = new AbortController()

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
10. 用中文思考和回答
11. 意图判断规则（最高优先级）:
   - 如果用户的目标是「创建/定义/编写/保存一个 Skill/技能」，这不是浏览器操作，应立即返回 done
   - 如果用户在问问题、聊天、请求知识解答、寻求建议，这不是浏览器操作，应立即返回 done
   - 只有当用户明确要求「在浏览器中执行操作」（如打开网页、点击按钮、填写表单、搜索内容等）时才使用浏览器操作
   - 「创建一个XX的skills」≠「执行XX」，前者是定义任务，后者才是执行任务
   - 当页面状态为内部页面时，除 navigate 外的浏览器操作都无法执行，对话类请求应返回 done`

  // 创建 OpenAI 客户端（与 chatService 相同方式）
  const client = new OpenAI({
    apiKey: prefs.openaiApiKey,
    baseURL: prefs.openaiBaseUrl || 'https://api.openai.com/v1'
  })

  /**
   * 流式调用 LLM（使用 OpenAI SDK，与 chatService 保持一致）
   */
  const streamLLM = async (
    msgs: { role: string; content: string }[],
    onToken: (token: string) => void
  ): Promise<string> => {
    let fullContent = ''
    console.log('[Agent] calling LLM stream...')
    const stream = await client.chat.completions.create({
      model,
      messages: msgs as any,
      stream: true,
      temperature: 0.3,
      max_tokens: 1000
    }, {
      signal: agentAbortController?.signal
    })

    for await (const chunk of stream) {
      if (!isRunning) break
      const delta = chunk.choices[0]?.delta?.content || ''
      if (delta) {
        fullContent += delta
        onToken(delta)
      }
    }
    console.log('[Agent] LLM stream done, length:', fullContent.length)
    return fullContent
  }

  try {
    for (let step = 1; step <= maxSteps; step++) {
      if (!isRunning) {
        const summary = '智能体任务已停止。'
        mainWindow.webContents.send('agent:complete', {
          success: false,
          summary,
          steps
        })
        return { success: false, summary, steps }
      }

      // 获取当前页面状态
      const activeView = tabManager.getActiveView()
      const activeTabData = tabManager.getActiveTabData()
      let pageState = '无活跃页面'

      if (activeTabData?.isNewTab || activeTabData?.isInternalPage) {
        // 新标签页/内部页面不需要序列化，直接描述
        const url = activeTabData?.url || 'browser://newtab'
        pageState = `当前在浏览器内部页面: ${url}（非普通网页，无法执行浏览器操作）`
        console.log('[Agent] step', step, 'internal page, skip serializePage')
      } else if (activeView) {
        console.log('[Agent] step', step, 'serializing page...')
        try {
          pageState = await Promise.race([
            serializePage(activeView),
            new Promise<string>((_, reject) => setTimeout(() => reject(new Error('serializePage timeout')), 5000))
          ])
        } catch (e: any) {
          console.warn('[Agent] serializePage failed/timeout:', e.message)
          pageState = '无法获取页面状态'
        }
        console.log('[Agent] step', step, 'page serialized, length:', pageState.length)
      }

      // 构建消息
      const messages: { role: string; content: string }[] = [
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

      // 流式调用 LLM
      // 第一步静默流式（因为可能是 JSON，不应直接显示给用户）
      console.log('[Agent] step', step, 'calling streamLLM...')
      let streamedTokens = ''
      let content: string
      if (step === 1) {
        content = await streamLLM(messages, (token) => {
          streamedTokens += token
          // 第一步不发 token 给前端，等解析后再决定
        })
      } else {
        content = await streamLLM(messages, (token) => {
          streamedTokens += token
          mainWindow.webContents.send('ai:token', token)
        })
      }
      console.log('[Agent] step', step, 'streamLLM returned, content length:', content.length)

      // 解析响应
      let { parsed, needsRetry } = parseResponse(content, step)

      // 如果需要重试，追加纠正消息重新调用
      if (needsRetry) {
        // 清除之前流式输出的内容
        mainWindow.webContents.send('ai:done', '')
        streamedTokens = ''

        messages.push({ role: 'assistant', content })
        messages.push({
          role: 'user',
          content: `你的响应格式不正确。请严格按照以下 JSON 格式重新输出，action 必须是 click/type/select/navigate/scroll/wait/extract/done 之一，不能为空:\n{"thought": "你的思考", "action": "操作名", "params": {"ref": 编号, "text": "文本"}}`
        })
        content = await streamLLM(messages, (token) => {
          streamedTokens += token
          mainWindow.webContents.send('ai:token', token)
        })
        const retryResult = parseResponse(content, step)
        parsed = retryResult.parsed
        needsRetry = retryResult.needsRetry

        // 重试后仍然失败，终止
        if (needsRetry || !parsed.action) {
          parsed.action = 'done'
          parsed.params = { summary: `Agent 响应格式错误，无法解析操作。原始响应: ${content}` }
        }
      }

      // ── 第一步检测：非浏览器任务 → 降级为流式对话回复 ──
      if (step === 1 && (parsed.action === 'done' || !parsed.action)) {
        console.log('[Agent] step 1 done/no-action, fallback to chat mode')

        // 检测是否是“创建 Skill”意图
        const isCreateSkill = /创建|定义|新建|添加|生成/.test(goal) && /skill|skills|技能|技巧/.test(goal.toLowerCase())

        if (isCreateSkill) {
          // 用 LLM 生成结构化 Skill 数据
          console.log('[Agent] detected create-skill intent, generating skill...')
          const skillGenMessages: { role: string; content: string }[] = [
            { role: 'system', content: `你是一个 Skill 创建助手。根据用户的描述生成一个浏览器自动化技能定义。
请输出严格 JSON 格式，包含以下字段：
{
  "name": "技能名称（英文下划线命名）",
  "description": "技能描述（中文）",
  "category": "分类（如 navigation/form/search/general）",
  "triggers": [{"type": "manual", "pattern": "触发词1"}, {"type": "manual", "pattern": "触发词2"}],
  "steps": [{"order": 1, "action": "navigate", "target": "", "value": "URL或内容", "description": "步骤描述"}]
}
只输出 JSON，不要其他内容。` },
            ...(history || []),
            { role: 'user', content: goal }
          ]
          const skillJson = await streamLLM(skillGenMessages, () => {})

          try {
            const skillData = JSON.parse(skillJson.trim())
            const newSkill = {
              id: uuidv4(),
              name: skillData.name || 'new_skill',
              description: skillData.description || '',
              category: skillData.category || 'general',
              triggers: skillData.triggers || [],
              steps: skillData.steps || [],
              parameters: skillData.parameters || [],
              autoLearned: false,
              enabled: true
            }
            addSkill(newSkill)
            console.log('[Agent] skill created:', newSkill.name)

            // 告知前端
            const summary = `✅ 已成功创建技能「${newSkill.description || newSkill.name}」！\n\n- 名称: ${newSkill.name}\n- 描述: ${newSkill.description}\n- 触发词: ${newSkill.triggers.map((t: any) => t.pattern).join(', ')}\n- 步骤数: ${newSkill.steps.length}\n\n你可以在技能市场中查看和管理已创建的技能。`
            mainWindow.webContents.send('ai:token', summary)
            mainWindow.webContents.send('ai:done', summary)
            isRunning = false
            agentAbortController = null
            return { success: true, summary, steps: [] }
          } catch (e: any) {
            console.warn('[Agent] skill creation parse failed:', e.message)
            // 解析失败，回退到普通对话
          }
        }

        // 普通对话降级
        const chatMessages: { role: string; content: string }[] = [
          { role: 'system', content: '你是一个智能浏览器助手。请用中文简洁回答用户的问题。不要输出 JSON，直接用自然语言回答。' },
          ...(history || []),
          { role: 'user', content: goal }
        ]
        const chatContent = await streamLLM(chatMessages, (token) => {
          mainWindow.webContents.send('ai:token', token)
        })
        mainWindow.webContents.send('ai:done', chatContent)
        isRunning = false
        agentAbortController = null
        return { success: true, summary: chatContent, steps: [] }
      }

      // 第一步未降级，说明是浏览器操作（第一步没发 token 给前端，无需清除）
      if (step === 1 && streamedTokens) {
        // 第一步是静默的，不需要清除前端内容
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
        agentAbortController = null
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
    agentAbortController = null
    mainWindow.webContents.send('agent:complete', {
      success: false,
      summary,
      steps
    })
    return { success: false, summary, steps }

  } catch (err: any) {
    console.error('[Agent] Error:', {
      name: err.name,
      status: err.status,
      message: err.message,
      type: err.type,
      code: err.code
    })
    isRunning = false
    agentAbortController = null
    if (err.name === 'AbortError') {
      mainWindow.webContents.send('ai:done', '')
    } else {
      mainWindow.webContents.send('ai:error', `Agent 执行出错: ${err.status || ''} ${err.message}`)
    }
    return { success: false, summary: err.message, steps }
  }
}

export function isAgentRunning(): boolean {
  return isRunning
}

export function stopAgent(): void {
  if (agentAbortController) {
    agentAbortController.abort()
    agentAbortController = null
  }
  isRunning = false
}
