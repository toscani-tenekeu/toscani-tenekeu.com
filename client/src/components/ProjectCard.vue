<script setup lang="ts">
import { ref } from 'vue'

export interface Platform {
  id: string
  label: string
  icon: string[]
  available: boolean
  downloadUrl?: string
}

export interface Project {
  name: string
  type: string
  description: string
  siteUrl: string
  platforms: Platform[]
  features?: string[]
}

defineProps<{ project: Project }>()

// Download modal state
const modalOpen = ref(false)
const countdown = ref(5)
const downloadStarted = ref(false)
const pendingUrl = ref('')
let timer: ReturnType<typeof setInterval> | null = null

function openDownloadModal(url: string) {
  pendingUrl.value = url
  countdown.value = 5
  downloadStarted.value = false
  modalOpen.value = true

  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer!)
      triggerDownload()
    }
  }, 1000)
}

function triggerDownload() {
  downloadStarted.value = true
  const a = document.createElement('a')
  a.href = pendingUrl.value
  a.download = ''
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

function closeModal() {
  if (timer) clearInterval(timer)
  modalOpen.value = false
}
</script>

<template>
  <div class="bg-card border border-border rounded-lg p-6 hover:border-border-hi transition-colors group">

    <!-- Header -->
    <div class="flex items-start justify-between mb-4">
      <div>
        <h2 class="text-[1.5rem] font-light text-fg tracking-tight leading-tight">{{ project.name }}</h2>
        <p class="font-mono text-[12px] text-dim mt-1">{{ project.type }}</p>
      </div>
      <FontAwesomeIcon :icon="['fas', 'chevron-right']" class="card-arrow mt-1" />
    </div>

    <!-- Description -->
    <p class="text-sm text-fg2 leading-relaxed mb-5">{{ project.description }}</p>

    <!-- Feature tags (e.g. KmerHosting services) -->
    <div v-if="project.features?.length" class="flex flex-wrap gap-1.5 mb-5">
      <span
        v-for="f in project.features"
        :key="f"
        class="text-[12px] text-dim bg-tint border border-border-lo rounded px-2.5 py-0.5"
      >{{ f }}</span>
    </div>

    <!-- Platform availability -->
    <div v-if="project.platforms.length" class="mb-6">
      <p class="font-mono text-[11px] uppercase tracking-wider text-dim mb-3">Availability</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="p in project.platforms.filter(p => p.available)"
          :key="p.id"
          class="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border border-green bg-green text-white hover:opacity-90 transition-opacity cursor-pointer"
          @click="openDownloadModal(p.downloadUrl!)"
        >
          <FontAwesomeIcon :icon="p.icon" class="text-xs" />
          <span>{{ p.label }}</span>
          <FontAwesomeIcon :icon="['fas', 'download']" class="text-[10px] opacity-80" />
        </button>
        <span
          v-for="p in project.platforms.filter(p => !p.available)"
          :key="p.id"
          class="flex items-center gap-2 text-[13px] px-3 py-1.5 rounded-lg border border-border-lo text-dim"
        >
          <FontAwesomeIcon :icon="p.icon" class="text-xs opacity-50" />
          <span class="opacity-60">{{ p.label }}</span>
          <span class="text-[11px] opacity-40">not available</span>
        </span>
      </div>
    </div>

    <!-- No download notice for web-only projects -->
    <div v-else class="mb-6">
      <span class="inline-flex items-center gap-2 font-mono text-[11px] text-dim border border-border-lo rounded px-2.5 py-1">
        <FontAwesomeIcon :icon="['fas', 'globe']" class="text-[10px]" />
        Web service — no download required
      </span>
    </div>

    <!-- CTA -->
    <div class="flex items-center gap-3 pt-4 border-t border-border-lo">
      <a
        :href="project.siteUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full border border-border text-fg hover:border-border-hi hover:bg-hover transition-colors no-underline"
      >
        <FontAwesomeIcon :icon="['fas', 'arrow-up-right-from-square']" class="text-xs" />
        Visit website
      </a>
    </div>

  </div>

  <!-- Download modal -->
  <Teleport to="body">
    <div
      v-if="modalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      @click.self="closeModal"
    >
      <div class="bg-card border border-border rounded-lg p-8 w-[340px] max-w-[90vw] shadow-2xl text-center">

        <!-- Not yet started -->
        <template v-if="!downloadStarted">
          <div class="mb-5">
            <FontAwesomeIcon :icon="['fas', 'download']" class="text-3xl text-green mb-4" />
            <p class="text-fg font-medium mb-1">Your download is about to start</p>
            <p class="text-sm text-dim">Starting in</p>
          </div>
          <div class="text-[3rem] font-mono font-light text-green leading-none mb-6">{{ countdown }}</div>
          <button
            class="text-sm text-dim hover:text-link transition-colors underline"
            @click="closeModal"
          >Cancel</button>
        </template>

        <!-- Download triggered -->
        <template v-else>
          <div class="mb-5">
            <FontAwesomeIcon :icon="['fas', 'download']" class="text-3xl text-green mb-4" />
            <p class="text-fg font-medium mb-1">Download started!</p>
            <p class="text-sm text-dim">Check your notifications or Downloads folder.</p>
          </div>
          <a
            :href="pendingUrl"
            download
            class="block text-sm text-green hover:underline mb-4 no-underline"
            @click="closeModal"
          >
            Click here if the download didn't start
          </a>
          <button
            class="text-sm text-dim hover:text-link transition-colors"
            @click="closeModal"
          >Close</button>
        </template>

      </div>
    </div>
  </Teleport>
</template>
