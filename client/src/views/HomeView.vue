<script setup lang="ts">
import { RouterLink } from 'vue-router'

const sections = [
  {
    to: '/books',
    icon: ['fas', 'book-open'],
    title: 'Books',
    desc: 'Curated programming books across all languages and levels — from beginner guides to advanced references.',
    count: '8 books',
  },
  {
    to: '/tutorials',
    icon: ['fas', 'graduation-cap'],
    title: 'Tutorials',
    desc: 'Step-by-step tutorials for Python, JavaScript, TypeScript, Vue, algorithms, and more.',
    count: '8 tutorials',
  },
  {
    to: '/articles',
    icon: ['fas', 'newspaper'],
    title: 'Articles',
    desc: 'In-depth articles on algorithms, frameworks, architecture patterns, and developer tooling.',
    count: '6 articles',
  },
  {
    to: '/videos',
    icon: ['fas', 'film'],
    title: 'Videos',
    desc: 'Video courses and deep-dives on programming languages, data structures, and web development.',
    count: '6 videos',
  },
]

const languages = [
  { label: 'Python', color: '#3776ab' },
  { label: 'JavaScript', color: '#f7df1e' },
  { label: 'TypeScript', color: '#3178c6' },
  { label: 'Vue.js', color: '#42b883' },
  { label: 'Rust', color: '#ce412b' },
  { label: 'Go', color: '#00add8' },
  { label: 'Algorithms', color: '#3ecf8e' },
  { label: 'CSS', color: '#563d7c' },
]
</script>

<template>
  <!-- Hero -->
  <section class="text-center py-14">
    <div class="max-w-[1100px] mx-auto px-6">
      <h1 class="text-[clamp(2.5rem,6vw,4.5rem)] font-light text-fg leading-[1.05] -tracking-wide mb-6">
        Learn every language.<br />
        Master every algorithm.
      </h1>
      <p class="text-sm text-fg2 leading-relaxed max-w-[560px] mx-auto mb-9">
        A curated library of books, tutorials, articles, and videos for developers at every stage — from first loop to systems programming.
      </p>
      <div class="flex gap-3 justify-center flex-wrap">
        <RouterLink to="/tutorials"
          class="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-full border border-green bg-green text-white hover:opacity-90 transition-opacity no-underline">
          <FontAwesomeIcon :icon="['fas', 'graduation-cap']" />
          Browse Tutorials
        </RouterLink>
        <RouterLink to="/books"
          class="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-full border border-border text-fg hover:border-border-hi hover:bg-hover transition-colors no-underline">
          <FontAwesomeIcon :icon="['fas', 'book-open']" />
          Explore Books
        </RouterLink>
      </div>
    </div>
  </section>

  <hr class="border-0 border-t border-border-lo" />

  <!-- Languages strip -->
  <section class="py-14">
    <div class="max-w-[1100px] mx-auto px-6">
      <p class="font-mono text-[10px] uppercase tracking-widest text-dim mb-4">Topics covered</p>
      <div class="flex flex-wrap gap-2">
        <span v-for="lang in languages" :key="lang.label"
              class="inline-flex items-center gap-[7px] text-xs text-fg2 border border-border rounded-full px-3 py-1">
          <span class="block w-2 h-2 rounded-full shrink-0" :style="{ background: lang.color }"></span>
          {{ lang.label }}
        </span>
      </div>
    </div>
  </section>

  <hr class="border-0 border-t border-border-lo" />

  <!-- Sections grid -->
  <section class="py-14">
    <div class="max-w-[1100px] mx-auto px-6">
      <div class="mb-8">
        <h2 class="text-[clamp(1.4rem,3vw,2rem)] font-light text-fg -tracking-wide leading-tight mb-2">What's inside</h2>
        <p class="text-sm text-fg2 leading-relaxed">Everything you need in one place, organized by format.</p>
      </div>
      <div class="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
        <RouterLink
          v-for="s in sections"
          :key="s.to"
          :to="s.to"
          class="flex items-start gap-3 bg-card border border-border rounded-lg p-5 no-underline text-fg transition-colors hover:border-border-hi group"
        >
          <div class="flex items-center justify-center w-9 h-9 rounded-md bg-green/[0.08] border border-green/20 text-green shrink-0">
            <FontAwesomeIcon :icon="s.icon" />
          </div>
          <div class="flex-1">
            <h3 class="text-sm font-medium text-fg mb-1.5">{{ s.title }}</h3>
            <p class="text-xs text-fg2 leading-relaxed mb-2.5">{{ s.desc }}</p>
            <span class="font-mono text-[10px] uppercase tracking-wider text-green">{{ s.count }}</span>
          </div>
          <FontAwesomeIcon :icon="['fas', 'chevron-right']"
            class="text-dim transition-transform ml-auto mt-0.5 shrink-0 group-hover:translate-x-1 group-hover:text-link text-xs" />
        </RouterLink>
      </div>
    </div>
  </section>

  <hr class="border-0 border-t border-border-lo" />

  <!-- CTA banner -->
  <section class="py-14">
    <div class="max-w-[1100px] mx-auto px-6">
      <div class="flex items-center justify-between gap-8 bg-card border border-border rounded-lg p-8 flex-wrap">
        <div>
          <h2 class="text-[clamp(1.2rem,2.5vw,1.6rem)] font-light text-fg mb-1.5">Ready to level up?</h2>
          <p class="text-xs text-fg2">Pick a topic and start learning today. No account required.</p>
        </div>
        <RouterLink to="/tutorials"
          class="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-full border border-green bg-green text-white hover:opacity-90 transition-opacity no-underline">
          <FontAwesomeIcon :icon="['fas', 'graduation-cap']" />
          Start Learning
        </RouterLink>
      </div>
    </div>
  </section>
</template>
