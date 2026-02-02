<template>
  <div class="flex min-h-screen bg-navy-900">
    <!-- Sidebar -->
    <aside class="w-64 bg-navy-800 border-r border-white/5 flex flex-col">
      <!-- Logo -->
      <div class="p-6 border-b border-white/5">
        <h1 class="text-xl font-bold text-white">Sales Admin</h1>
        <p class="text-xs text-white/40 mt-1">Extension Dashboard</p>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 space-y-1">
        <NuxtLink
          to="/"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
          :class="$route.path === '/' ? 'bg-brand/20 text-brand-light' : 'text-white/60 hover:text-white hover:bg-white/5'"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
          Dashboard
        </NuxtLink>
      </nav>

      <!-- User section -->
      <div v-if="authStore.user" class="p-4 border-t border-white/5">
        <div class="flex items-center gap-3 mb-3">
          <img
            :src="authStore.user.avatarUrl"
            :alt="authStore.user.name"
            class="w-8 h-8 rounded-full"
          />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-white truncate">{{ authStore.user.name }}</p>
            <p class="text-xs text-white/40 truncate">{{ authStore.user.email }}</p>
          </div>
          <span
            class="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full"
            :class="authStore.isAdmin ? 'bg-brand/20 text-brand-light' : 'bg-white/10 text-white/50'"
          >
            {{ authStore.user.role }}
          </span>
        </div>
        <button
          @click="authStore.logout()"
          class="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-all"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 overflow-auto">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
</script>
