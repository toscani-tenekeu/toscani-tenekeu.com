import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { openDatabase } from '../database.js'

test('initializes the content, comments and session schema', (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'toscani-devhub-'))
  const databasePath = path.join(directory, 'test.db')
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }))

  const db = openDatabase(databasePath)
  t.after(() => db.close())

  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
    .all()
    .map((row) => row.name)

  assert.ok(tables.includes('content'))
  assert.ok(tables.includes('comments'))
  assert.ok(tables.includes('admin_sessions'))
})
test('removes comments when their content is deleted', (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'toscani-devhub-'))
  const databasePath = path.join(directory, 'test.db')
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }))

  const db = openDatabase(databasePath)
  t.after(() => db.close())

  const timestamp = new Date().toISOString()
  const content = db
    .prepare(`
      INSERT INTO content
        (type, slug, title, excerpt, content, status, created_at, updated_at)
      VALUES ('article', 'test', 'Test', 'Excerpt', 'Body', 'published', ?, ?)
    `)
    .run(timestamp, timestamp)

  db.prepare(`
    INSERT INTO comments
      (content_id, content_slug, content_type, name, email, body, status, created_at)
    VALUES (?, 'test', 'article', 'Reader', 'reader@example.com', 'Comment', 'pending', ?)
  `).run(content.lastInsertRowid, timestamp)

  db.prepare('DELETE FROM content WHERE id = ?').run(content.lastInsertRowid)
  const remaining = db.prepare('SELECT COUNT(*) AS count FROM comments').get()

  assert.equal(remaining.count, 0)
})
