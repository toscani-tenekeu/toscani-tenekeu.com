<template>
  <footer class="bg-bg border-t border-border mt-auto">
    <div class="max-w-[1100px] mx-auto px-6 pt-8 pb-6">

      <!-- Top: brand + nav cols -->
      <div class="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-8 mb-6">

        <!-- Brand -->
        <div>
          <p class="font-mono text-xs text-fg mb-1">toscani-tenekeu.com</p>
          <p class="text-xs text-dim leading-relaxed max-w-[360px]">
            A curated space for developers — books, tutorials, articles &amp; videos across every language and algorithm.
          </p>
        </div>

        <!-- Navigation columns -->
        <div class="flex gap-10 flex-wrap">
          <div class="flex flex-col gap-1.5">
            <p class="font-mono text-[10px] uppercase tracking-widest text-dim mb-1">Content</p>
            <RouterLink to="/books"     class="text-xs text-fg2 hover:text-link transition-colors no-underline">Books</RouterLink>
            <RouterLink to="/tutorials" class="text-xs text-fg2 hover:text-link transition-colors no-underline">Tutorials</RouterLink>
            <RouterLink to="/articles"  class="text-xs text-fg2 hover:text-link transition-colors no-underline">Articles</RouterLink>
            <RouterLink to="/videos"    class="text-xs text-fg2 hover:text-link transition-colors no-underline">Videos</RouterLink>
          </div>
          <div class="flex flex-col gap-1.5">
            <p class="font-mono text-[10px] uppercase tracking-widest text-dim mb-1">Topics</p>
            <span class="text-xs text-fg2">Python</span>
            <span class="text-xs text-fg2">JavaScript</span>
            <span class="text-xs text-fg2">TypeScript</span>
            <span class="text-xs text-fg2">Algorithms</span>
          </div>
        </div>
      </div>

      <hr class="border-0 border-t border-border-lo mb-4" />

      <!-- Bottom: copyright + portfolio link -->
      <div class="flex items-center justify-between flex-wrap gap-3">
        <p class="text-[11px] text-dim">
          &copy; {{ year }} toscani-tenekeu. Hosted by
          <a href="https://kmerhosting.com" target="_blank" rel="noopener noreferrer"
             class="text-link font-medium hover:underline">KmerHosting</a>.
        </p>
        <a href="https://portfolio.toscani-tenekeu.com" target="_blank" rel="noopener noreferrer"
           class="text-white inline-flex items-center gap-1.5 text-xs font-medium bg-green px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity no-underline">
          <FontAwesomeIcon :icon="['fas', 'arrow-right']" class="text-[10px]" />
          View my portfolio
        </a>
      </div>

    </div>
  </footer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
const year = new Date().getFullYear()
</script>
