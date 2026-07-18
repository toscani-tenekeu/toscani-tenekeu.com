<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createContent, getAdminSession, listAdminContent, updateContent, uploadCoverImage, type CmsContent } from '../services/cms'
import { slugify } from '../utils/slugify'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const coverImage = ref<File | null>(null)
const existingCover = ref('')
const isNew = computed(() => route.name === 'admin-new-content')
const contentId = computed(() => (isNew.value ? 'new' : Number(route.params.id)))

const form = ref({
  type: 'article' as 'article' | 'tutorial',
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  author: 'Toscani Tenekeu',
  tags: '',
  status: 'published' as 'published' | 'draft',
  readTime: '5 min read',
  duration: '5 hours',
  language: 'JavaScript',
  level: 'Beginner',
})

function hydrate(item: CmsContent) {
  form.value = {
    type: item.type,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt,
    content: item.content,
    author: item.author,
    tags: item.tags.join(', '),
    status: item.status,
    readTime: item.readTime || '5 min read',
    duration: item.duration || '5 hours',
    language: item.language || 'JavaScript',
    level: (item.level as 'Beginner' | 'Intermediate' | 'Advanced') || 'Beginner',
  }
  existingCover.value = item.coverImage || ''
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const session = await getAdminSession()
    if (!session.authenticated) {
      router.replace('/admin/login')
      return
    }
    if (!isNew.value) {
      const items = await listAdminContent()
      const item = items.find((entry) => entry.id === Number(contentId.value))
      if (!item) {
        throw new Error('Content not found')
      }
      hydrate(item)
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Could not load content'
  } finally {
    loading.value = false
  }
}

function autoSlug() {
  if (!form.value.slug || form.value.slug === slugify(form.value.title)) {
    form.value.slug = slugify(form.value.title)
  }
}

function onCoverChange(event: Event) {
  const input = event.target as HTMLInputElement
  coverImage.value = input.files?.[0] ?? null
}

async function submit() {
  saving.value = true
  error.value = ''
  try {
    let finalCover = existingCover.value
    if (coverImage.value) {
      const uploaded = await uploadCoverImage(coverImage.value)
      finalCover = uploaded.url
    }

    const payload: Record<string, unknown> = {
      ...form.value,
      slug: form.value.slug || slugify(form.value.title),
      coverImage: finalCover || null,
    }

    const result = isNew.value
      ? await createContent(payload)
      : await updateContent(contentId.value as number, payload)

    router.replace(`/admin/content/${result.id}`)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Could not save content'
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="py-14">
    <div class="max-w-[980px] mx-auto px-6">
      <div class="flex items-start justify-between gap-4 flex-wrap mb-8">
        <div>
          <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-dim mb-2">Editor</p>
          <h1 class="text-[2.2rem] font-light text-fg -tracking-wide leading-tight">
            {{ isNew ? 'Create content' : 'Edit content' }}
          </h1>
        </div>
        <div class="flex gap-2 flex-wrap">
          <RouterLink to="/admin" class="inline-flex items-center justify-center border border-border rounded-full px-4 py-2.5 text-sm font-medium text-fg no-underline">
            Dashboard
          </RouterLink>
          <RouterLink to="/admin/comments" class="inline-flex items-center justify-center border border-border rounded-full px-4 py-2.5 text-sm font-medium text-fg no-underline">
            Comments
          </RouterLink>
        </div>
      </div>

      <div v-if="loading" class="text-dim py-20 text-center border border-border rounded-lg bg-card">
        Loading editor…
      </div>

      <form v-else class="border border-border rounded-lg bg-card p-5 sm:p-6 grid gap-4" @submit.prevent="submit">
        <div v-if="error" class="text-sm text-error border border-error/20 bg-error/5 rounded-lg px-4 py-3">
          {{ error }}
        </div>

        <div class="grid sm:grid-cols-2 gap-4">
          <label class="grid gap-2">
            <span class="text-xs uppercase tracking-[0.18em] text-dim">Type</span>
            <select v-model="form.type" class="bg-bg border border-border rounded-lg px-4 py-3 text-sm text-fg outline-none focus:border-green/50">
              <option value="article">Article</option>
              <option value="tutorial">Tutorial</option>
            </select>
          </label>
          <label class="grid gap-2">
            <span class="text-xs uppercase tracking-[0.18em] text-dim">Status</span>
            <select v-model="form.status" class="bg-bg border border-border rounded-lg px-4 py-3 text-sm text-fg outline-none focus:border-green/50">
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </label>
        </div>

        <div class="grid sm:grid-cols-2 gap-4">
          <label class="grid gap-2">
            <span class="text-xs uppercase tracking-[0.18em] text-dim">Title</span>
            <input v-model="form.title" @input="autoSlug" type="text" class="bg-bg border border-border rounded-lg px-4 py-3 text-sm text-fg outline-none focus:border-green/50" required />
          </label>
          <label class="grid gap-2">
            <span class="text-xs uppercase tracking-[0.18em] text-dim">Slug</span>
            <input v-model="form.slug" type="text" class="bg-bg border border-border rounded-lg px-4 py-3 text-sm text-fg outline-none focus:border-green/50" required />
          </label>
        </div>

        <div class="grid sm:grid-cols-2 gap-4">
          <label class="grid gap-2">
            <span class="text-xs uppercase tracking-[0.18em] text-dim">Author</span>
            <input v-model="form.author" type="text" class="bg-bg border border-border rounded-lg px-4 py-3 text-sm text-fg outline-none focus:border-green/50" required />
          </label>
          <label class="grid gap-2">
            <span class="text-xs uppercase tracking-[0.18em] text-dim">Tags</span>
            <input v-model="form.tags" type="text" class="bg-bg border border-border rounded-lg px-4 py-3 text-sm text-fg outline-none focus:border-green/50" placeholder="Node.js, APIs, SQLite" />
          </label>
        </div>

        <div class="grid sm:grid-cols-2 gap-4">
          <label v-if="form.type === 'article'" class="grid gap-2">
            <span class="text-xs uppercase tracking-[0.18em] text-dim">Read time</span>
            <input v-model="form.readTime" type="text" class="bg-bg border border-border rounded-lg px-4 py-3 text-sm text-fg outline-none focus:border-green/50" />
          </label>
          <label v-if="form.type === 'tutorial'" class="grid gap-2">
            <span class="text-xs uppercase tracking-[0.18em] text-dim">Duration</span>
            <input v-model="form.duration" type="text" class="bg-bg border border-border rounded-lg px-4 py-3 text-sm text-fg outline-none focus:border-green/50" />
          </label>
          <label v-if="form.type === 'tutorial'" class="grid gap-2">
            <span class="text-xs uppercase tracking-[0.18em] text-dim">Language</span>
            <input v-model="form.language" type="text" class="bg-bg border border-border rounded-lg px-4 py-3 text-sm text-fg outline-none focus:border-green/50" />
          </label>
          <label v-if="form.type === 'tutorial'" class="grid gap-2">
            <span class="text-xs uppercase tracking-[0.18em] text-dim">Level</span>
            <select v-model="form.level" class="bg-bg border border-border rounded-lg px-4 py-3 text-sm text-fg outline-none focus:border-green/50">
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </label>
        </div>

        <label class="grid gap-2">
          <span class="text-xs uppercase tracking-[0.18em] text-dim">Excerpt</span>
          <textarea v-model="form.excerpt" rows="4" class="bg-bg border border-border rounded-lg px-4 py-3 text-sm text-fg outline-none focus:border-green/50 resize-y" required />
        </label>

        <label class="grid gap-2">
          <span class="text-xs uppercase tracking-[0.18em] text-dim">Markdown content</span>
          <textarea v-model="form.content" rows="16" class="bg-bg border border-border rounded-lg px-4 py-3 text-sm text-fg outline-none focus:border-green/50 resize-y font-mono" required />
        </label>

        <div class="grid gap-2">
          <span class="text-xs uppercase tracking-[0.18em] text-dim">Cover image</span>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" @change="onCoverChange" class="bg-bg border border-border rounded-lg px-4 py-3 text-sm text-fg outline-none focus:border-green/50" />
          <p class="text-xs text-dim">Current image: {{ existingCover || 'none' }}</p>
        </div>

        <div class="flex items-center justify-end gap-3 flex-wrap">
          <RouterLink to="/admin" class="inline-flex items-center justify-center border border-border rounded-full px-4 py-2.5 text-sm font-medium text-fg no-underline">
            Cancel
          </RouterLink>
          <button type="submit" class="inline-flex items-center justify-center bg-green text-white rounded-full px-4 py-2.5 text-sm font-medium" :disabled="saving">
            {{ saving ? 'Saving…' : 'Save content' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
