import initSqlJs, { Database } from 'sql.js'
import { app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { createTables } from './schema'

let db: Database | null = null
let dbPath: string = ''

/**
 * 初始化数据库连接
 * 在 app.whenReady() 之后调用
 */
export async function initDatabase(): Promise<Database> {
  const userDataPath = app.getPath('userData')
  dbPath = path.join(userDataPath, 'tare.db')

  // 确保目录存在
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true })
  }

  const SQL = await initSqlJs({
    locateFile: (file: string) => {
      // 生产模式: 从 extraResources 加载
      const prodPath = path.join(process.resourcesPath || '', file)
      if (fs.existsSync(prodPath)) {
        return prodPath
      }
      // 开发模式: 从 node_modules 加载
      const devPath = path.join(__dirname, '../../node_modules/sql.js/dist', file)
      return devPath
    }
  })

  // 如果数据库文件已存在，从文件加载
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath)
    db = new SQL.Database(fileBuffer)
    console.log('[DB] 已加载现有数据库:', dbPath)
  } else {
    db = new SQL.Database()
    console.log('[DB] 创建新数据库')
  }

  // 创建表（如果不存在）
  createTables(db)

  // 保存到磁盘
  saveDatabase()

  return db
}

/**
 * 获取数据库实例
 */
export function getDatabase(): Database {
  if (!db) {
    throw new Error('数据库尚未初始化，请先调用 initDatabase()')
  }
  return db
}

/**
 * 将数据库保存到磁盘
 */
export function saveDatabase(): void {
  if (!db || !dbPath) return
  try {
    const data = db.export()
    const buffer = Buffer.from(data)
    fs.writeFileSync(dbPath, buffer)
  } catch (err) {
    console.error('[DB] 保存数据库失败:', err)
  }
}

/**
 * 关闭数据库连接
 */
export function closeDatabase(): void {
  if (db) {
    saveDatabase()
    db.close()
    db = null
    console.log('[DB] 数据库已关闭')
  }
}
