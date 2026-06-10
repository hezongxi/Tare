import React, { useState, useEffect, useMemo } from 'react'
import {
  User, Shield, Key, Palette, Cpu, Zap, Monitor, Keyboard,
  Search as SearchIcon, Globe, Home, Languages, Download,
  Eye, Settings as SettingsIcon, AlertTriangle, Puzzle, Info,
  ChevronRight, ExternalLink, Save, Check
} from 'lucide-react'
import { AppIcon } from '../common/AppIcon'

// 导航菜单项
interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<any>
}

const NAV_ITEMS: NavItem[] = [
  { id: 'account', label: '账号', icon: User },
  { id: 'autofill', label: '自动填充和密码', icon: Key },
  { id: 'privacy', label: '隐私与安全', icon: Shield },
  { id: 'ai', label: 'AI 相关功能', icon: Cpu },
  { id: 'personalization', label: '个性化', icon: Palette },
  { id: 'performance', label: '性能', icon: Zap },
  { id: 'appearance', label: '外观', icon: Monitor },
  { id: 'shortcuts', label: '操作与快捷键', icon: Keyboard },
  { id: 'search', label: '搜索引擎', icon: SearchIcon },
  { id: 'default-browser', label: '默认浏览器', icon: Globe },
  { id: 'homepage', label: '起始页', icon: Home },
  { id: 'language', label: '语言', icon: Languages },
  { id: 'downloads', label: '下载内容', icon: Download },
  { id: 'accessibility', label: '无障碍', icon: Eye },
  { id: 'system', label: '系统', icon: SettingsIcon },
  { id: 'important', label: '重要设置', icon: AlertTriangle },
  { id: 'extensions', label: '扩展程序', icon: Puzzle },
  { id: 'about', label: '关于 Tare', icon: Info },
]

interface Prefs {
  searchEngine: string
  homePage: string
  theme: string
  openaiApiKey: string
  openaiBaseUrl: string
  model: string
}

const DEFAULT_PREFS: Prefs = {
  searchEngine: 'https://www.baidu.com/s?wd=',
  homePage: 'about:blank',
  theme: 'light',
  openaiApiKey: '',
  openaiBaseUrl: 'https://api.deepseek.com/v1',
  model: 'deepseek-v4-pro',
}

const SEARCH_ENGINES = [
  { label: 'Baidu', value: 'https://www.baidu.com/s?wd=' },
  { label: 'Google', value: 'https://www.google.com/search?q=' },
  { label: 'Bing', value: 'https://www.bing.com/search?q=' },
  { label: 'DuckDuckGo', value: 'https://duckduckgo.com/?q=' },
]

const MODELS = [
  { label: 'DeepSeek V4 Pro', value: 'deepseek-v4-pro' },
  { label: 'GPT-4o', value: 'gpt-4o' },
  { label: 'GPT-4o Mini', value: 'gpt-4o-mini' },
  { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
  { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
  { label: 'DeepSeek Reasoner', value: 'deepseek-reasoner' },
]

export function SettingsPage(): React.ReactElement {
  const [activeNav, setActiveNav] = useState('account')
  const [searchQuery, setSearchQuery] = useState('')
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    window.dataAPI?.getPreferences().then((data) => {
      if (data) setPrefs(prev => ({ ...prev, ...data }))
    })
  }, [])

  const handleSave = async () => {
    for (const [key, value] of Object.entries(prefs)) {
      await window.dataAPI?.setPreference(key, value)
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const updateField = (key: keyof Prefs, value: string) => {
    setPrefs(prev => ({ ...prev, [key]: value }))
  }

  // 过滤导航菜单
  const filteredNav = useMemo(() => {
    if (!searchQuery) return NAV_ITEMS
    const q = searchQuery.toLowerCase()
    return NAV_ITEMS.filter(item => item.label.toLowerCase().includes(q))
  }, [searchQuery])

  return (
    <div className="absolute inset-0 bg-gray-50 flex flex-col overflow-hidden">
      {/* 顶部区域 */}
      <div className="bg-white border-b border-gray-200 px-8 pt-8 pb-5 shrink-0">
        <h1 className="text-2xl font-semibold text-gray-900 mb-5">设置</h1>
        <div className="max-w-2xl">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索设置"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm text-gray-800 bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* 主体区域：左导航 + 右内容 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧导航 */}
        <div className="w-60 shrink-0 bg-white border-r border-gray-200 overflow-y-auto py-2">
          {filteredNav.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                activeNav === item.id
                  ? 'bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
              {item.id === 'extensions' && <ExternalLink className="w-3 h-3 ml-auto text-gray-400" />}
            </button>
          ))}
        </div>

        {/* 右侧内容区 */}
        <div className="flex-1 overflow-y-auto px-10 py-8">
          <div className="max-w-2xl">
            {renderContent(activeNav, prefs, updateField, handleSave, saved)}
          </div>
        </div>
      </div>
    </div>
  )
}

function renderContent(
  nav: string,
  prefs: Prefs,
  updateField: (key: keyof Prefs, value: string) => void,
  handleSave: () => void,
  saved: boolean
): React.ReactNode {
  switch (nav) {
    case 'account':
      return <AccountSection />
    case 'ai':
      return <AISection prefs={prefs} updateField={updateField} handleSave={handleSave} saved={saved} />
    case 'search':
      return <SearchSection prefs={prefs} updateField={updateField} handleSave={handleSave} saved={saved} />
    case 'appearance':
      return <AppearanceSection prefs={prefs} updateField={updateField} handleSave={handleSave} saved={saved} />
    case 'autofill':
      return <PlaceholderSection title="自动填充和密码" desc="管理密码、付款方式、地址等信息" />
    case 'privacy':
      return <PlaceholderSection title="隐私与安全" desc="管理 Cookie、网站权限、浏览数据清除等" />
    case 'personalization':
      return <PlaceholderSection title="个性化" desc="自定义浏览器外观、主题和布局" />
    case 'performance':
      return <PlaceholderSection title="性能" desc="内存节省、节能模式、预加载设置" />
    case 'shortcuts':
      return <PlaceholderSection title="操作与快捷键" desc="管理浏览器快捷键和操作手势" />
    case 'default-browser':
      return <PlaceholderSection title="默认浏览器" desc="将 Tare 设为默认浏览器" />
    case 'homepage':
      return <PlaceholderSection title="起始页" desc="设置浏览器启动时打开的页面" />
    case 'language':
      return <PlaceholderSection title="语言" desc="管理浏览器显示语言和翻译设置" />
    case 'downloads':
      return <PlaceholderSection title="下载内容" desc="设置下载位置和管理下载行为" />
    case 'accessibility':
      return <PlaceholderSection title="无障碍" desc="辅助功能、缩放、字幕等设置" />
    case 'system':
      return <PlaceholderSection title="系统" desc="后台运行、硬件加速、启动设置" />
    case 'important':
      return <PlaceholderSection title="重要设置" desc="需要注意的重要浏览器设置" />
    case 'extensions':
      return <PlaceholderSection title="扩展程序" desc="管理已安装的浏览器扩展" />
    case 'about':
      return <AboutSection />
    default:
      return <PlaceholderSection title={nav} desc="" />
  }
}

// ===== 账号区块 =====
function AccountSection(): React.ReactElement {
  return (
    <div className="space-y-6">
      {/* 用户信息卡片 */}
      <SettingsCard>
        <div className="flex items-center gap-4 p-1 cursor-pointer group">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow-md shrink-0">
            <User className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-medium text-gray-800">未命名</p>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">Tare ID: c4ae5262-6dec-4646-b6f5-b321dad25625</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
        </div>
      </SettingsCard>

      {/* 数据管理 */}
      <SectionTitle>数据管理</SectionTitle>
      <SettingsCard>
        <SettingsRow label="导入浏览器数据" />
      </SettingsCard>

      {/* 账号与安全 */}
      <SectionTitle>账号与安全</SectionTitle>
      <SettingsCard>
        <SettingsRow label="账号设置" />
        <SettingsRow label="退出登录" danger />
      </SettingsCard>

      {/* 订阅信息 */}
      <SectionTitle>你的订阅</SectionTitle>
      <SettingsCard>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">当前计划</p>
              <p className="text-xs text-gray-400 mt-0.5">Free</p>
            </div>
            <button className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs font-medium rounded-full hover:shadow-md transition-all">
              升级计划
            </button>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-700">本周剩余用量</p>
              <span className="text-sm font-medium text-gray-800">100.00%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full" style={{ width: '100%' }} />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400">查看消耗明细</span>
              <span className="text-xs text-gray-400">27.03 小时后重置</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div>
              <p className="text-sm text-gray-700">用量重赏券</p>
              <p className="text-xs text-gray-400 mt-0.5">使用后立即重置当前周期用量</p>
            </div>
            <button className="px-3 py-1 text-xs text-orange-600 bg-orange-50 rounded-full hover:bg-orange-100 transition-colors">
              查看
            </button>
          </div>
        </div>
      </SettingsCard>
    </div>
  )
}

// ===== AI 配置区块 =====
function AISection({ prefs, updateField, handleSave, saved }: {
  prefs: Prefs
  updateField: (key: keyof Prefs, value: string) => void
  handleSave: () => void
  saved: boolean
}): React.ReactElement {
  return (
    <div className="space-y-6">
      <SectionTitle>AI 模型配置</SectionTitle>
      <SettingsCard>
        <div className="space-y-5">
          <FieldGroup label="API Base URL">
            <input
              type="text"
              value={prefs.openaiBaseUrl}
              onChange={(e) => updateField('openaiBaseUrl', e.target.value)}
              className="settings-input"
              placeholder="https://api.deepseek.com/v1"
            />
          </FieldGroup>
          <FieldGroup label="API Key">
            <input
              type="password"
              value={prefs.openaiApiKey}
              onChange={(e) => updateField('openaiApiKey', e.target.value)}
              className="settings-input"
              placeholder="sk-..."
            />
          </FieldGroup>
          <FieldGroup label="模型">
            <select
              value={prefs.model}
              onChange={(e) => updateField('model', e.target.value)}
              className="settings-select"
            >
              {MODELS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </FieldGroup>
        </div>
      </SettingsCard>
      <SaveButton onClick={handleSave} saved={saved} />
    </div>
  )
}

// ===== 搜索引擎区块 =====
function SearchSection({ prefs, updateField, handleSave, saved }: {
  prefs: Prefs
  updateField: (key: keyof Prefs, value: string) => void
  handleSave: () => void
  saved: boolean
}): React.ReactElement {
  return (
    <div className="space-y-6">
      <SectionTitle>搜索引擎</SectionTitle>
      <SettingsCard>
        <FieldGroup label="默认搜索引擎">
          <select
            value={prefs.searchEngine}
            onChange={(e) => updateField('searchEngine', e.target.value)}
            className="settings-select"
          >
            {SEARCH_ENGINES.map(e => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
        </FieldGroup>
      </SettingsCard>
      <SaveButton onClick={handleSave} saved={saved} />
    </div>
  )
}

// ===== 外观区块 =====
function AppearanceSection({ prefs, updateField, handleSave, saved }: {
  prefs: Prefs
  updateField: (key: keyof Prefs, value: string) => void
  handleSave: () => void
  saved: boolean
}): React.ReactElement {
  return (
    <div className="space-y-6">
      <SectionTitle>主题</SectionTitle>
      <SettingsCard>
        <FieldGroup label="外观模式">
          <select
            value={prefs.theme}
            onChange={(e) => updateField('theme', e.target.value)}
            className="settings-select"
          >
            <option value="light">浅色</option>
            <option value="dark">深色</option>
            <option value="system">跟随系统</option>
          </select>
        </FieldGroup>
      </SettingsCard>
      <SaveButton onClick={handleSave} saved={saved} />
    </div>
  )
}

// ===== 关于区块 =====
function AboutSection(): React.ReactElement {
  return (
    <div className="space-y-6">
      <SectionTitle>关于 Tare</SectionTitle>
      <SettingsCard>
        <div className="text-center py-6">
          <AppIcon className="w-16 h-16 mx-auto mb-4 drop-shadow-md" />
          <h2 className="text-lg font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
            Tare
          </h2>
          <p className="text-xs text-gray-400 mt-2">版本 1.0.0</p>
          <p className="text-xs text-gray-400 mt-1">基于 Electron + React 构建</p>
        </div>
      </SettingsCard>
    </div>
  )
}

// ===== 占位区块 =====
function PlaceholderSection({ title, desc }: { title: string; desc: string }): React.ReactElement {
  return (
    <div className="space-y-6">
      <SectionTitle>{title}</SectionTitle>
      <SettingsCard>
        <div className="text-center py-10 text-gray-400">
          <SettingsIcon className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">{desc || '此设置页面正在开发中'}</p>
        </div>
      </SettingsCard>
    </div>
  )
}

// ===== 通用子组件 =====

function SettingsCard({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }): React.ReactElement {
  return <h2 className="text-sm font-semibold text-gray-500 tracking-wide">{children}</h2>
}

function SettingsRow({ label, danger }: { label: string; danger?: boolean }): React.ReactElement {
  return (
    <button className={`w-full flex items-center justify-between py-3 border-b border-gray-50 last:border-0 group transition-colors ${danger ? 'text-red-500 hover:bg-red-50 -mx-5 px-5' : 'text-gray-700 hover:bg-gray-50 -mx-5 px-5'}`}>
      <span className="text-sm">{label}</span>
      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
    </button>
  )
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }): React.ReactElement {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1.5 block">{label}</label>
      {children}
    </div>
  )
}

function SaveButton({ onClick, saved }: { onClick: () => void; saved: boolean }): React.ReactElement {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
    >
      {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
      {saved ? '已保存!' : '保存设置'}
    </button>
  )
}
