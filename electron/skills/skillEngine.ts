import { v4 as uuidv4 } from 'uuid'
import { getSkills, addSkill, updateSkill } from '../db/repositories'
import { executeAction } from '../automation/actionExecutor'
import { TabManager } from '../tabManager'
import { BrowserWindow } from 'electron'

interface OperationRecord {
  type: string
  url?: string
  selector?: string
  text?: string
  timestamp: number
}

// 当前 session 的操作记录
let sessionOperations: OperationRecord[] = []
let currentSessionId = ''

/**
 * 记录用户操作
 */
export function recordOperation(type: string, data?: { url?: string; selector?: string; text?: string }): void {
  if (!currentSessionId) {
    currentSessionId = uuidv4()
  }

  sessionOperations.push({
    type,
    url: data?.url,
    selector: data?.selector,
    text: data?.text,
    timestamp: Date.now()
  })

  // 保留最近 100 条记录
  if (sessionOperations.length > 100) {
    sessionOperations = sessionOperations.slice(-100)
  }

  // 尝试识别模式
  tryDetectPatterns()
}

/**
 * 尝试检测重复操作模式
 */
function tryDetectPatterns(): void {
  if (sessionOperations.length < 6) return

  // 简单的 n-gram 分析
  const operations = sessionOperations.map(op => `${op.type}:${op.url || ''}:${op.selector || ''}`)

  // 检查 3-gram 到 6-gram 的重复
  for (let n = 3; n <= 6; n++) {
    const ngrams: Map<string, number> = new Map()

    for (let i = 0; i <= operations.length - n; i++) {
      const gram = operations.slice(i, i + n).join('|')
      ngrams.set(gram, (ngrams.get(gram) || 0) + 1)
    }

    // 如果某个 n-gram 出现了 3 次以上，认为是可学习的模式
    for (const [gram, count] of ngrams) {
      if (count >= 3) {
        const ops = gram.split('|').map(g => {
          const [type, url, selector] = g.split(':')
          return { type, url, selector }
        })

        // 检查是否已经有相似的技能
        const existingSkills = getSkills()
        const isDuplicate = existingSkills.some(skill => {
          const steps = JSON.parse(skill.steps || '[]')
          return steps.length === ops.length &&
            steps.every((s: any, i: number) => s.action === ops[i].type)
        })

        if (!isDuplicate) {
          // 创建新技能
          const newSkill = {
            id: uuidv4(),
            name: `自动学习: ${ops[0].type} → ${ops[ops.length - 1].type}`,
            description: `从 ${ops.length} 步操作中自动学习的技能`,
            category: 'auto-learned',
            triggers: ops[0].url ? [{ type: 'url_match' as const, pattern: ops[0].url }] : [],
            steps: ops.map((op, i) => ({
              order: i + 1,
              action: op.type as any,
              target: op.selector,
              description: `${op.type} ${op.selector || op.url || ''}`
            })),
            parameters: [],
            autoLearned: true,
            enabled: true
          }

          addSkill(newSkill)
          console.log('[Skill] 自动学习新技能:', newSkill.name)
        }
      }
    }
  }
}

/**
 * 匹配当前 URL 的技能
 */
export function matchSkills(url: string): any[] {
  const skills = getSkills().filter(s => s.enabled === 1 || s.enabled === true)

  return skills.filter(skill => {
    const triggers = JSON.parse(skill.triggers || '[]')
    return triggers.some((trigger: any) => {
      if (trigger.type === 'url_match') {
        try {
          const pattern = trigger.pattern.replace(/\*/g, '.*')
          return new RegExp(pattern).test(url)
        } catch {
          return false
        }
      }
      return false
    })
  })
}

/**
 * 执行技能
 */
export async function executeSkill(
  skillId: string,
  tabManager: TabManager,
  mainWindow: BrowserWindow,
  params?: Record<string, string>
): Promise<{ success: boolean; result: string }> {
  const skills = getSkills()
  const skill = skills.find(s => s.id === skillId)

  if (!skill) {
    return { success: false, result: '技能不存在' }
  }

  const steps = JSON.parse(skill.steps || '[]')
  const view = tabManager.getActiveView()

  if (!view) {
    return { success: false, result: '无可用的浏览器视图' }
  }

  mainWindow.webContents.send('skill:executing', { skillId, skillName: skill.name })

  // 准备活跃标签用于外部导航（如果是新标签页，需要先显示 BrowserView）
  tabManager.prepareActiveTabForExternalNavigation()

  const results: string[] = []

  for (const step of steps) {
    // 参数替换
    let actionParams: Record<string, any> = {}
    if (step.target) actionParams.text = step.target
    if (step.value) {
      let value = step.value
      // 替换参数
      if (params) {
        for (const [key, val] of Object.entries(params)) {
          value = value.replace(`{{${key}}}`, val)
        }
      }
      actionParams.text = value
      actionParams.url = value
    }

    const result = await executeAction(view, step.action, actionParams)
    results.push(`Step ${step.order}: ${step.description} → ${result}`)

    // 步骤间等待
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  // 更新技能统计
  updateSkill(skillId, {
    successCount: (skill.success_count || 0) + 1
  })

  const resultText = results.join('\n')
  mainWindow.webContents.send('skill:completed', { skillId, result: resultText })

  return { success: true, result: resultText }
}

/**
 * 重置会话
 */
export function resetSession(): void {
  sessionOperations = []
  currentSessionId = uuidv4()
}
