import { config as loadEnv } from 'dotenv'
import express from 'express'
import session from 'express-session'
import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { openDatabase } from './database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
loadEnv({ path: path.join(__dirname, '.env'), quiet: true })

const isProduction = process.env.NODE_ENV === 'production'
const PORT = Number.parseInt(process.env.APP_PORT ?? '3001', 10)
const HOST = process.env.APP_HOST ?? '127.0.0.1'
const SESSION_SECRET = process.env.SESSION_SECRET
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const uploadsDir = path.resolve(__dirname, process.env.UPLOADS_DIR ?? './data/uploads')
const distDir = path.resolve(__dirname, '../client/dist')

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error('APP_PORT must be an integer between 1 and 65535.')
}
if (!SESSION_SECRET || SESSION_SECRET.length < 32) {
  throw new Error('SESSION_SECRET must contain at least 32 characters.')
}
if (isProduction && (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12)) {
  throw new Error('ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters are required in production.')
}
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.warn('[devhub] ADMIN_EMAIL / ADMIN_PASSWORD are missing; admin login is disabled.')
}

fs.mkdirSync(uploadsDir, { recursive: true })

const app = express()
const db = openDatabase()

class SQLiteSessionStore extends session.Store {
  constructor(database) {
    super()
    this.read = database.prepare('SELECT data, expires_at FROM admin_sessions WHERE sid = ?')
    this.write = database.prepare(`
      INSERT INTO admin_sessions (sid, data, expires_at)
      VALUES (?, ?, ?)
      ON CONFLICT(sid) DO UPDATE SET data = excluded.data, expires_at = excluded.expires_at
    `)
    this.remove = database.prepare('DELETE FROM admin_sessions WHERE sid = ?')
    this.removeExpired = database.prepare('DELETE FROM admin_sessions WHERE expires_at <= ?')
    this.pruneTimer = setInterval(() => this.removeExpired.run(Date.now()), 30 * 60 * 1000)
    this.pruneTimer.unref()
    this.removeExpired.run(Date.now())
  }

  get(sid, callback) {
    try {
      const row = this.read.get(sid)
      if (!row || row.expires_at <= Date.now()) {
        if (row) this.remove.run(sid)
        return callback(null, null)
      }
      return callback(null, JSON.parse(row.data))
    } catch (error) {
      return callback(error)
    }
  }

  set(sid, value, callback = () => {}) {
    try {
      const expiresAt = value.cookie?.expires
        ? new Date(value.cookie.expires).getTime()
        : Date.now() + 12 * 60 * 60 * 1000
      this.write.run(sid, JSON.stringify(value), expiresAt)
      callback(null)
    } catch (error) {
      callback(error)
    }
  }

  destroy(sid, callback = () => {}) {
    try {
      this.remove.run(sid)
      callback(null)
    } catch (error) {
      callback(error)
    }
  }

  touch(sid, value, callback = () => {}) {
    this.set(sid, value, callback)
  }

  close() {
    clearInterval(this.pruneTimer)
  }
}

const sessionStore = new SQLiteSessionStore(db)

if (isProduction) app.set('trust proxy', 1)
app.disable('x-powered-by')
app.use((_req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), geolocation=(), microphone=()',
  })
  next()
})
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))
app.use(
  session({
    name: 'toscani.devhub.sid',
    store: sessionStore,
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      maxAge: 12 * 60 * 60 * 1000,
    },
  }),
)
app.use('/uploads', express.static(uploadsDir, { maxAge: '7d', fallthrough: true }))

const imageExtensions = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif'],
])

const rawImage = express.raw({ type: [...imageExtensions.keys()], limit: '4mb' })

function hasValidImageSignature(buffer, mimeType) {
  if (!Buffer.isBuffer(buffer)) return false
  if (mimeType === 'image/jpeg') {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
  }
  if (mimeType === 'image/png') {
    const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    return buffer.length >= signature.length && buffer.subarray(0, signature.length).equals(signature)
  }
  if (mimeType === 'image/gif') {
    const signature = buffer.subarray(0, 6).toString('ascii')
    return signature === 'GIF87a' || signature === 'GIF89a'
  }
  if (mimeType === 'image/webp') {
    return buffer.length >= 12
      && buffer.subarray(0, 4).toString('ascii') === 'RIFF'
      && buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  }
  return false
}

function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function now() {
  return new Date().toISOString()
}

function parseTags(value) {
  const values = Array.isArray(value) ? value : String(value ?? '').split(',')
  return [...new Set(values.map((tag) => String(tag).trim()).filter(Boolean))]
    .slice(0, 20)
    .map((tag) => tag.slice(0, 40))
}

function parseJsonArray(value) {
  try {
    const parsed = JSON.parse(value || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function isAdmin(req) {
  return Boolean(req.session?.admin?.authenticated)
}

function requireAdmin(req, res, next) {
  if (!isAdmin(req)) return res.status(401).json({ message: 'Unauthorized' })
  return next()
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left ?? ''))
  const rightBuffer = Buffer.from(String(right ?? ''))
  if (leftBuffer.length !== rightBuffer.length) {
    crypto.timingSafeEqual(leftBuffer, leftBuffer)
    return false
  }
  return crypto.timingSafeEqual(leftBuffer, rightBuffer)
}

function sanitizeMarkdown(markdown) {
  const rendered = marked.parse(String(markdown ?? ''), { async: false })
  return sanitizeHtml(rendered, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'pre', 'code', 'del',
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title'],
      code: ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: (_tagName, attributes) => ({
        tagName: 'a',
        attribs: {
          ...attributes,
          rel: 'noopener noreferrer',
        },
      }),
    },
  })
}

function rowToContent(row) {
  if (!row) return null
  return {
    id: row.id,
    type: row.type,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || '',
    content: row.content || '',
    author: row.author || 'Toscani Tenekeu',
    coverImage: row.cover_image || null,
    tags: parseJsonArray(row.tags),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    readTime: row.read_time || null,
    duration: row.duration || null,
    language: row.language || null,
    level: row.level || null,
  }
}

function rowToAdminComment(row) {
  return {
    id: row.id,
    contentId: row.content_id,
    contentSlug: row.content_slug,
    contentType: row.content_type,
    name: row.name,
    email: row.email,
    body: row.body,
    status: row.status,
    createdAt: row.created_at,
  }
}

function rowToPublicComment(row) {
  const comment = rowToAdminComment(row)
  delete comment.email
  return comment
}

function removeManagedUpload(url) {
  if (!url || !url.startsWith('/uploads/')) return
  const filename = path.basename(url)
  if (url !== `/uploads/${filename}`) return
  try {
    fs.unlinkSync(path.join(uploadsDir, filename))
  } catch (error) {
    if (error.code !== 'ENOENT') console.error('[devhub] Could not remove upload:', error)
  }
}

function normalizeCoverImage(value) {
  const coverImage = String(value ?? '').trim()
  if (!coverImage) return null
  if (coverImage.length > 2_048) throw new Error('Cover image URL is too long')

  if (coverImage.startsWith('/uploads/')) {
    const filename = path.basename(coverImage)
    if (coverImage !== `/uploads/${filename}`) throw new Error('Invalid cover image URL')
    return coverImage
  }

  try {
    const parsed = new URL(coverImage)
    if (parsed.protocol !== 'https:') throw new Error('Invalid protocol')
    return parsed.toString()
  } catch {
    throw new Error('Invalid cover image URL')
  }
}

const loginAttempts = new Map()
const commentRequests = new Map()
const LOGIN_WINDOW_MS = 15 * 60 * 1000
const COMMENT_WINDOW_MS = 60 * 60 * 1000

function getWindow(map, key, windowMs) {
  const current = map.get(key)
  if (!current || Date.now() - current.startedAt >= windowMs) {
    const fresh = { count: 0, startedAt: Date.now() }
    map.set(key, fresh)
    return fresh
  }
  return current
}

function limitAdminLogin(req, res, next) {
  const attempt = getWindow(loginAttempts, req.ip, LOGIN_WINDOW_MS)
  if (attempt.count >= 5) {
    res.set('Retry-After', String(Math.ceil((LOGIN_WINDOW_MS - (Date.now() - attempt.startedAt)) / 1000)))
    return res.status(429).json({ message: 'Too many login attempts. Try again later.' })
  }
  return next()
}

function limitComments(req, res, next) {
  const current = getWindow(commentRequests, req.ip, COMMENT_WINDOW_MS)
  if (current.count >= 10) {
    return res.status(429).json({ message: 'Too many comments. Try again later.' })
  }
  current.count += 1
  return next()
}

const rateLimitPruneTimer = setInterval(() => {
  const cutoff = Date.now() - Math.max(LOGIN_WINDOW_MS, COMMENT_WINDOW_MS)
  for (const [key, value] of loginAttempts) if (value.startedAt < cutoff) loginAttempts.delete(key)
  for (const [key, value] of commentRequests) if (value.startedAt < cutoff) commentRequests.delete(key)
}, 30 * 60 * 1000)
rateLimitPruneTimer.unref()

function validateContentInput(body) {
  const type = body.type
  const title = String(body.title ?? '').trim()
  const slug = slugify(body.slug || title)
  const excerpt = String(body.excerpt ?? '').trim()
  const content = String(body.content ?? '').trim()
  const author = String(body.author || 'Toscani Tenekeu').trim()

  if (!['article', 'tutorial'].includes(type)) throw new Error('Invalid content type')
  if (!title || !slug || !excerpt || !content) throw new Error('Title, excerpt and content are required')
  if (title.length > 180 || slug.length > 180) throw new Error('Title is too long')
  if (excerpt.length > 1_000) throw new Error('Excerpt is too long')
  if (content.length > 100_000) throw new Error('Content is too long')

  return {
    type,
    title,
    slug,
    excerpt,
    content,
    author: author.slice(0, 100),
    tags: parseTags(body.tags),
    status: body.status === 'draft' ? 'draft' : 'published',
    readTime: type === 'article' ? String(body.readTime ?? '').trim().slice(0, 40) || null : null,
    duration: type === 'tutorial' ? String(body.duration ?? '').trim().slice(0, 40) || null : null,
    language: type === 'tutorial' ? String(body.language ?? '').trim().slice(0, 60) || null : null,
    level: type === 'tutorial' && ['Beginner', 'Intermediate', 'Advanced'].includes(body.level)
      ? body.level
      : type === 'tutorial' ? 'Beginner' : null,
  }
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

app.get('/api/content', (req, res) => {
  const type = req.query.type
  if (!['article', 'tutorial'].includes(type)) {
    return res.status(400).json({ message: 'Invalid content type' })
  }

  try {
    const rows = db.prepare(`
      SELECT * FROM content
      WHERE type = ? AND status = 'published'
      ORDER BY datetime(created_at) DESC, id DESC
    `).all(type)
    return res.json(rows.map(rowToContent))
  } catch (error) {
    console.error('[devhub] Could not list content:', error)
    return res.status(500).json({ message: 'Database error' })
  }
})

app.get('/api/content/:type/:slug', (req, res) => {
  const { type, slug } = req.params
  if (!['article', 'tutorial'].includes(type)) {
    return res.status(400).json({ message: 'Invalid content type' })
  }

  try {
    const row = db.prepare(`
      SELECT * FROM content WHERE type = ? AND slug = ? AND status = 'published'
    `).get(type, slug)
    if (!row) return res.status(404).json({ message: 'Content not found' })

    const comments = db.prepare(`
      SELECT * FROM comments
      WHERE content_id = ? AND status = 'approved'
      ORDER BY datetime(created_at) DESC
    `).all(row.id)

    return res.json({
      ...rowToContent(row),
      comments: comments.map(rowToPublicComment),
      htmlContent: sanitizeMarkdown(row.content),
    })
  } catch (error) {
    console.error('[devhub] Could not load content:', error)
    return res.status(500).json({ message: 'Database error' })
  }
})

app.get('/api/content/:type/:slug/comments', (req, res) => {
  const { type, slug } = req.params
  if (!['article', 'tutorial'].includes(type)) {
    return res.status(400).json({ message: 'Invalid content type' })
  }

  try {
    const row = db.prepare(`
      SELECT id FROM content WHERE type = ? AND slug = ? AND status = 'published'
    `).get(type, slug)
    if (!row) return res.status(404).json({ message: 'Content not found' })

    const comments = db.prepare(`
      SELECT * FROM comments
      WHERE content_id = ? AND status = 'approved'
      ORDER BY datetime(created_at) DESC
    `).all(row.id)
    return res.json(comments.map(rowToPublicComment))
  } catch (error) {
    console.error('[devhub] Could not list comments:', error)
    return res.status(500).json({ message: 'Database error' })
  }
})

app.post('/api/comments', limitComments, (req, res) => {
  const { contentType, contentSlug } = req.body ?? {}
  const name = String(req.body?.name ?? '').trim()
  const email = String(req.body?.email ?? '').trim().toLowerCase()
  const body = String(req.body?.body ?? '').trim()

  if (!['article', 'tutorial'].includes(contentType)) {
    return res.status(400).json({ message: 'Invalid content type' })
  }
  if (!name || !email || !body || !contentSlug) {
    return res.status(400).json({ message: 'All fields are required' })
  }
  if (name.length > 100 || email.length > 254 || body.length > 2_000) {
    return res.status(400).json({ message: 'Comment fields are too long' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email address' })
  }

  try {
    const row = db.prepare(`
      SELECT id, slug FROM content
      WHERE type = ? AND slug = ? AND status = 'published'
    `).get(contentType, contentSlug)
    if (!row) return res.status(404).json({ message: 'Content not found' })

    db.prepare(`
      INSERT INTO comments
        (content_id, content_slug, content_type, name, email, body, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
    `).run(row.id, row.slug, contentType, name, email, body, now())
    return res.status(201).json({ ok: true })
  } catch (error) {
    console.error('[devhub] Could not create comment:', error)
    return res.status(500).json({ message: 'Could not create comment' })
  }
})

app.post('/api/admin/login', limitAdminLogin, (req, res) => {
  const { email, password } = req.body ?? {}
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    return res.status(503).json({ message: 'Admin credentials are not configured' })
  }

  const authenticated = safeEqual(email, ADMIN_EMAIL) && safeEqual(password, ADMIN_PASSWORD)
  if (!authenticated) {
    getWindow(loginAttempts, req.ip, LOGIN_WINDOW_MS).count += 1
    return res.status(401).json({ message: 'Invalid admin credentials' })
  }

  loginAttempts.delete(req.ip)
  req.session.regenerate((error) => {
    if (error) return res.status(500).json({ message: 'Unable to create admin session' })
    req.session.admin = { authenticated: true, email: ADMIN_EMAIL }
    req.session.save((saveError) => saveError
      ? res.status(500).json({ message: 'Unable to save admin session' })
      : res.json({ authenticated: true, email: ADMIN_EMAIL }))
  })
})

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('toscani.devhub.sid')
    res.json({ ok: true })
  })
})

app.get('/api/admin/me', (req, res) => {
  if (!isAdmin(req)) return res.json({ authenticated: false })
  return res.json({ authenticated: true, email: req.session.admin.email })
})

app.get('/api/admin/content', requireAdmin, (req, res) => {
  const { type } = req.query
  const filterByType = ['article', 'tutorial'].includes(type)
  const sql = filterByType
    ? 'SELECT * FROM content WHERE type = ? ORDER BY datetime(created_at) DESC, id DESC'
    : 'SELECT * FROM content ORDER BY datetime(created_at) DESC, id DESC'

  try {
    const rows = filterByType ? db.prepare(sql).all(type) : db.prepare(sql).all()
    return res.json(rows.map(rowToContent))
  } catch (error) {
    console.error('[devhub] Could not list admin content:', error)
    return res.status(500).json({ message: 'Database error' })
  }
})

app.post('/api/admin/uploads', requireAdmin, rawImage, (req, res) => {
  const mimeType = String(req.headers['content-type'] ?? '').split(';')[0].trim().toLowerCase()
  const extension = imageExtensions.get(mimeType)

  if (!extension || !hasValidImageSignature(req.body, mimeType)) {
    return res.status(415).json({ message: 'Only valid JPG, PNG, WebP and GIF images are accepted' })
  }
  if (req.body.length === 0) return res.status(400).json({ message: 'Image is empty' })

  const filename = `${Date.now()}-${crypto.randomUUID()}${extension}`
  try {
    fs.writeFileSync(path.join(uploadsDir, filename), req.body, { flag: 'wx', mode: 0o600 })
    return res.status(201).json({ url: `/uploads/${filename}` })
  } catch (error) {
    console.error('[devhub] Could not store upload:', error)
    return res.status(500).json({ message: 'Could not store image' })
  }
})

app.post('/api/admin/content', requireAdmin, (req, res) => {
  let input
  try {
    input = validateContentInput(req.body ?? {})
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }

  let coverImage
  try {
    coverImage = normalizeCoverImage(req.body.coverImage)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
  const timestamp = now()

  try {
    const result = db.prepare(`
      INSERT INTO content
        (type, slug, title, excerpt, content, author, cover_image, tags, status,
         read_time, duration, language, level, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      input.type, input.slug, input.title, input.excerpt, input.content, input.author,
      coverImage, JSON.stringify(input.tags), input.status, input.readTime, input.duration,
      input.language, input.level, timestamp, timestamp,
    )
    const row = db.prepare('SELECT * FROM content WHERE id = ?').get(result.lastInsertRowid)
    return res.status(201).json(rowToContent(row))
  } catch (error) {
    const duplicate = String(error.message).includes('UNIQUE')
    return res.status(duplicate ? 409 : 500).json({
      message: duplicate ? 'Slug already exists' : 'Could not create content',
    })
  }
})

app.get('/api/admin/content/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid content id' })

  try {
    const row = db.prepare('SELECT * FROM content WHERE id = ?').get(id)
    if (!row) return res.status(404).json({ message: 'Content not found' })
    return res.json(rowToContent(row))
  } catch (error) {
    console.error('[devhub] Could not load admin content:', error)
    return res.status(500).json({ message: 'Database error' })
  }
})

app.put('/api/admin/content/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ message: 'Invalid content id' })
  }

  let input
  try {
    input = validateContentInput(req.body ?? {})
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }

  const existing = db.prepare('SELECT * FROM content WHERE id = ?').get(id)
  if (!existing) {
    return res.status(404).json({ message: 'Content not found' })
  }
  let coverImage
  try {
    coverImage = normalizeCoverImage(req.body.coverImage)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }

  try {
    db.prepare(`
      UPDATE content SET
        type = ?, slug = ?, title = ?, excerpt = ?, content = ?, author = ?,
        cover_image = ?, tags = ?, status = ?, read_time = ?, duration = ?,
        language = ?, level = ?, updated_at = ?
      WHERE id = ?
    `).run(
      input.type, input.slug, input.title, input.excerpt, input.content, input.author,
      coverImage, JSON.stringify(input.tags), input.status, input.readTime, input.duration,
      input.language, input.level, now(), id,
    )
    if (existing.cover_image !== coverImage) removeManagedUpload(existing.cover_image)
    const row = db.prepare('SELECT * FROM content WHERE id = ?').get(id)
    return res.json(rowToContent(row))
  } catch (error) {
    const duplicate = String(error.message).includes('UNIQUE')
    return res.status(duplicate ? 409 : 500).json({
      message: duplicate ? 'Slug already exists' : 'Could not update content',
    })
  }
})

app.delete('/api/admin/content/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid content id' })

  try {
    const row = db.prepare('SELECT cover_image FROM content WHERE id = ?').get(id)
    if (!row) return res.status(404).json({ message: 'Content not found' })
    db.prepare('DELETE FROM content WHERE id = ?').run(id)
    removeManagedUpload(row.cover_image)
    return res.json({ ok: true })
  } catch (error) {
    console.error('[devhub] Could not delete content:', error)
    return res.status(500).json({ message: 'Could not delete content' })
  }
})

app.get('/api/admin/comments', requireAdmin, (_req, res) => {
  try {
    const rows = db.prepare(`
      SELECT * FROM comments ORDER BY datetime(created_at) DESC, id DESC
    `).all()
    return res.json(rows.map(rowToAdminComment))
  } catch (error) {
    console.error('[devhub] Could not list admin comments:', error)
    return res.status(500).json({ message: 'Database error' })
  }
})

app.patch('/api/admin/comments/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id)
  const { status } = req.body ?? {}
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid comment id' })
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' })
  }

  try {
    const result = db.prepare('UPDATE comments SET status = ? WHERE id = ?').run(status, id)
    if (result.changes === 0) return res.status(404).json({ message: 'Comment not found' })
    const row = db.prepare('SELECT * FROM comments WHERE id = ?').get(id)
    return res.json(rowToAdminComment(row))
  } catch (error) {
    console.error('[devhub] Could not moderate comment:', error)
    return res.status(500).json({ message: 'Could not update comment' })
  }
})

app.delete('/api/admin/comments/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid comment id' })

  try {
    const result = db.prepare('DELETE FROM comments WHERE id = ?').run(id)
    if (result.changes === 0) return res.status(404).json({ message: 'Comment not found' })
    return res.json({ ok: true })
  } catch (error) {
    console.error('[devhub] Could not delete comment:', error)
    return res.status(500).json({ message: 'Could not delete comment' })
  }
})

app.use('/api', (_req, res) => res.status(404).json({ message: 'Not found' }))

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))
  app.use((req, res, next) => {
    if (req.method !== 'GET' || !req.accepts('html') || req.path.startsWith('/uploads/')) {
      return next()
    }
    return res.sendFile(path.join(distDir, 'index.html'))
  })
} else {
  console.warn(`[devhub] Client build not found at ${distDir}. Run npm run build.`)
}

app.use((_req, res) => res.status(404).json({ message: 'Not found' }))
app.use((error, _req, res, _next) => {
  if (error?.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Image must not exceed 4 MB' })
  }
  console.error('[devhub] Unhandled request error:', error)
  if (!res.headersSent) return res.status(500).json({ message: 'Server error' })
})

const server = app.listen(PORT, HOST, () => {
  console.log(`Dev resource hub → http://${HOST}:${PORT}`)
})

function shutdown(signal) {
  console.log(`[devhub] ${signal} received; shutting down.`)
  server.close(() => {
    clearInterval(rateLimitPruneTimer)
    sessionStore.close()
    db.close()
    process.exit(0)
  })
  setTimeout(() => process.exit(1), 10_000).unref()
}

process.once('SIGTERM', () => shutdown('SIGTERM'))
process.once('SIGINT', () => shutdown('SIGINT'))
