<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { deleteComment, getAdminSession, listAdminComments, moderateComment, type CmsComment } from '../services/cms'

const router = useRouter()
const comments = ref<CmsComment[]>([])
const loading = ref(true)
const error = ref('')
const busyId = ref<number | null>(null)

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value))
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
    comments.value = await listAdminComments()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Could not load comments'
  } finally {
    loading.value = false
  }
}

async function setStatus(id: number, status: 'approved' | 'rejected') {
  busyId.value = id
  try {
    await moderateComment(id, status)
    await load()
  } finally {
    busyId.value = null
  }
}

async function remove(id: number) {
  busyId.value = id
  try {
    await deleteComment(id)
    await load()
  } finally {
    busyId.value = null
  }
}

onMounted(load)
</script>

<template>
  <div class="py-14">
    <div class="max-w-[1100px] mx-auto px-6">
      <div class="flex items-start justify-between gap-4 flex-wrap mb-8">
        <div>
          <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-dim mb-2">Moderation</p>
          <h1 class="text-[2.2rem] font-light text-fg -tracking-wide leading-tight">Comments</h1>
        </div>
        <div class="flex gap-2 flex-wrap">
          <RouterLink to="/admin" class="inline-flex items-center justify-center border border-border rounded-full px-4 py-2.5 text-sm font-medium text-fg no-underline">
            Dashboard
          </RouterLink>
          <RouterLink to="/admin/content/new" class="inline-flex items-center justify-center bg-green text-white rounded-full px-4 py-2.5 text-sm font-medium no-underline">
            New content
          </RouterLink>
        </div>
      </div>

      <div v-if="loading" class="text-dim py-20 text-center border border-border rounded-lg bg-card">
        Loading comments…
      </div>

      <div v-else class="border border-border rounded-lg bg-card p-5 sm:p-6">
        <div v-if="error" class="mb-6 text-sm text-error border border-error/20 bg-error/5 rounded-lg px-4 py-3">
          {{ error }}
        </div>

        <div class="flex flex-col gap-3">
          <div v-for="comment in comments" :key="comment.id" class="border border-border rounded-lg p-4 bg-bg">
            <div class="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div class="flex flex-wrap gap-2 mb-2">
                  <span class="font-mono text-[10px] uppercase tracking-[0.18em] text-dim border border-border rounded px-2 py-1">{{ comment.contentType }}</span>
                  <span class="font-mono text-[10px] uppercase tracking-[0.18em] text-green border border-green/30 rounded px-2 py-1">{{ comment.status }}</span>
                </div>
                <p class="text-sm text-fg">{{ comment.name }} · {{ comment.email }}</p>
                <p class="text-sm text-fg2 mt-2">{{ comment.body }}</p>
                <p class="text-xs text-dim mt-3">{{ formatDate(comment.createdAt) }} · {{ comment.contentSlug }}</p>
              </div>

              <div class="flex gap-2 shrink-0">
                <button @click="setStatus(comment.id, 'approved')" :disabled="busyId === comment.id" class="inline-flex items-center justify-center border border-border rounded-full px-3 py-2 text-sm text-fg">
                  Approve
                </button>
                <button @click="setStatus(comment.id, 'rejected')" :disabled="busyId === comment.id" class="inline-flex items-center justify-center border border-border rounded-full px-3 py-2 text-sm text-fg">
                  Reject
                </button>
                <button @click="remove(comment.id)" :disabled="busyId === comment.id" class="inline-flex items-center justify-center border border-border rounded-full px-3 py-2 text-sm text-fg">
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div v-if="!comments.length" class="text-sm text-dim border border-border rounded-lg p-4">
            No comments yet.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
