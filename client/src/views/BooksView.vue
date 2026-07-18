<script setup lang="ts">
import { ref, computed } from 'vue'
import { books, languages, levels } from '../data/content'
import BookCard from '../components/BookCard.vue'

const langFilter = ref('All')
const levelFilter = ref('All')

const filtered = computed(() =>
  books.filter((b) => {
    const matchLang = langFilter.value === 'All' || b.language === langFilter.value
    const matchLevel = levelFilter.value === 'All' || b.level === levelFilter.value
    return matchLang && matchLevel
  }),
)
</script>

<template>
  <div class="py-14">
    <div class="max-w-[1100px] mx-auto px-6">

      <!-- Page header -->
      <div class="mb-8">
        <h1 class="text-[clamp(1.6rem,4vw,2.4rem)] font-light text-fg -tracking-wide leading-tight mb-2">Programming Books</h1>
        <p class="text-sm text-fg2 leading-relaxed">Handpicked books covering algorithms, languages, and software craftsmanship.</p>
      </div>

      <!-- Filters -->
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

      <!-- Result count -->
      <p class="mb-5">
        <span class="inline-block font-mono text-[11px] uppercase tracking-wider text-dim px-2.5 py-1 border border-border rounded">
          {{ filtered.length }} result{{ filtered.length !== 1 ? 's' : '' }}
        </span>
      </p>

      <!-- Grid -->
      <div v-if="filtered.length" class="flex flex-col gap-4">
        <BookCard v-for="book in filtered" :key="book.id" :book="book" />
      </div>
      <div v-else class="text-center text-dim py-[60px] px-5 border border-border rounded-lg">
        No books found for the selected filters.
      </div>
    </div>
  </div>
</template>
