<script setup lang="ts">
import { onMounted } from 'vue'
import AppNavbar from './components/AppNavbar.vue'
import AppFooter from './components/AppFooter.vue'
import { initTheme } from './composables/useTheme'

onMounted(() => initTheme())
</script>

<template>
  <AppNavbar />
  <main class="flex-1">
    <RouterView />
  </main>
  <AppFooter />
</template>
