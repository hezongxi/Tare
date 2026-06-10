import OpenAI from 'openai'
import { BrowserWindow } from 'electron'
import { getPreferences, searchKnowledge } from '../db/repositories'
import { getTabManager } from '../ipc/browserHandlers'

let openaiClient: OpenAI | null = null
let abortController: AbortController | null = null

/**
 * 获取或创建 OpenAI 客户端
 */
function getClient(): OpenAI {
  const prefs = getPreferences()
  const apiKey = prefs.openaiApiKey
  const baseUrl = prefs.openaiBaseUrl || 'https://api.openai.com/v1'

  if (!apiKey) {
    throw new Error('请先在设置中配置 OpenAI API Key')
  }

  // 每次都重新创建以确保使用最新配置
  openaiClient = new OpenAI({
    apiKey,
    baseURL: baseUrl
  })

  return openaiClient
}

/**
 * 发送聊天消息（流式）
 */
export async function sendChatMessage(
  message: string,
  context: { pageContent?: string; history?: any[] },
  mainWindow: BrowserWindow
): Promise<void> {
  const client = getClient()
  const prefs = getPreferences()
  const model = prefs.model || 'gpt-4o'

  abortController = new AbortController()

  // 如果前端未传入页面内容，服务端主动获取
  let pageContent = context.pageContent
  if (!pageContent) {
    const tm = getTabManager()
    if (tm) {
      try {
        pageContent = await tm.getPageContent()
      } catch (e) {
        console.error('[ChatService] 获取页面内容失败:', e)
      }
    }
  }

  // 构建系统提示
  let systemPrompt = `你是一个智能浏览器助手。请用中文回答用户的问题。回答要简洁、准确、有帮助。`

  // 注入页面上下文
  if (pageContent) {
    try {
      const pageData = JSON.parse(pageContent)
      systemPrompt += `\n\n当前页面信息:\n- 标题: ${pageData.title || '未知'}\n- URL: ${pageData.url || '未知'}\n- 描述: ${pageData.meta || '无'}\n\n页面内容:\n${pageData.text || '无法提取'}`
    } catch {
      systemPrompt += `\n\n当前页面内容:\n${pageContent}`
    }
  }

  // 注入相关记忆
  try {
    const memories = searchKnowledge(message.substring(0, 100))
    if (memories.length > 0) {
      systemPrompt += '\n\n相关记忆:'
      for (const mem of memories.slice(0, 5)) {
        systemPrompt += `\n- [${mem.category}] ${mem.title}: ${mem.content}`
      }
    }
  } catch {
    // 记忆检索失败不影响正常对话
  }

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: message }
  ]

  try {
    const stream = await client.chat.completions.create({
      model,
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 2000
    }, {
      signal: abortController.signal
    })

    let fullContent = ''

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || ''
      if (delta) {
        fullContent += delta
        mainWindow.webContents.send('ai:token', delta)
      }
    }

    mainWindow.webContents.send('ai:done', fullContent)
  } catch (err: any) {
    if (err.name === 'AbortError') {
      mainWindow.webContents.send('ai:done', '')
    } else if (err.status === 401) {
      mainWindow.webContents.send('ai:error', 'API Key 无效，请在设置中检查您的 OpenAI API Key。')
    } else if (err.status === 429) {
      mainWindow.webContents.send('ai:error', '请求频率过高，请稍后再试。')
    } else if (err.status === 404) {
      mainWindow.webContents.send('ai:error', `模型 "${model}" 不可用，请检查模型名称或切换其他模型。`)
    } else if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      mainWindow.webContents.send('ai:error', '无法连接到 AI 服务，请检查网络连接或 API 地址设置。')
    } else {
      const errorMsg = err.message || '未知错误'
      mainWindow.webContents.send('ai:error', `AI 服务出错: ${errorMsg}`)
    }
  } finally {
    abortController = null
  }
}

/**
 * 停止生成
 */
export function stopGeneration(): void {
  if (abortController) {
    abortController.abort()
    abortController = null
  }
}
