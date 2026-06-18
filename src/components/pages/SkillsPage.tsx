import React, { useEffect, useMemo, useState } from 'react'
import {
  Briefcase,
  ChevronDown,
  ChevronRight,
  Clock,
  Code,
  Database,
  ExternalLink,
  FileText,
  Flame,
  Globe,
  Grid3X3,
  Languages,
  List,
  Mic,
  Plus,
  Puzzle,
  Search,
  Send,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Users,
  ClipboardCheck,
} from 'lucide-react'
import type { Skill } from '../../lib/types'

type SkillCardData = {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  users: string
  rating: string
  icon: React.ComponentType<{ className?: string }>
  iconClass: string
  installClass: string
  featuredClass?: string
  badge?: string
  badgeClass?: string
  sourceSkill?: Skill
}

const categories = ['全部', '效率办公', '网页自动化', '信息检索', '内容创作', '开发工具', '数据处理', '热门', '最新']

const showcaseSkills: SkillCardData[] = [
  {
    id: 'summary-pro',
    name: '智能总结 Pro',
    description: '深度理解长文档与网页，输出结构化摘要与思维导图。',
    category: '内容创作',
    tags: ['办公', 'AI', 'Web'],
    users: '12.8万',
    rating: '4.9',
    icon: FileText,
    iconClass: 'from-rose-400 to-orange-400',
    installClass: 'bg-rose-50 text-rose-500 hover:bg-rose-100',
    featuredClass: 'from-rose-50 via-pink-50 to-white',
    badge: '热门',
    badgeClass: 'bg-rose-50 text-rose-500 border-rose-100',
  },
  {
    id: 'translator-pro',
    name: '全能翻译官',
    description: '支持 100+ 语言互译，保留原文排版与术语库。',
    category: '效率办公',
    tags: ['AI', '翻译', '效率'],
    users: '9.3万',
    rating: '4.8',
    icon: Languages,
    iconClass: 'from-blue-400 to-violet-500',
    installClass: 'bg-violet-50 text-violet-500 hover:bg-violet-100',
    featuredClass: 'from-violet-50 via-indigo-50 to-white',
    badge: '官方',
    badgeClass: 'bg-blue-50 text-blue-500 border-blue-100',
  },
  {
    id: 'data-insight',
    name: '数据洞察助手',
    description: '自动分析数据集，生成可视化图表与洞察报告。',
    category: '数据处理',
    tags: ['数据', '分析', '自动化'],
    users: '7.6万',
    rating: '4.8',
    icon: Sparkles,
    iconClass: 'from-orange-400 to-rose-400',
    installClass: 'bg-orange-50 text-orange-500 hover:bg-orange-100',
    featuredClass: 'from-orange-50 via-amber-50 to-white',
    badge: '推荐',
    badgeClass: 'bg-orange-50 text-orange-500 border-orange-100',
  },
]

const marketplaceSkills: SkillCardData[] = [
  {
    id: 'web-summary',
    name: '网页总结',
    description: '快速提炼网页重点，生成摘要与要点。',
    category: '效率办公',
    tags: ['办公', 'AI', 'Web'],
    users: '18.2万',
    rating: '4.9',
    icon: FileText,
    iconClass: 'from-rose-400 to-orange-400',
    installClass: 'bg-rose-50 text-rose-500 hover:bg-rose-100',
  },
  {
    id: 'smart-translate',
    name: '智能翻译',
    description: '一键翻译网页与选中文本。',
    category: '效率办公',
    tags: ['AI', '翻译', '效率'],
    users: '15.6万',
    rating: '4.8',
    icon: Globe,
    iconClass: 'from-violet-500 to-indigo-500',
    installClass: 'bg-violet-50 text-violet-500 hover:bg-violet-100',
  },
  {
    id: 'form-helper',
    name: '表单填写助手',
    description: '自动识别表单并智能填写。',
    category: '网页自动化',
    tags: ['自动化', '表单', '效率'],
    users: '10.3万',
    rating: '4.7',
    icon: ClipboardCheck,
    iconClass: 'from-emerald-400 to-green-500',
    installClass: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
  },
  {
    id: 'weekly-report',
    name: '飞书周报',
    description: '整理本周工作并生成周报。',
    category: '效率办公',
    tags: ['办公', '报告', '自动化'],
    users: '8.7万',
    rating: '4.8',
    icon: Send,
    iconClass: 'from-blue-400 to-sky-500',
    installClass: 'bg-sky-50 text-sky-600 hover:bg-sky-100',
  },
  {
    id: 'price-compare',
    name: '电商比价',
    description: '跨平台检索同款与价格趋势。',
    category: '信息检索',
    tags: ['购物', '比价', '数据'],
    users: '12.1万',
    rating: '4.7',
    icon: ShoppingCart,
    iconClass: 'from-orange-400 to-rose-400',
    installClass: 'bg-rose-50 text-rose-500 hover:bg-rose-100',
  },
  {
    id: 'meeting-minutes',
    name: '会议纪要',
    description: '从录音与文本中提炼纪要。',
    category: '内容创作',
    tags: ['会议', 'AI', '办公'],
    users: '9.9万',
    rating: '4.8',
    icon: Mic,
    iconClass: 'from-violet-500 to-purple-500',
    installClass: 'bg-violet-50 text-violet-500 hover:bg-violet-100',
  },
  {
    id: 'recruit-extract',
    name: '招聘信息提取',
    description: '从岗位页面提取核心要求。',
    category: '信息检索',
    tags: ['招聘', '信息提取', '效率'],
    users: '7.2万',
    rating: '4.6',
    icon: Briefcase,
    iconClass: 'from-amber-400 to-orange-500',
    installClass: 'bg-orange-50 text-orange-500 hover:bg-orange-100',
  },
  {
    id: 'data-cleaner',
    name: '数据清洗助手',
    description: '规范表格字段并自动处理数据。',
    category: '数据处理',
    tags: ['数据', '清洗', '自动化'],
    users: '6.5万',
    rating: '4.7',
    icon: Database,
    iconClass: 'from-teal-400 to-cyan-500',
    installClass: 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100',
  },
]

const installedFallback = [
  { name: '网页总结', icon: FileText, iconClass: 'from-rose-400 to-orange-400', tag: '办公' },
  { name: '智能翻译', icon: Globe, iconClass: 'from-violet-500 to-indigo-500', tag: 'AI' },
  { name: '表单填写助手', icon: ClipboardCheck, iconClass: 'from-emerald-400 to-green-500', tag: '自动化' },
  { name: '会议纪要', icon: Mic, iconClass: 'from-sky-400 to-blue-500', tag: '办公' },
]

const recentUsed = [
  { name: '数据清洗助手', time: '今天 10:32', icon: Database, iconClass: 'from-teal-400 to-cyan-500' },
  { name: '电商比价', time: '今天 09:15', icon: ShoppingCart, iconClass: 'from-orange-400 to-amber-500' },
  { name: '招聘信息提取', time: '昨天 16:45', icon: Briefcase, iconClass: 'from-blue-400 to-sky-500' },
]

export function SkillsPage(): React.ReactElement {
  const [skills, setSkills] = useState<Skill[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('全部')
  const [installedIds, setInstalledIds] = useState<Set<string>>(new Set(['web-summary', 'smart-translate', 'form-helper', 'meeting-minutes']))

  const loadSkills = async () => {
    try {
      const data = await window.skillAPI?.getSkills()
      setSkills(data || [])
    } catch {
      setSkills([])
    }
  }

  useEffect(() => {
    loadSkills()
  }, [])

  const allSkills = useMemo(() => {
    const iconClasses = [
      'from-rose-400 to-orange-400',
      'from-violet-500 to-indigo-500',
      'from-emerald-400 to-green-500',
      'from-sky-400 to-blue-500',
      'from-amber-400 to-orange-500',
      'from-teal-400 to-cyan-500',
    ]

    const localSkills = skills
      .filter(skill => !marketplaceSkills.some(item => item.name === skill.name))
      .map((skill, index): SkillCardData => ({
        id: `local-${skill.id}`,
        name: skill.name,
        description: skill.description || '本地自动化技能，可在 AI 对话中快速调用。',
        category: skill.category || '开发工具',
        tags: [skill.category || '自动化', skill.enabled ? '已启用' : '未启用'],
        users: `${Math.max(skill.successCount || 0, 1)} 次`,
        rating: '4.8',
        icon: Puzzle,
        iconClass: iconClasses[index % iconClasses.length],
        installClass: skill.enabled ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
        sourceSkill: skill,
      }))

    return [...marketplaceSkills, ...localSkills]
  }, [skills])

  const filteredSkills = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return allSkills.filter(skill => {
      const matchCategory = activeCategory === '全部'
        || skill.category === activeCategory
        || (activeCategory === '热门' && Number.parseFloat(skill.rating) >= 4.8)
        || activeCategory === '最新'
      const matchQuery = !query
        || skill.name.toLowerCase().includes(query)
        || skill.description.toLowerCase().includes(query)
        || skill.tags.some(tag => tag.toLowerCase().includes(query))

      return matchCategory && matchQuery
    })
  }, [activeCategory, allSkills, searchQuery])

  const installedRows = useMemo(() => {
    if (skills.length > 0) {
      return skills.slice(0, 4).map((skill, index) => {
        const fallback = installedFallback[index % installedFallback.length]
        return {
          name: skill.name,
          icon: fallback.icon,
          iconClass: fallback.iconClass,
          tag: skill.category || fallback.tag,
        }
      })
    }

    return installedFallback
  }, [skills])

  const handleInstall = async (skill: SkillCardData) => {
    if (skill.sourceSkill) {
      try {
        await window.skillAPI?.updateSkill(skill.sourceSkill.id, { enabled: !skill.sourceSkill.enabled })
        await loadSkills()
      } catch {
        // 本地技能失败时不打断页面交互。
      }
      return
    }

    setInstalledIds(prev => {
      const next = new Set(prev)
      if (next.has(skill.id)) {
        next.delete(skill.id)
      } else {
        next.add(skill.id)
      }
      return next
    })
  }

  return (
    <div className="tare-skills-page absolute inset-0 overflow-y-auto bg-[#f8fbff] text-slate-900">
      <div className="mx-auto flex w-[calc(100%-80px)] max-w-[1518px] flex-col py-10 max-[900px]:w-[calc(100%-32px)] max-[900px]:py-6">
        <div className="grid grid-cols-1 gap-5 min-[1280px]:grid-cols-[minmax(0,1fr)_372px]">
          <main className="min-w-0">
            <header className="mb-5">
              <div className="mb-5 flex items-center gap-6">
                <div className="flex h-[84px] w-[84px] shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-rose-50 via-pink-50 to-violet-50 shadow-[0_14px_32px_rgba(244,114,182,0.16)]">
                  <Puzzle className="h-11 w-11 text-rose-400" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-[42px] font-bold leading-tight tracking-normal text-slate-950">Skills 市场</h1>
                  <p className="mt-2 text-[15px] text-slate-500">
                    发现、安装和运行自动化技能，在智能体对话中即可快速创建和管理
                  </p>
                </div>
              </div>

              <label className="mb-4 flex h-[50px] w-[720px] max-w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                <Search className="h-5 w-5 shrink-0 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="搜索技能、场景或关键词..."
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
                <span className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-xs text-slate-400">/</span>
              </label>

              <div className="flex flex-wrap gap-3">
                {categories.map(category => {
                  const active = category === activeCategory
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={`h-9 rounded-lg border px-5 text-sm font-medium transition-all ${
                        active
                          ? 'border-rose-100 bg-rose-50 text-rose-500 shadow-[0_8px_18px_rgba(244,63,94,0.08)]'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
                      }`}
                    >
                      {category === '热门' && <Flame className="mr-1.5 inline h-3.5 w-3.5 align-[-2px]" />}
                      {category === '最新' && <Clock className="mr-1.5 inline h-3.5 w-3.5 align-[-2px]" />}
                      {category}
                    </button>
                  )
                })}
              </div>
            </header>

            <section className="relative mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Sparkles className="h-5 w-5 text-rose-400" />
                  本周精选
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 min-[1080px]:grid-cols-3">
                {showcaseSkills.map(skill => (
                  <FeaturedSkillCard
                    key={skill.id}
                    skill={skill}
                    installed={installedIds.has(skill.id)}
                    onInstall={() => handleInstall(skill)}
                  />
                ))}
              </div>
              <button
                type="button"
                className="absolute right-[-18px] top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-500 shadow-[0_12px_26px_rgba(15,23,42,0.12)] transition-colors hover:bg-slate-50 min-[1280px]:flex"
                aria-label="查看更多精选技能"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-baseline gap-3">
                  <h2 className="text-lg font-bold text-slate-900">全部技能</h2>
                  <span className="text-sm text-slate-400">共 {filteredSkills.length + 118} 个技能</span>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 hover:bg-slate-50">
                    默认排序
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button type="button" className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet-100 bg-violet-50 text-violet-500">
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button type="button" className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 min-[1080px]:grid-cols-4">
                {filteredSkills.slice(0, 8).map(skill => (
                  <MarketSkillCard
                    key={skill.id}
                    skill={skill}
                    installed={skill.sourceSkill ? skill.sourceSkill.enabled : installedIds.has(skill.id)}
                    onInstall={() => handleInstall(skill)}
                  />
                ))}
              </div>
            </section>
          </main>

          <aside className="flex min-w-0 flex-col gap-4 pt-[112px] max-[1279px]:pt-0">
            <Panel title="我的已安装" action="查看全部">
              <div className="space-y-3">
                {installedRows.map(({ name, icon: Icon, iconClass, tag }) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${iconClass} text-white shadow-[0_8px_18px_rgba(15,23,42,0.12)]`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">{name}</span>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-500">{tag}</span>
                    <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600">已启用</span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="最近使用" action="清空">
              <div className="space-y-3">
                {recentUsed.map(({ name, time, icon: Icon, iconClass }) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${iconClass} text-white`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">{name}</span>
                    <span className="text-sm text-slate-400">{time}</span>
                  </div>
                ))}
              </div>
            </Panel>

            <section className="relative overflow-hidden rounded-lg border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-pink-50 p-5 shadow-[0_12px_30px_rgba(124,58,237,0.08)]">
              <div className="relative z-10 max-w-[190px]">
                <h2 className="text-lg font-bold text-slate-900">创作并分享你的技能</h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  将你的自动化能力发布到 Skills 市场，帮助更多人提升效率。
                </p>
                <button
                  type="button"
                  className="mt-4 flex h-10 items-center gap-2 rounded-lg bg-violet-100 px-4 text-sm font-semibold text-violet-600 hover:bg-violet-200"
                >
                  <Plus className="h-4 w-4" />
                  创建技能
                </button>
              </div>
              <div className="absolute bottom-6 right-6 flex h-[88px] w-[88px] items-center justify-center rounded-lg bg-gradient-to-br from-rose-100 via-violet-100 to-blue-100 shadow-[0_16px_28px_rgba(124,58,237,0.18)]">
                <Puzzle className="h-14 w-14 text-violet-400" />
              </div>
              <Sparkles className="absolute right-8 top-5 h-5 w-5 text-violet-300" />
              <Plus className="absolute bottom-20 right-24 h-5 w-5 text-pink-300" />
            </section>

            <button
              type="button"
              className="flex h-14 items-center justify-between rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.04)] hover:bg-slate-50"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <Code className="h-4 w-4" />
                </span>
                开发者文档
              </span>
              <ExternalLink className="h-4 w-4 text-slate-400" />
            </button>
          </aside>
        </div>
      </div>
    </div>
  )
}

function SkillArtwork({
  skill,
  size,
}: {
  skill: SkillCardData
  size: 'large' | 'small'
}): React.ReactElement {
  const Icon = skill.icon
  const large = size === 'large'

  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br ${skill.iconClass} text-white shadow-[0_12px_22px_rgba(15,23,42,0.14)] ${
        large ? 'h-20 w-20' : 'h-14 w-14'
      }`}
    >
      <span className="absolute inset-0 bg-white/10" />
      <span className={`absolute rounded-full bg-white/24 ${large ? '-left-5 -top-4 h-14 w-14' : '-left-4 -top-3 h-10 w-10'}`} />
      <span className={`absolute rounded-full bg-white/18 ${large ? '-bottom-7 -right-6 h-16 w-16' : '-bottom-5 -right-4 h-11 w-11'}`} />
      <Icon className={`relative z-10 drop-shadow-sm ${large ? 'h-10 w-10' : 'h-7 w-7'}`} />
      {large && <Sparkles className="absolute right-3 top-3 z-10 h-4 w-4 text-white/70" />}
    </span>
  )
}

function FeaturedSkillCard({
  skill,
  installed,
  onInstall,
}: {
  skill: SkillCardData
  installed: boolean
  onInstall: () => void
}): React.ReactElement {
  return (
    <article className={`flex min-h-[160px] flex-col justify-between overflow-hidden rounded-lg border border-slate-100 bg-gradient-to-br ${skill.featuredClass || 'from-white to-slate-50'} p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)]`}>
      <div className="flex items-start gap-4">
        <SkillArtwork skill={skill} size="large" />
        <div className="min-w-0 flex-1 pt-1">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="truncate text-base font-bold text-slate-900">{skill.name}</h3>
            {skill.badge && (
              <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${skill.badgeClass}`}>
                {skill.badge === '官方' ? <ShieldCheck className="h-3 w-3" /> : <Flame className="h-3 w-3" />}
                {skill.badge}
              </span>
            )}
          </div>
          <p className="line-clamp-2 text-sm leading-6 text-slate-500">{skill.description}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <Stats users={skill.users} rating={skill.rating} />
        <button
          type="button"
          onClick={onInstall}
          className={`h-9 rounded-lg px-5 text-sm font-semibold transition-colors ${skill.installClass}`}
        >
          {installed ? '已安装' : '安装'}
        </button>
      </div>
    </article>
  )
}

function MarketSkillCard({
  skill,
  installed,
  onInstall,
}: {
  skill: SkillCardData
  installed: boolean
  onInstall: () => void
}): React.ReactElement {
  return (
    <article className="flex min-h-[162px] flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.035)] transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_34px_rgba(15,23,42,0.07)]">
      <div className="mb-3 flex items-start gap-4">
        <SkillArtwork skill={skill} size="small" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-slate-900">{skill.name}</h3>
          <p className="mt-2 line-clamp-2 min-h-[38px] text-sm leading-5 text-slate-500">{skill.description}</p>
        </div>
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {skill.tags.slice(0, 3).map(tag => (
          <span key={tag} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-500">{tag}</span>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-between">
        <Stats users={skill.users} rating={skill.rating} />
        <button
          type="button"
          onClick={onInstall}
          className={`h-8 rounded-lg px-4 text-xs font-semibold transition-colors ${installed ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : skill.installClass}`}
        >
          {installed ? '已安装' : '安装'}
        </button>
      </div>
    </article>
  )
}

function Stats({ users, rating }: { users: string; rating: string }): React.ReactElement {
  return (
    <div className="flex items-center gap-4 text-xs text-slate-400">
      <span className="flex items-center gap-1">
        <Users className="h-3.5 w-3.5" />
        {users}
      </span>
      <span className="flex items-center gap-1">
        <Star className="h-3.5 w-3.5 text-amber-400" />
        {rating}
      </span>
    </div>
  )
}

function Panel({
  title,
  action,
  children,
}: {
  title: string
  action: string
  children: React.ReactNode
}): React.ReactElement {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <button type="button" className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600">
          {action}
          {action !== '清空' && <ChevronRight className="h-4 w-4" />}
        </button>
      </div>
      {children}
    </section>
  )
}
