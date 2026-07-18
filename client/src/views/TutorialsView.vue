<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { tutorials as fallbackTutorials, languages, levels, type Tutorial } from '../data/content'
import TutorialCard from '../components/TutorialCard.vue'
import { listContent, type CmsContent } from '../services/cms'
import { slugify } from '../utils/slugify'

const langFilter = ref('All')
const levelFilter = ref('All')
const items = ref<Tutorial[]>([])
const loading = ref(true)
const error = ref('')

function toTutorial(item: CmsContent): Tutorial {
  return {
    id: item.id,
    title: item.title,
    description: item.excerpt,
    language: item.language || 'General',
    level: (item.level as Tutorial['level']) || 'Beginner',
    duration: item.duration || '0 min',
    tags: item.tags,
    url: `/tutorials/${item.slug}`,
    slug: item.slug,
    excerpt: item.excerpt,
    content: item.content,
    author: item.author,
    coverImage: item.coverImage || undefined,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

function fallbackToTutorial(item: Tutorial): Tutorial {
  return {
    ...item,
    slug: item.slug || slugify(item.title),
    url: item.url && item.url !== '#' ? item.url : `/tutorials/${item.slug || slugify(item.title)}`,
  }
}

const merged = computed(() => [
  ...items.value,
  ...fallbackTutorials.map(fallbackToTutorial).filter((fallback) => !items.value.some((item) => item.slug === fallback.slug)),
])

const filtered = computed(() =>
  merged.value.filter((t) => {
    const matchLang = langFilter.value === 'All' || t.language === langFilter.value
    const matchLevel = levelFilter.value === 'All' || t.level === levelFilter.value
    return matchLang && matchLevel
  }),
)

onMounted(async () => {
  try {
    const remote = await listContent('tutorial')
    items.value = remote.map(toTutorial)
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
        <h1 class="text-[clamp(1.6rem,4vw,2.4rem)] font-light text-fg -tracking-wide leading-tight mb-2">Programming Tutorials</h1>
        <p class="text-sm text-fg2 leading-relaxed">Step-by-step guided tutorials on programming languages and algorithmic thinking.</p>
      </div>

      <div class="flex flex-col gap-4 mb-6">
        <div class="flex items-center gap-3 flex-wrap">
          <span class="font-mono text-[11px] uppercase tracking-wider text-dim whitespace-nowrap w-[70px]">Language</span>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="lang in languages" :key="lang"
              class="text-sm cursor-pointer rounded-full px-3.5 py-1.5 border transition-colors"
              :class="langFilter === lang
                ? 'text-green border-green/30 bg-green/[0.06]'
                : 'text-dim bg-transparent border-border hover:text-link hover:border-border-hi'"
              @click="langFilter = lang"
            >{{ lang }}</button>
          </div>
        </div>
        <div class="flex items-center gap-3 flex-wrap">
          <span class="font-mono text-[11px] uppercase tracking-wider text-dim whitespace-nowrap w-[70px]">Level</span>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="lvl in levels" :key="lvl"
              class="text-sm cursor-pointer rounded-full px-3.5 py-1.5 border transition-colors"
              :class="levelFilter === lvl
                ? 'text-green border-green/30 bg-green/[0.06]'
                : 'text-dim bg-transparent border-border hover:text-link hover:border-border-hi'"
              @click="levelFilter = lvl"
            >{{ lvl }}</button>
          </div>
        </div>
      </div>

      <p class="mb-5">
        <span class="inline-block font-mono text-[11px] uppercase tracking-wider text-dim px-2.5 py-1 border border-border rounded">
          {{ filtered.length }} result{{ filtered.length !== 1 ? 's' : '' }}
        </span>
      </p>

      <div v-if="loading" class="text-dim py-[60px] px-5 border border-border rounded-lg text-center">
        Loading tutorials…
      </div>

      <div v-else-if="filtered.length" class="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
        <TutorialCard v-for="tut in filtered" :key="tut.id + '-' + tut.title" :tutorial="tut" />
      </div>

      <div v-else class="text-center text-dim py-[60px] px-5 border border-border rounded-lg">
        {{ error || 'No tutorials found for the selected filters.' }}
      </div>
    </div>
  </div>
</template>
