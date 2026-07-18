<script setup lang="ts">
import type { Article } from '../data/content'
import { RouterLink } from 'vue-router'
import { slugify } from '../utils/slugify'

const props = defineProps<{ article: Article }>()

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function articlePath(article: Article) {
  const slug = article.slug || slugify(article.title)
  return `/articles/${slug}`
}
</script>

<template>
  <RouterLink
    :to="articlePath(props.article)"
    class="flex flex-col gap-3 bg-card border border-border rounded-lg p-5 no-underline text-fg transition-colors hover:border-border-hi group"
  >
    <div class="flex flex-wrap gap-1.5">
      <span v-for="tag in props.article.tags" :key="tag"
            class="inline-block font-mono text-[11px] uppercase tracking-wider text-dim px-2.5 py-1 border border-border rounded">
        {{ tag }}
      </span>
    </div>

    <h3 class="text-[18px] text-fg tracking-tight leading-snug">{{ props.article.title }}</h3>
    <p class="text-sm text-fg2 leading-relaxed flex-1 line-clamp-3">{{ props.article.excerpt }}</p>

    <div class="flex items-center gap-1.5 flex-wrap text-[13px] text-dim mt-auto">
      <FontAwesomeIcon :icon="['fas', 'user']" class="text-[11px] opacity-60" />
      <span>{{ props.article.author }}</span>
      <span class="text-border-hi">·</span>
      <FontAwesomeIcon :icon="['fas', 'calendar']" class="text-[11px] opacity-60" />
      <span>{{ formatDate(props.article.date) }}</span>
      <span class="text-border-hi">·</span>
      <FontAwesomeIcon :icon="['fas', 'clock']" class="text-[11px] opacity-60" />
      <span>{{ props.article.readTime }}</span>
      <FontAwesomeIcon :icon="['fas', 'chevron-right']" class="card-arrow ml-auto" />
    </div>
  </RouterLink>
</template>
