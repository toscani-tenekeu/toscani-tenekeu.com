<script setup lang="ts">
import type { Tutorial } from '../data/content'
import { RouterLink } from 'vue-router'
import { slugify } from '../utils/slugify'

const props = defineProps<{ tutorial: Tutorial }>()

function tutorialPath(tutorial: Tutorial) {
  const slug = tutorial.slug || slugify(tutorial.title)
  return `/tutorials/${slug}`
}
</script>

<template>
  <RouterLink
    :to="tutorialPath(props.tutorial)"
    class="flex flex-col gap-3 bg-card border border-border rounded-lg p-5 no-underline text-fg transition-colors hover:border-border-hi h-full group"
  >
    <div class="flex items-center justify-between flex-wrap gap-2">
      <div class="flex gap-2 flex-wrap">
        <span class="inline-block font-mono text-[11px] uppercase tracking-wider text-green px-2.5 py-1 border border-green/30 rounded">{{ props.tutorial.language }}</span>
        <span class="inline-block font-mono text-[11px] uppercase tracking-wider text-dim px-2.5 py-1 border border-border rounded">{{ props.tutorial.level }}</span>
      </div>
      <span class="flex items-center gap-[5px] font-mono text-[11px] uppercase tracking-[1px] text-dim">
        <FontAwesomeIcon :icon="['fas', 'clock']" />
        {{ props.tutorial.duration }}
      </span>
    </div>

    <h3 class="text-[17px] text-fg tracking-tight">{{ props.tutorial.title }}</h3>
    <p class="text-sm text-fg2 leading-snug flex-1">{{ props.tutorial.description }}</p>

    <div class="flex flex-wrap gap-1.5">
      <span v-for="tag in props.tutorial.tags" :key="tag"
            class="text-[12px] text-dim bg-tint border border-border-lo rounded px-2 py-0.5">
        {{ tag }}
      </span>
    </div>

    <div class="mt-auto pt-2 flex items-center justify-between">
      <span class="inline-flex items-center gap-1.5 text-[13px] font-medium text-link">
        Start tutorial
      </span>
      <FontAwesomeIcon :icon="['fas', 'chevron-right']" class="card-arrow" />
    </div>
  </RouterLink>
</template>
