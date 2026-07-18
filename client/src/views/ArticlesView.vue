<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ArticleCard from '../components/ArticleCard.vue'
import { articles as fallbackArticles, type Article } from '../data/content'
import { listContent, type CmsContent } from '../services/cms'
import { slugify } from '../utils/slugify'

const search = ref('')
const tagFilter = ref('All')
const items = ref<Article[]>([])
const loading = ref(true)
const error = ref('')

function toArticle(item: CmsContent): Article {
  return {
    id: item.id,
    title: item.title,
    excerpt: item.excerpt,
    author: item.author,
    date: item.createdAt,
    readTime: item.readTime || '5 min read',
    tags: item.tags,
    url: `/articles/${item.slug}`,
    slug: item.slug,
    content: item.content,
    coverImage: item.coverImage || undefined,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

function fallbackToArticle(item: Article): Article {
  return {
    ...item,
    slug: item.slug || slugify(item.title),
    url: item.url && item.url !== '#' ? item.url : `/articles/${item.slug || slugify(item.title)}`,
  }
}

const allTags = computed(() => {
  const set = new Set<string>(['All'])
  items.value.forEach((a) => a.tags.forEach((t) => set.add(t)))
  fallbackArticles.forEach((a) => a.tags.forEach((t) => set.add(t)))
  return Array.from(set)
})

const filtered = computed(() => {
  const source = [...items.value, ...fallbackArticles.map(fallbackToArticle).filter((fallback) => !items.value.some((item) => item.slug === fallback.slug))]
  return source.filter((a) => {
    const matchTag = tagFilter.value === 'All' || a.tags.includes(tagFilter.value)
    const q = search.value.toLowerCase().trim()
    const matchSearch = !q || a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q)
    return matchTag && matchSearch
  })
})

onMounted(async () => {
  try {
    const remote = await listContent('article')
    items.value = remote.map(toArticle)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load content'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="py-14">
    <div class="max-w-[1100px] mx-auto px-6">
      <div class="mb-8">
        <h1 class="text-[clamp(1.6rem,4vw,2.4rem)] font-light text-fg -tracking-wide leading-tight mb-2">Developer Articles</h1>
        <p class="text-sm text-fg2 leading-relaxed">In-depth reads on algorithms, frameworks, and software engineering practices.</p>
      </div>

      <div class="flex flex-col gap-3.5 mb-6">
        <div class="relative max-w-[400px]">
          <FontAwesomeIcon :icon="['fas', 'magnifying-glass']"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-dim text-[13px] pointer-events-none" />
          <input
            v-model="search"
            type="text"
            placeholder="Search articles…"
            class="font-sans text-sm text-fg bg-card border border-border rounded-lg pl-9 pr-4 py-2.5 outline-none w-full transition-colors focus:border-green/50 placeholder:text-dim"
          />
        </div>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="tag in allTags" :key="tag"
            class="text-sm cursor-pointer rounded-full px-3.5 py-1.5 border transition-colors"
            :class="tagFilter === tag
              ? 'text-green border-green/30 bg-green/[0.06]'
              : 'text-dim bg-transparent border-border hover:text-link hover:border-border-hi'"
            @click="tagFilter = tag"
          >{{ tag }}</button>
        </div>
      </div>

      <p class="mb-5">
        <span class="inline-block font-mono text-[11px] uppercase tracking-wider text-dim px-2.5 py-1 border border-border rounded">
          {{ filtered.length }} result{{ filtered.length !== 1 ? 's' : '' }}
        </span>
      </p>

      <div v-if="loading" class="text-dim py-[60px] px-5 border border-border rounded-lg text-center">
        Loading articles…
      </div>

      <div v-else-if="filtered.length" class="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
        <ArticleCard v-for="article in filtered" :key="article.id + '-' + article.title" :article="article" />
      </div>

      <div v-else class="text-center text-dim py-[60px] px-5 border border-border rounded-lg">
        {{ error || 'No articles found. Try a different search or tag.' }}
      </div>
    </div>
  </div>
</template>
