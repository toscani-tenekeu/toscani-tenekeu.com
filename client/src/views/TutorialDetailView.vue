<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { marked } from 'marked'
import { getContent, createComment, type ContentType, type CmsComment, type CmsContent } from '../services/cms'
import { tutorials as fallbackTutorials, type Tutorial } from '../data/content'
import { slugify } from '../utils/slugify'

const route = useRoute()
const loading = ref(true)
const error = ref('')
const submitting = ref(false)
const submitMessage = ref('')
const comments = ref<CmsComment[]>([])
const commentName = ref('')
const commentEmail = ref('')
const commentBody = ref('')
const tutorial = ref<CmsContent | null>(null)
const htmlContent = ref('')
const slug = computed(() => String(route.params.slug || ''))
const contentType: ContentType = 'tutorial'

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatMonthYear(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}


function setMeta(title: string, description: string) {
  document.title = `${title} — toscani-tenekeu | Dev Resource Hub`

  const head = document.head
  const ensureMeta = (selector: string, attr: 'name' | 'property', value: string) => {
    let tag = head.querySelector(`meta[${attr}="${selector}"]`) as HTMLMetaElement | null
    if (!tag) {
      tag = document.createElement('meta')
      tag.setAttribute(attr, selector)
      head.appendChild(tag)
    }
    tag.content = value
  }

  ensureMeta('description', 'name', description)
  ensureMeta('og:title', 'property', title)
  ensureMeta('og:description', 'property', description)
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function fallbackTutorial(): Tutorial | null {
  return fallbackTutorials.find((item) => slugify(item.slug || item.title) === slug.value) || null
}

function fallbackMarkdown(item: Tutorial) {
  return `# ${item.title}

${item.description}

## Tutorial Details

- Language: ${item.language}
- Level: ${item.level}
- Duration: ${item.duration}

## What you will learn

${item.tags.map((tag) => `- ${tag}`).join('\n')}

## Practice

Use the admin editor to expand this tutorial into a full lesson.`
}

async function load() {
  loading.value = true
  error.value = ''
  submitMessage.value = ''
  try {
    const data = await getContent(contentType, slug.value)
    tutorial.value = data
    htmlContent.value =
      data.htmlContent ||
      await marked.parse(data.content || '')
    comments.value = data.comments || []
    setMeta(data.title, data.excerpt)
  } catch (err) {
    const fallback = fallbackTutorial()
    if (!fallback) {
      tutorial.value = null
      htmlContent.value = ''
      comments.value = []
      error.value = err instanceof Error ? err.message : 'Tutorial not found.'
      loading.value = false
      return
    }

    tutorial.value = {
      id: fallback.id,
      type: 'tutorial',
      slug: slug.value,
      title: fallback.title,
      excerpt: fallback.description,
      content: fallbackMarkdown(fallback),
      author: fallback.author || 'Toscani Tenekeu',
      createdAt: fallback.createdAt || new Date().toISOString(),
      updatedAt: fallback.updatedAt || fallback.createdAt || new Date().toISOString(),
      duration: fallback.duration,
      language: fallback.language,
      level: fallback.level,
      tags: fallback.tags,
      coverImage: null,
      status: 'published',
    }
    htmlContent.value =
      await marked.parse(fallbackMarkdown(fallback))
    comments.value = []
    error.value = ''
    setMeta(fallback.title, fallback.description)
  } finally {
    loading.value = false
  }
}

async function submitComment() {
  if (!tutorial.value) return
  submitting.value = true
  submitMessage.value = ''
  try {
    await createComment({
      contentType,
      contentSlug: slug.value,
      name: commentName.value,
      email: commentEmail.value,
      body: commentBody.value,
    })
    commentName.value = ''
    commentEmail.value = ''
    commentBody.value = ''
    submitMessage.value = 'Your comment has been sent for review.'
  } catch (err) {
    submitMessage.value = err instanceof Error ? err.message : 'Could not submit comment.'
  } finally {
    submitting.value = false
  }
}

onMounted(load)
watch(() => route.params.slug, load)
</script>

<template>
  <div class="py-14">
    <div class="max-w-[920px] mx-auto px-6">
      <div v-if="loading" class="text-dim py-20 text-center border border-border rounded-lg bg-card">
        Loading tutorial…
      </div>

      <template v-else-if="tutorial">
        <RouterLink to="/tutorials"
          class="inline-flex items-center gap-2 text-sm text-dim no-underline hover:text-link mb-8">
          <FontAwesomeIcon :icon="['fas', 'arrow-right']" class="rotate-180 text-xs" />
          Back to tutorials
        </RouterLink>

        <article class="bg-card border border-border rounded-lg overflow-hidden">
          <div v-if="tutorial.coverImage" class="aspect-[16/8] bg-tint border-b border-border">
            <img :src="tutorial.coverImage" :alt="tutorial.title" class="w-full h-full object-cover" />
          </div>

          <div class="p-6 sm:p-10">
            <div class="flex flex-wrap gap-2 mb-5">
              <span v-for="tag in tutorial.tags" :key="tag"
                class="inline-flex items-center font-mono text-[11px] uppercase tracking-wider text-dim px-2.5 py-1 border border-border rounded">
                {{ tag }}
              </span>
            </div>

            <h1 class="text-[clamp(2rem,5vw,3.7rem)] font-light text-fg leading-[1.05] -tracking-wide mb-4">
              {{ tutorial.title }}
            </h1>

            <div class="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-dim mb-8">
              <span class="inline-flex items-center gap-1.5">
                <FontAwesomeIcon :icon="['fas', 'user']" /> {{ tutorial.author }}
              </span>
              <span class="text-border-hi">·</span>
              <span class="inline-flex items-center gap-1.5">
                <FontAwesomeIcon :icon="['fas', 'calendar']" /> {{ formatDateTime(tutorial.createdAt) }}
              </span>
              <span class="text-border-hi">·</span>
              <span class="inline-flex items-center gap-1.5">
                <FontAwesomeIcon :icon="['fas', 'clock']" /> {{ tutorial.duration || 'Tutorial' }}
              </span>
            </div>

            <div class="grid sm:grid-cols-3 gap-3 mb-8">
              <div class="border border-border rounded-lg p-4 bg-bg">
                <p class="text-xs uppercase tracking-[0.18em] text-dim mb-1">Language</p>
                <p class="text-sm text-fg">{{ tutorial.language }}</p>
              </div>
              <div class="border border-border rounded-lg p-4 bg-bg">
                <p class="text-xs uppercase tracking-[0.18em] text-dim mb-1">Level</p>
                <p class="text-sm text-fg">{{ tutorial.level }}</p>
              </div>
              <div class="border border-border rounded-lg p-4 bg-bg">
                <p class="text-xs uppercase tracking-[0.18em] text-dim mb-1">Published</p>
                <p class="text-sm text-fg">{{ formatMonthYear(tutorial.createdAt) }}</p>
              </div>
            </div>

            <div
              class="tutorial-markdown prose max-w-none prose-headings:font-light prose-headings:text-fg prose-p:text-fg2 prose-li:text-fg2 prose-a:text-green prose-strong:text-fg prose-code:text-fg prose-pre:bg-deep prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:p-5">
              <div v-html="htmlContent"></div>
            </div>
          </div>
        </article>

        <section class="mt-8 bg-card border border-border rounded-lg p-6 sm:p-8">
          <div class="flex items-center justify-between gap-4 flex-wrap mb-5">
            <h2 class="text-xl font-light text-fg">Comments</h2>
            <span class="text-xs uppercase tracking-[0.18em] text-dim">Month: {{ formatMonthYear(tutorial.createdAt) }}
              · Time: {{ formatTime(tutorial.createdAt) }}</span>
          </div>

          <div v-if="comments.length" class="flex flex-col gap-4 mb-8">
            <div v-for="comment in comments" :key="comment.id" class="border border-border rounded-lg p-4 bg-bg">
              <div class="flex items-center justify-between gap-3 mb-2">
                <strong class="text-sm text-fg">{{ comment.name }}</strong>
                <span class="text-xs text-dim">{{ formatDateTime(comment.createdAt) }}</span>
              </div>
              <p class="text-sm text-fg2 leading-relaxed">{{ comment.body }}</p>
            </div>
          </div>
          <div v-else class="text-sm text-dim border border-border rounded-lg p-4 mb-8">
            No approved comments yet.
          </div>

          <form class="grid gap-3" @submit.prevent="submitComment">
            <div class="grid sm:grid-cols-2 gap-3">
              <input v-model="commentName" type="text" placeholder="Your name"
                class="bg-bg border border-border rounded-lg px-4 py-3 text-sm text-fg outline-none focus:border-green/50"
                required />
              <input v-model="commentEmail" type="email" placeholder="Email"
                class="bg-bg border border-border rounded-lg px-4 py-3 text-sm text-fg outline-none focus:border-green/50"
                required />
            </div>
            <textarea v-model="commentBody" rows="5" placeholder="Write your comment..."
              class="bg-bg border border-border rounded-lg px-4 py-3 text-sm text-fg outline-none focus:border-green/50 resize-y"
              required />
            <div class="flex items-center justify-between gap-3 flex-wrap">
              <p class="text-xs text-dim">Comments are reviewed before being published.</p>
              <button type="submit"
                class="cursor-pointer inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-full border border-green bg-green text-white hover:opacity-90 transition-opacity no-underline"
                :disabled="submitting">
                {{ submitting ? 'Sending…' : 'Send comment' }}
              </button>
            </div>
            <p v-if="submitMessage" class="text-sm"
              :class="submitMessage.includes('sent') ? 'text-green' : 'text-error'">
              {{ submitMessage }}
            </p>
          </form>
        </section>
      </template>

      <div v-else class="text-center text-dim py-20 border border-border rounded-lg bg-card">
        {{ error || 'Tutorial not found.' }}
      </div>
    </div>
  </div>
</template>


<style scoped>
.tutorial-markdown :deep(h1) {
  font-size: 2rem;
  line-height: 1.1;
  font-weight: 300;
  margin: 0 0 1rem;
  color: var(--fg);
  letter-spacing: -0.02em;
}

.tutorial-markdown :deep(h2) {
  font-size: 1.4rem;
  line-height: 1.2;
  font-weight: 300;
  margin: 2rem 0 0.75rem;
  color: var(--fg);
}

.tutorial-markdown :deep(h3) {
  font-size: 1.1rem;
  font-weight: 500;
  margin: 1.5rem 0 0.5rem;
  color: var(--fg);
}

.tutorial-markdown :deep(p) {
  margin: 1rem 0;
  line-height: 1.8;
}

.tutorial-markdown :deep(ul),
.tutorial-markdown :deep(ol) {
  margin: 1rem 0;
  padding-left: 1.4rem;
  color: var(--fg2);
}

.tutorial-markdown :deep(li) {
  margin: 0.35rem 0;
}

.tutorial-markdown :deep(a) {
  color: var(--green);
  text-decoration: none;
}

.tutorial-markdown :deep(pre) {
  background: var(--bg-deep);
  color: var(--fg);
  border: 1px solid var(--border);
  border-radius: 1rem;
  padding: 1rem;
  overflow-x: auto;
  margin: 1.25rem 0;
}

.tutorial-markdown :deep(code) {
  font-family: 'Source Code Pro', monospace;
  font-size: 0.92em;
}

.tutorial-markdown :deep(:not(pre) > code) {
  background: var(--tint);
  border: 1px solid var(--border);
  border-radius: 0.4rem;
  padding: 0.15rem 0.35rem;
}

.tutorial-markdown :deep(blockquote) {
  border-left: 3px solid var(--green);
  padding-left: 1rem;
  margin: 1.25rem 0;
  color: var(--fg2);
}

.tutorial-markdown :deep(img) {
  border-radius: 1rem;
  border: 1px solid var(--border);
  max-width: 100%;
}

.tutorial-markdown :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.tutorial-markdown :deep(th),
.tutorial-markdown :deep(td) {
  border: 1px solid var(--border);
  padding: 0.75rem;
  text-align: left;
}

.tutorial-markdown :deep(th) {
  color: var(--fg);
}
</style>
