import { Database } from 'sql.js'

/**
 * 创建所有数据表
 */
export function createTables(db: Database): void {
  db.exec(`
    -- 浏览历史
    CREATE TABLE IF NOT EXISTS history (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      url           TEXT NOT NULL,
      title         TEXT DEFAULT '',
      visit_count   INTEGER DEFAULT 1,
      last_visited  TEXT NOT NULL,
      created_at    TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_history_url ON history(url);
    CREATE INDEX IF NOT EXISTS idx_history_visited ON history(last_visited);

    -- 书签
    CREATE TABLE IF NOT EXISTS bookmarks (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      title         TEXT NOT NULL,
      url           TEXT DEFAULT '',
      parent_id     INTEGER DEFAULT 0,
      is_folder     INTEGER DEFAULT 0,
      sort_order    INTEGER DEFAULT 0,
      created_at    TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_bookmarks_parent ON bookmarks(parent_id);

    -- 下载记录
    CREATE TABLE IF NOT EXISTS downloads (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      url           TEXT NOT NULL,
      filename      TEXT NOT NULL,
      save_path     TEXT NOT NULL,
      total_bytes   INTEGER DEFAULT 0,
      received_bytes INTEGER DEFAULT 0,
      status        TEXT DEFAULT 'downloading',
      created_at    TEXT NOT NULL,
      completed_at  TEXT
    );

    -- 用户偏好设置
    CREATE TABLE IF NOT EXISTS preferences (
      key           TEXT PRIMARY KEY,
      value         TEXT NOT NULL,
      updated_at    TEXT NOT NULL
    );

    -- 操作历史（AI观察记录）
    CREATE TABLE IF NOT EXISTS operation_history (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id    TEXT NOT NULL,
      operation_type TEXT NOT NULL,
      url           TEXT,
      selector      TEXT,
      input_data    TEXT,
      result        TEXT,
      timestamp     TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_op_history_session ON operation_history(session_id);

    -- AI累积知识
    CREATE TABLE IF NOT EXISTS knowledge (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      category      TEXT NOT NULL,
      title         TEXT NOT NULL,
      content       TEXT NOT NULL,
      source_url    TEXT,
      confidence    REAL DEFAULT 0.8,
      usage_count   INTEGER DEFAULT 0,
      created_at    TEXT NOT NULL,
      last_used     TEXT
    );

    -- 技能存储
    CREATE TABLE IF NOT EXISTS skills (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      description   TEXT,
      category      TEXT DEFAULT 'general',
      triggers      TEXT NOT NULL DEFAULT '[]',
      steps         TEXT NOT NULL DEFAULT '[]',
      parameters    TEXT DEFAULT '[]',
      auto_learned  INTEGER DEFAULT 0,
      enabled       INTEGER DEFAULT 1,
      success_count INTEGER DEFAULT 0,
      fail_count    INTEGER DEFAULT 0,
      created_at    TEXT NOT NULL,
      updated_at    TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
    CREATE INDEX IF NOT EXISTS idx_skills_enabled ON skills(enabled);

    -- 对话历史
    CREATE TABLE IF NOT EXISTS conversations (
      id            TEXT PRIMARY KEY,
      tab_id        TEXT,
      messages      TEXT NOT NULL DEFAULT '[]',
      context_url   TEXT,
      created_at    TEXT NOT NULL,
      updated_at    TEXT NOT NULL
    );
  `)

  // 插入默认偏好设置
  const now = new Date().toISOString()
  const defaults: [string, string][] = [
    ['searchEngine', 'https://www.google.com/search?q='],
    ['homePage', 'about:blank'],
    ['theme', 'dark'],
    ['openaiApiKey', 'sk-63bb71e289d04af4ac171d53568bed57'],
    ['openaiBaseUrl', 'https://api.deepseek.com/v1'],
    ['model', 'deepseek-chat']
  ]

  for (const [key, value] of defaults) {
    db.run(
      `INSERT OR IGNORE INTO preferences (key, value, updated_at) VALUES (?, ?, ?)`,
      [key, value, now]
    )
  }

  console.log('[DB] 数据表初始化完成 (8张表)')
}
