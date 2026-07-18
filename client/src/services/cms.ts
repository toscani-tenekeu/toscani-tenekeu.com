export type ContentType = 'article' | 'tutorial'

export interface CmsContent {
  id: number
  type: ContentType
  slug: string
  title: string
  excerpt: string
  content: string
  author: string
  coverImage: string | null
  tags: string[]
  status: 'draft' | 'published'
  createdAt: string
  updatedAt: string
  readTime?: string | null
  duration?: string | null
  language?: string | null
  level?: string | null
}

export interface CmsComment {
  id: number
  contentId: number
  contentSlug: string
  contentType: ContentType
  name: string
  email?: string
  body: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export interface AdminSession {
  authenticated: boolean
  email?: string
}

async function request<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    ...init,
  })

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await res.json() : await res.text()

  if (!res.ok) {
    const message = typeof payload === 'string' ? payload : payload?.message ?? 'Request failed'
    throw new Error(message)
  }

  return payload as T
}

export async function listContent(type: ContentType): Promise<CmsContent[]> {
  return request<CmsContent[]>(`/api/content?type=${type}`)
}

export async function getContent(type: ContentType, slug: string): Promise<CmsContent & { comments?: CmsComment[]; htmlContent?: string }> {
  return request<CmsContent & { comments?: CmsComment[]; htmlContent?: string }>(`/api/content/${type}/${slug}`)
}

export async function listComments(type: ContentType, slug: string): Promise<CmsComment[]> {
  return request<CmsComment[]>(`/api/content/${type}/${slug}/comments`)
}

export async function createComment(payload: {
  contentType: ContentType
  contentSlug: string
  name: string
  email: string
  body: string
}): Promise<{ ok: true }> {
  return request('/api/comments', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function adminLogin(payload: { email: string; password: string }): Promise<AdminSession> {
  return request('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function adminLogout(): Promise<{ ok: true }> {
  return request('/api/admin/logout', { method: 'POST' })
}

export async function getAdminSession(): Promise<AdminSession> {
  return request<AdminSession>('/api/admin/me')
}

export async function listAdminContent(type?: ContentType): Promise<CmsContent[]> {
  const url = type ? `/api/admin/content?type=${type}` : '/api/admin/content'
  return request<CmsContent[]>(url)
}

async function submitContent(
  id: number | 'new',
  payload: Record<string, unknown>,
): Promise<CmsContent> {
  const url = id === 'new' ? '/api/admin/content' : `/api/admin/content/${id}`
  const method = id === 'new' ? 'POST' : 'PUT'

  const res = await fetch(url, {
    method,
    credentials: 'include',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  })

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const result = isJson ? await res.json() : await res.text()

  if (!res.ok) {
    const message = typeof result === 'string' ? result : result?.message ?? 'Request failed'
    throw new Error(message)
  }

  return result as CmsContent
}

export async function uploadCoverImage(file: File): Promise<{ url: string }> {
  const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
  if (!allowedTypes.has(file.type)) throw new Error('Only JPG, PNG, WebP and GIF images are accepted')
  if (file.size > 4 * 1024 * 1024) throw new Error('Image must not exceed 4 MB')

  const response = await fetch('/api/admin/uploads', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': file.type },
    body: file,
  })
  const isJson = response.headers.get('content-type')?.includes('application/json')
  const result = isJson ? await response.json() : await response.text()
  if (!response.ok) {
    const message = typeof result === 'string' ? result : result?.message ?? 'Upload failed'
    throw new Error(message)
  }
  return result as { url: string }
}

export function createContent(payload: Record<string, unknown>): Promise<CmsContent> {
  return submitContent('new', payload)
}

export function updateContent(id: number, payload: Record<string, unknown>): Promise<CmsContent> {
  return submitContent(id, payload)
}

export async function deleteContent(id: number): Promise<{ ok: true }> {
  return request(`/api/admin/content/${id}`, { method: 'DELETE' })
}

export async function listAdminComments(): Promise<CmsComment[]> {
  return request<CmsComment[]>('/api/admin/comments')
}

export async function moderateComment(id: number, status: 'approved' | 'rejected'): Promise<CmsComment> {
  return request<CmsComment>(`/api/admin/comments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export async function deleteComment(id: number): Promise<{ ok: true }> {
  return request(`/api/admin/comments/${id}`, { method: 'DELETE' })
}
