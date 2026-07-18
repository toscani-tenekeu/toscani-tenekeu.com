<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Sequence: type "dev_resource_hub", pause, erase, pause, type "toscani-tenekeu", pause, erase, repeat
const WORDS = ['dev_resource_hub', 'toscani-tenekeu']
const TYPE_SPEED   = 90   // ms per character typed
const ERASE_SPEED  = 55   // ms per character erased
const PAUSE_AFTER  = 9000 // ms to hold after fully typed
const PAUSE_BEFORE = 3000 // ms to wait before typing next word

const displayed = ref('')
const showCursor = ref(true)

let timer: ReturnType<typeof setTimeout> | null = null
let cursorTimer: ReturnType<typeof setInterval> | null = null
let wordIndex = 0

function schedule(fn: () => void, delay: number) {
  timer = setTimeout(fn, delay)
}

function typeWord(word: string, charIndex: number) {
  if (charIndex <= word.length) {
    displayed.value = word.slice(0, charIndex)
    schedule(() => typeWord(word, charIndex + 1), TYPE_SPEED)
  } else {
    // Fully typed — pause, then erase
    schedule(() => eraseWord(word, word.length), PAUSE_AFTER)
  }
}

function eraseWord(word: string, charIndex: number) {
  if (charIndex >= 0) {
    displayed.value = word.slice(0, charIndex)
    schedule(() => eraseWord(word, charIndex - 1), ERASE_SPEED)
  } else {
    // Fully erased — move to next word
    wordIndex = (wordIndex + 1) % WORDS.length
    schedule(() => typeWord(WORDS[wordIndex]!, 0), PAUSE_BEFORE)
  }
}

onMounted(() => {
  // Start cursor blink
  cursorTimer = setInterval(() => {
    showCursor.value = !showCursor.value
  }, 530)

  // Start typing sequence
  schedule(() => typeWord(WORDS[0]!, 0), 300)
})

onUnmounted(() => {
  if (timer) clearTimeout(timer)
  if (cursorTimer) clearInterval(cursorTimer)
})
</script>

<template>
  <span class="typer">
    <span class="typer__text">{{ displayed }}</span><span
      class="typer__cursor"
      :class="{ 'typer__cursor--hidden': !showCursor }"
    >█</span>
  </span>
</template>

<style scoped>
.typer {
  display: inline-flex;
  align-items: baseline;
  gap: 1px;
}

.typer__text {
  white-space: nowrap;
}

.typer__cursor {
  font-size: 0.75em;
  color: var(--green);
  line-height: 1;
  transition: opacity 0.08s;
  user-select: none;
}

.typer__cursor--hidden {
  opacity: 0;
}
</style>
