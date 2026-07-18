<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import TerminalTyper from './TerminalTyper.vue'
import { isDark, toggle } from '../composables/useTheme'

const route = useRoute()
const menuOpen = ref(false)

const navLinks = [
  { to: '/books',     label: 'books' },
  { to: '/tutorials', label: 'tutorials' },
  { to: '/articles',  label: 'articles' },
  { to: '/videos',    label: 'videos' },
  { to: '/projects',  label: 'projets' },
]
</script>

<template>
  <header class="sticky top-0 z-50 bg-bg border-b border-border">
    <div class="flex sm:grid sm:grid-cols-[1fr_auto_1fr] items-center h-[52px] max-w-[1100px] mx-auto px-6">

      <!-- Logo (left col) -->
      <RouterLink to="/" class="flex items-center gap-2 min-w-0 overflow-hidden pr-4 sm:pr-0 text-fg no-underline hover:opacity-90 transition-opacity">
        <span class="text-xs text-green">~ $</span>
        <span class="block min-w-0 overflow-hidden font-mono text-[13px] text-fg"><TerminalTyper /></span>
      </RouterLink>

      <!-- Desktop nav (center col) -->
      <nav class="hidden sm:flex items-center gap-0.5">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="text-xs font-medium text-dim px-2.5 py-1 rounded-md transition-colors no-underline hover:text-link"
          :class="{ 'text-fg!': route.path === link.to }"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <!-- Right controls (right col) -->
      <div class="ml-auto sm:ml-0 flex shrink-0 items-center gap-1.5 justify-end">
        <!-- Theme toggle -->
        <button
          class="flex items-center justify-center w-7 h-7 bg-transparent border border-border rounded-full cursor-pointer text-fg hover:border-border-hi hover:bg-hover transition-colors"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggle"
        >
          <FontAwesomeIcon :icon="['fas', isDark ? 'sun' : 'moon']" class="text-[11px]" />
        </button>

        <!-- Hamburger -->
        <button
          class="sm:hidden flex items-center justify-center w-7 h-7 bg-transparent border border-border rounded-full cursor-pointer text-fg hover:border-border-hi hover:bg-hover transition-colors"
          :aria-expanded="menuOpen"
          aria-label="Toggle menu"
          @click="menuOpen = !menuOpen"
        >
          <FontAwesomeIcon :icon="menuOpen ? ['fas', 'xmark'] : ['fas', 'bars']" class="text-[11px]" />
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <div v-if="menuOpen" class="sm:hidden flex flex-col border-t border-border-lo px-6 py-2 gap-0.5 bg-bg">
      <RouterLink
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="text-xs font-medium text-dim py-2 border-b border-border-lo last:border-0 no-underline hover:text-link transition-colors"
        @click="menuOpen = false"
      >
        {{ link.label }}
      </RouterLink>
    </div>
  </header>
</template>
