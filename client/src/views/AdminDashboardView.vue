<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { adminLogout, deleteContent, getAdminSession, listAdminComments, listAdminContent, type CmsComment, type CmsContent } from '../services/cms'

const router = useRouter()
const items = ref<CmsContent[]>([])
const comments = ref<CmsComment[]>([])
const loading = ref(true)
const error = ref('')
const busyId = ref<number | null>(null)

const contentCount = computed(() => items.value.length)
const articleCount = computed(() => items.value.filter((item) => item.type === 'article').length)
const tutorialCount = computed(() => items.value.filter((item) => item.type === 'tutorial').length)
const pendingCount = computed(() => comments.value.filter((comment) => comment.status === 'pending').length)

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
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
    const [content, adminComments] = await Promise.all([
      listAdminContent(),
      listAdminComments(),
    ])
    items.value = content
    comments.value = adminComments
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Could not load dashboard'
  } finally {
    loading.value = false
  }
}

async function remove(id: number) {
  if (!confirm('Delete this content?')) return
  busyId.value = id
  try {
    await deleteContent(id)
    await load()
  } finally {
    busyId.value = null
  }
}

async function logout() {
  await adminLogout()
  router.replace('/admin/login')
}

onMounted(load)
</script>

<template>
  <div class="py-14">
    <div class="max-w-[1100px] mx-auto px-6">
      <div class="flex items-start justify-between gap-4 flex-wrap mb-8">
        <div>
          <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-dim mb-2">Administration</p>
          <h1 class="text-[2.4rem] font-light text-fg -tracking-wide leading-tight">Content dashboard</h1>
          <p class="text-sm text-fg2 mt-2">Manage articles, tutorials, and comment moderation from one place.</p>
        </div>
        <div class="flex gap-2 flex-wrap">
          <RouterLink to="/admin/content/new" class="inline-flex items-center justify-center bg-green text-white rounded-full px-4 py-2.5 text-sm font-medium no-underline">
            New content
          </RouterLink>
          <RouterLink to="/admin/comments" class="inline-flex items-center justify-center border border-border rounded-full px-4 py-2.5 text-sm font-medium text-fg no-underline">
            Comments
          </RouterLink>
          <button @click="logout" class="inline-flex items-center justify-center border border-border rounded-full px-4 py-2.5 text-sm font-medium text-fg">
            Sign out
          </button>
        </div>
      </div>

      <div v-if="loading" class="text-dim py-20 text-center border border-border rounded-lg bg-card">
        Loading admin dashboard…
      </div>

      <template v-else>
        <div v-if="error" class="mb-6 text-sm text-error border border-error/20 bg-error/5 rounded-lg px-4 py-3">
          {{ error }}
        </div>

        <div class="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <div class="border border-border rounded-lg bg-card p-5">
            <p class="text-xs uppercase tracking-[0.18em] text-dim mb-2">Content</p>
            <p class="text-3xl font-light text-fg">{{ contentCount }}</p>
          </div>
          <div class="border border-border rounded-lg bg-card p-5">
            <p class="text-xs uppercase tracking-[0.18em] text-dim mb-2">Articles</p>
            <p class="text-3xl font-light text-fg">{{ articleCount }}</p>
          </div>
          <div class="border border-border rounded-lg bg-card p-5">
            <p class="text-xs uppercase tracking-[0.18em] text-dim mb-2">Tutorials</p>
            <p class="text-3xl font-light text-fg">{{ tutorialCount }}</p>
          </div>
          <div class="border border-border rounded-lg bg-card p-5">
            <p class="text-xs uppercase tracking-[0.18em] text-dim mb-2">Pending comments</p>
            <p class="text-3xl font-light text-fg">{{ pendingCount }}</p>
          </div>
        </div>

        <div class="grid xl:grid-cols-[1.4fr_0.9fr] gap-6">
          <section class="border border-border rounded-lg bg-card p-5 sm:p-6">
            <div class="flex items-center justify-between gap-4 flex-wrap mb-5">
              <h2 class="text-xl font-light text-fg">Published content</h2>
              <span class="text-xs uppercase tracking-[0.18em] text-dim">{{ items.length }} items</span>
            </div>

            <div class="flex flex-col gap-3">
              <div v-for="item in items" :key="item.id" class="border border-border rounded-lg p-4 bg-bg">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <div class="flex flex-wrap gap-2 mb-2">
                      <span class="font-mono text-[10px] uppercase tracking-[0.18em] text-dim border border-border rounded px-2 py-1">{{ item.type }}</span>
                      <span class="font-mono text-[10px] uppercase tracking-[0.18em] text-green border border-green/30 rounded px-2 py-1">{{ item.status }}</span>
                    </div>
                    <h3 class="text-lg font-light text-fg">{{ item.title }}</h3>
                    <p class="text-sm text-fg2 mt-1">{{ item.excerpt }}</p>
                    <p class="text-xs text-dim mt-3">{{ formatDate(item.createdAt) }} · {{ item.slug }}</p>
                  </div>
                  <div class="flex gap-2 shrink-0">
                    <RouterLink :to="`/admin/content/${item.id}`" class="inline-flex items-center justify-center border border-border rounded-full px-3 py-2 text-sm text-fg no-underline">
                      Edit
                    </RouterLink>
                    <button @click="remove(item.id)" :disabled="busyId === item.id" class="inline-flex items-center justify-center border border-border rounded-full px-3 py-2 text-sm text-fg">
                      {{ busyId === item.id ? 'Deleting…' : 'Delete' }}
                    </button>
                  </div>
                </div>
              </div>
              <div v-if="!items.length" class="text-sm text-dim border border-border rounded-lg p-4">
                No content yet.
              </div>
            </div>
          </section>

          <section class="border border-border rounded-lg bg-card p-5 sm:p-6">
            <div class="flex items-center justify-between gap-4 flex-wrap mb-5">
              <h2 class="text-xl font-light text-fg">Recent comments</h2>
              <RouterLink to="/admin/comments" class="text-sm text-link no-underline">Moderate</RouterLink>
            </div>

            <div class="flex flex-col gap-3">
              <div v-for="comment in comments.slice(0, 6)" :key="comment.id" class="border border-border rounded-lg p-4 bg-bg">
                <div class="flex items-center justify-between gap-3 mb-2">
                  <strong class="text-sm text-fg">{{ comment.name }}</strong>
                  <span class="text-xs text-dim">{{ comment.status }}</span>
                </div>
                <p class="text-sm text-fg2">{{ comment.body }}</p>
                <p class="text-xs text-dim mt-2">{{ formatDate(comment.createdAt) }} · {{ comment.contentType }} / {{ comment.contentSlug }}</p>
              </div>
              <div v-if="!comments.length" class="text-sm text-dim border border-border rounded-lg p-4">
                No comments yet.
              </div>
            </div>
          </section>
        </div>
      </template>
    </div>
  </div>
</template>
