import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function resolveDatabasePath(filename = process.env.DATABASE_PATH) {
  return filename ? path.resolve(__dirname, filename) : path.join(__dirname, 'data', 'main.db')
}
export function initializeDatabase(db) {
  db.pragma('foreign_keys = ON')
  db.pragma('journal_mode = WAL')

  db.exec(`
    CREATE TABLE IF NOT EXISTS content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK (type IN ('article', 'tutorial')),
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      author TEXT,
      cover_image TEXT,
      tags TEXT,
      status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
      read_time TEXT,
      duration TEXT,
      language TEXT,
      level TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_id INTEGER NOT NULL,
      content_slug TEXT,
      content_type TEXT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      body TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      created_at TEXT NOT NULL,
      FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS admin_sessions (
      sid TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      expires_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS content_public_idx
      ON content(type, status, created_at DESC);
    CREATE INDEX IF NOT EXISTS comments_content_idx
      ON comments(content_id, status, created_at DESC);
    CREATE INDEX IF NOT EXISTS admin_sessions_expiry_idx
      ON admin_sessions(expires_at);
  `)
}

export function openDatabase(filename) {
  const databasePath = resolveDatabasePath(filename)
  fs.mkdirSync(path.dirname(databasePath), { recursive: true })
  const db = new Database(databasePath)
  initializeDatabase(db)
  return db
}
