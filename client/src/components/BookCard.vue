<script setup lang="ts">
import type { Book } from '../data/content'
defineProps<{ book: Book }>()
</script>

<template>
  <a :href="book.url" target="_blank" rel="noopener noreferrer"
     class="flex gap-5 bg-card border border-border rounded-lg p-5 no-underline text-fg transition-colors hover:border-border-hi group">

    <!-- Cover -->
    <div class="shrink-0 w-[72px]">
      <img :src="book.cover" :alt="book.title"
           class="w-[72px] h-[100px] object-cover rounded border border-border" loading="lazy" />
    </div>

    <!-- Body -->
    <div class="flex-1 min-w-0">
      <div class="flex gap-2 mb-2.5 flex-wrap">
        <span class="inline-block font-mono text-[11px] uppercase tracking-wider text-green px-2.5 py-1 border border-green/30 rounded">{{ book.language }}</span>
        <span class="inline-block font-mono text-[11px] uppercase tracking-wider text-dim px-2.5 py-1 border border-border rounded">{{ book.level }}</span>
      </div>
      <h3 class="text-[17px] text-fg tracking-tight mb-1">{{ book.title }}</h3>
      <p class="flex items-center gap-1.5 text-[13px] text-dim mb-2.5">
        <FontAwesomeIcon :icon="['fas', 'user']" class="text-[11px] opacity-70" />
        {{ book.author }}
      </p>
      <p class="text-sm text-fg2 leading-snug mb-3.5 line-clamp-2">{{ book.description }}</p>
      <div class="flex items-center flex-wrap gap-1.5">
        <FontAwesomeIcon :icon="['fas', 'tag']" class="text-[11px] text-dim opacity-60" />
        <span v-for="tag in book.tags" :key="tag"
              class="text-[12px] text-dim bg-tint border border-border-lo rounded px-2 py-0.5">
          {{ tag }}
        </span>
      </div>
    </div>

    <FontAwesomeIcon :icon="['fas', 'chevron-right']" class="card-arrow self-start mt-1" />
  </a>
</template>
