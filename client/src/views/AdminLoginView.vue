<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { adminLogin, getAdminSession } from '../services/cms'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const checking = ref(true)

onMounted(async () => {
  try {
    const session = await getAdminSession()
    if (session.authenticated) {
      router.replace('/admin')
      return
    }
  } catch {
    error.value = 'Unable to reach the administration service'
  } finally {
    checking.value = false
  }
})

async function submit() {
  loading.value = true
  error.value = ''
  try {
    const session = await adminLogin({ email: email.value, password: password.value })
    if (session.authenticated) {
      router.replace('/admin')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="py-14">
    <div class="max-w-[520px] mx-auto px-6">
      <div class="border border-border rounded-lg bg-card p-6 sm:p-8">
        <div class="mb-6">
          <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-dim mb-2">Private access</p>
          <h1 class="text-[2rem] font-light text-fg -tracking-wide leading-tight">Admin sign in</h1>
          <p class="text-sm text-fg2 leading-relaxed mt-2">Use the credentials stored in your <span class="font-mono">.env</span> file.</p>
        </div>

        <form class="grid gap-4" @submit.prevent="submit">
          <div class="grid gap-2">
            <label class="text-xs uppercase tracking-[0.18em] text-dim">Email</label>
            <input v-model="email" type="email" class="bg-bg border border-border rounded-lg px-4 py-3 text-sm text-fg outline-none focus:border-green/50" placeholder="Authorized people only" required />
          </div>
          <div class="grid gap-2">
            <label class="text-xs uppercase tracking-[0.18em] text-dim">Password</label>
            <input v-model="password" type="password" class="bg-bg border border-border rounded-lg px-4 py-3 text-sm text-fg outline-none focus:border-green/50" placeholder="••••••••" required />
          </div>

          <p v-if="error" class="text-sm text-error border border-error/20 bg-error/5 rounded-lg px-4 py-3">
            {{ error }}
          </p>

          <button type="submit" class="cursor-pointer inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-full border border-green bg-green text-white hover:opacity-90 transition-opacity no-underline" :disabled="loading || checking">
            {{ loading ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
