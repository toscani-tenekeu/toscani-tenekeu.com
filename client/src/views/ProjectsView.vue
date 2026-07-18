<script setup lang="ts">
import ProjectCard from '../components/ProjectCard.vue'
import type { Project } from '../components/ProjectCard.vue'

const projects: Project[] = [
  {
    name: 'Time vs Code',
    type: 'Mobile Application',
    description:
      'A mobile learning app for programming enthusiasts. Progress at your own pace with coding exercises, challenges, and progress tracking.',
    siteUrl: 'https://time-vs-code.toscani-tenekeu.com',
    platforms: [
      {
        id: 'android',
        label: 'Android',
        icon: ['fab', 'android'],
        available: true,
        downloadUrl: '/download/time-vs-code/android/v1/Time_vs_Code-1.0.0.apk',
      },
      { id: 'ios',     label: 'iOS',     icon: ['fab', 'apple'],   available: false },
      { id: 'windows', label: 'Windows', icon: ['fab', 'windows'], available: false },
      { id: 'linux',   label: 'Linux',   icon: ['fab', 'linux'],   available: false },
      { id: 'web',     label: 'Web',     icon: ['fas', 'globe'],   available: false },
      { id: 'macos',   label: 'macOS',   icon: ['fab', 'apple'],   available: false },
    ],
  },
  {
    name: 'KmerHosting',
    type: 'Web Hosting Platform',
    description:
      'A web hosting platform with solutions for every need: shared hosting, VPS, bare metal servers, and free SSL certificates via Let\'s Encrypt.',
    siteUrl: 'https://kmerhosting.com',
    platforms: [],
    features: ['VPS', 'Shared Hosting', 'Bare Metal', 'Free SSL — Let\'s Encrypt', 'High Availability'],
  },
  {
    name: 'Stint',
    type: 'Mobile Application',
    description:
      'A mobile app to create internship reports and export them as DOCX or PDF, with an integrated AI assistant to help you write faster.',
    siteUrl: 'https://stint.toscani-tenekeu.com',
    platforms: [
      {
        id: 'android',
        label: 'Android',
        icon: ['fab', 'android'],
        available: true,
        downloadUrl: '/download/stint/android/v1/Stint-1.0.0.apk',
      },
      { id: 'ios',     label: 'iOS',     icon: ['fab', 'apple'],   available: false },
      { id: 'windows', label: 'Windows', icon: ['fab', 'windows'], available: false },
      { id: 'linux',   label: 'Linux',   icon: ['fab', 'linux'],   available: false },
      { id: 'web',     label: 'Web',     icon: ['fas', 'globe'],   available: false },
      { id: 'macos',   label: 'macOS',   icon: ['fab', 'apple'],   available: false },
    ],
  },
]
</script>

<template>
  <div class="py-14">
    <div class="max-w-[1100px] mx-auto px-6">

      <!-- Page header -->
      <div class="mb-8">
        <h1 class="text-[clamp(1.6rem,4vw,2.4rem)] font-light text-fg -tracking-wide leading-tight mb-2">
          Projects
        </h1>
        <p class="text-sm text-fg2 leading-relaxed">
          Apps and platforms designed and built from scratch.
        </p>
      </div>

      <!-- Project cards -->
      <div class="flex flex-col gap-5">
        <ProjectCard
          v-for="project in projects"
          :key="project.name"
          :project="project"
        />
      </div>

    </div>
  </div>
</template>
