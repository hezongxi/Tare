/**
 * Skill 文件系统存储模块
 * 将 Skills 保存为 Markdown 文件到用户目录：
 * C:\Users\<username>\.Tare\skills\<skill-name>\<skill-name>.md
 */

import { app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import * as yaml from 'js-yaml'
import { v4 as uuidv4 } from 'uuid'

interface SkillData {
  id: string
  name: string
  description: string
  category: string
  triggers: any[]
  steps: any[]
  parameters?: any[]
  enabled: boolean
  autoLearned: boolean
  successCount: number
  failCount: number
  createdAt: string
  updatedAt: string
  content?: string // markdown body content
}

/**
 * 获取 skills 目录路径
 */
function getSkillsDir(): string {
  const dir = path.join(app.getPath('home'), '.Tare', 'skills')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

/**
 * 解析 Markdown 文件（YAML frontmatter + body）
 */
function parseMarkdownFile(filePath: string): SkillData | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
    if (!fmMatch) {
      console.warn('[SkillStore] No frontmatter found in:', filePath)
      return null
    }
    const frontmatter = yaml.load(fmMatch[1]) as any
    const body = fmMatch[2].trim()

    return {
      id: frontmatter.id || uuidv4(),
      name: frontmatter.name || path.basename(filePath, '.md'),
      description: frontmatter.description || '',
      category: frontmatter.category || 'general',
      triggers: frontmatter.triggers || [],
      steps: frontmatter.steps || [],
      parameters: frontmatter.parameters || [],
      enabled: frontmatter.enabled !== false,
      autoLearned: frontmatter.autoLearned || false,
      successCount: frontmatter.successCount || 0,
      failCount: frontmatter.failCount || 0,
      createdAt: frontmatter.createdAt || new Date().toISOString(),
      updatedAt: frontmatter.updatedAt || new Date().toISOString(),
      content: body
    }
  } catch (e: any) {
    console.error('[SkillStore] Failed to parse:', filePath, e.message)
    return null
  }
}

/**
 * 将 Skill 数据序列化为 Markdown 字符串
 */
function serializeMarkdownFile(skill: SkillData): string {
  const frontmatter = {
    id: skill.id,
    name: skill.name,
    description: skill.description,
    category: skill.category,
    triggers: skill.triggers,
    steps: skill.steps,
    parameters: skill.parameters || [],
    enabled: skill.enabled,
    autoLearned: skill.autoLearned,
    successCount: skill.successCount,
    failCount: skill.failCount,
    createdAt: skill.createdAt,
    updatedAt: skill.updatedAt
  }

  const yamlStr = yaml.dump(frontmatter, { lineWidth: -1, noRefs: true })
  const body = skill.content || `# ${skill.description || skill.name}\n\n${skill.description || ''} 的自动化技能。`

  return `---\n${yamlStr}---\n\n${body}\n`
}

/**
 * 获取所有 Skills
 */
export function getSkills(): any[] {
  const dir = getSkillsDir()
  const skills: any[] = []

  if (!fs.existsSync(dir)) return skills

  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const skillDir = path.join(dir, entry.name)
    const mdFile = path.join(skillDir, `${entry.name}.md`)
    if (fs.existsSync(mdFile)) {
      const skill = parseMarkdownFile(mdFile)
      if (skill) {
        // 转换为与 SQLite 兼容的格式（triggers/steps 为 JSON 字符串）
        skills.push({
          id: skill.id,
          name: skill.name,
          description: skill.description,
          category: skill.category,
          triggers: JSON.stringify(skill.triggers),
          steps: JSON.stringify(skill.steps),
          parameters: JSON.stringify(skill.parameters || []),
          enabled: skill.enabled ? 1 : 0,
          auto_learned: skill.autoLearned ? 1 : 0,
          success_count: skill.successCount,
          fail_count: skill.failCount,
          created_at: skill.createdAt,
          updated_at: skill.updatedAt
        })
      }
    }
  }

  // 按创建时间倒序
  skills.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  return skills
}

/**
 * 添加新 Skill
 */
export function addSkill(skill: any): void {
  const now = new Date().toISOString()
  const skillName = skill.name || 'new_skill'

  const skillData: SkillData = {
    id: skill.id || uuidv4(),
    name: skillName,
    description: skill.description || '',
    category: skill.category || 'general',
    triggers: skill.triggers || [],
    steps: skill.steps || [],
    parameters: skill.parameters || [],
    enabled: skill.enabled !== false,
    autoLearned: skill.autoLearned || false,
    successCount: 0,
    failCount: 0,
    createdAt: now,
    updatedAt: now
  }

  const dir = getSkillsDir()
  const skillDir = path.join(dir, skillName)

  if (!fs.existsSync(skillDir)) {
    fs.mkdirSync(skillDir, { recursive: true })
  }

  const mdFile = path.join(skillDir, `${skillName}.md`)
  fs.writeFileSync(mdFile, serializeMarkdownFile(skillData), 'utf-8')
  console.log('[SkillStore] Skill saved:', mdFile)
}

/**
 * 更新 Skill
 */
export function updateSkill(id: string, updates: any): void {
  const dir = getSkillsDir()
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const mdFile = path.join(dir, entry.name, `${entry.name}.md`)
    if (!fs.existsSync(mdFile)) continue

    const skill = parseMarkdownFile(mdFile)
    if (!skill || skill.id !== id) continue

    // 应用更新
    if (updates.name !== undefined) skill.name = updates.name
    if (updates.description !== undefined) skill.description = updates.description
    if (updates.triggers !== undefined) skill.triggers = updates.triggers
    if (updates.steps !== undefined) skill.steps = updates.steps
    if (updates.parameters !== undefined) skill.parameters = updates.parameters
    if (updates.enabled !== undefined) skill.enabled = !!updates.enabled
    if (updates.successCount !== undefined) skill.successCount = updates.successCount
    if (updates.failCount !== undefined) skill.failCount = updates.failCount
    skill.updatedAt = new Date().toISOString()

    fs.writeFileSync(mdFile, serializeMarkdownFile(skill), 'utf-8')
    console.log('[SkillStore] Skill updated:', mdFile)
    return
  }

  console.warn('[SkillStore] Skill not found for update:', id)
}

/**
 * 删除 Skill
 */
export function deleteSkill(id: string): void {
  const dir = getSkillsDir()
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const mdFile = path.join(dir, entry.name, `${entry.name}.md`)
    if (!fs.existsSync(mdFile)) continue

    const skill = parseMarkdownFile(mdFile)
    if (!skill || skill.id !== id) continue

    const skillDir = path.join(dir, entry.name)
    fs.rmSync(skillDir, { recursive: true, force: true })
    console.log('[SkillStore] Skill deleted:', skillDir)
    return
  }

  console.warn('[SkillStore] Skill not found for delete:', id)
}
