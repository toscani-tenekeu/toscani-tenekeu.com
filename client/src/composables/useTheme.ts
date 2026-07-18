import { ref } from 'vue'

const KEY = 'tt-theme'
export const isDark = ref(true)

function apply(dark: boolean) {
  isDark.value = dark
  document.documentElement.classList.toggle('light', !dark)
  try { localStorage.setItem(KEY, dark ? 'dark' : 'light') } catch { /* noop */ }
}

export function toggle() {
  apply(!isDark.value)
}

export function initTheme() {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'light') { apply(false); return }
    if (saved === 'dark')  { apply(true);  return }
    apply(window.matchMedia('(prefers-color-scheme: dark)').matches)
  } catch {
    apply(true)
  }
}

export function useTheme() {
  return { isDark, toggle, initTheme }
}
