<template>
  <div class="bg-navy-700 border border-white/5 rounded-2xl overflow-hidden">
    <!-- Header -->
    <button
      @click="isOpen = !isOpen"
      class="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors"
    >
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-brand/15 flex items-center justify-center text-brand-light">
          <slot name="icon" />
        </div>
        <div class="text-left">
          <h3 class="text-base font-semibold text-white">{{ title }}</h3>
          <p v-if="subtitle" class="text-xs text-white/40 mt-0.5">{{ subtitle }}</p>
        </div>
      </div>
      <svg
        class="w-5 h-5 text-white/30 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Body -->
    <div v-show="isOpen" class="px-5 pb-5 border-t border-white/5">
      <div class="pt-5">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  subtitle?: string
  defaultOpen?: boolean
}>()

const isOpen = ref(props.defaultOpen ?? true)
</script>
