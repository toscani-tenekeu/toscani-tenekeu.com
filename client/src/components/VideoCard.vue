<script setup lang="ts">
import type { Video } from '../data/content'
defineProps<{ video: Video }>()
</script>

<template>
  <a :href="video.url" target="_blank" rel="noopener noreferrer"
     class="flex flex-col bg-card border border-border rounded-lg overflow-hidden no-underline text-fg transition-colors hover:border-border-hi group">

    <!-- Thumbnail -->
    <div class="relative aspect-video overflow-hidden bg-deep">
      <img :src="video.thumbnail" :alt="video.title"
           class="w-full h-full object-cover" loading="lazy" />
      <span class="absolute bottom-2 right-2 bg-black/75 text-white text-[11px] font-mono px-1.5 py-0.5 rounded">
        {{ video.duration }}
      </span>
      <div class="absolute inset-0 flex items-center justify-center text-[2rem] text-white/85 opacity-0 bg-black/35 transition-opacity group-hover:opacity-100">
        <FontAwesomeIcon :icon="['fas', 'circle-play']" />
      </div>
    </div>

    <!-- Body -->
    <div class="flex flex-col gap-2.5 p-[18px] flex-1">
      <div class="flex gap-2 flex-wrap">
        <span class="inline-block font-mono text-[11px] uppercase tracking-wider text-green px-2.5 py-1 border border-green/30 rounded">{{ video.language }}</span>
        <span class="inline-block font-mono text-[11px] uppercase tracking-wider text-dim px-2.5 py-1 border border-border rounded">{{ video.level }}</span>
      </div>
      <h3 class="text-base text-fg leading-snug">{{ video.title }}</h3>
      <p class="text-[13px] text-fg2 leading-snug line-clamp-2">{{ video.description }}</p>
      <p class="text-[12px] text-dim">{{ video.channel }}</p>
      <div class="flex flex-wrap gap-1.5 mt-auto items-center">
        <span v-for="tag in video.tags" :key="tag"
              class="text-[11px] text-dim bg-tint border border-border-lo rounded px-2 py-0.5">
          {{ tag }}
        </span>
        <FontAwesomeIcon :icon="['fas', 'chevron-right']" class="card-arrow ml-auto" />
      </div>
    </div>
  </a>
</template>
