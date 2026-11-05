<script setup lang="ts">
import { SITE_CONFIG } from '@/config/site'

/**
 * Official AAPM mark / lockup. Both masters are rendered and swapped with the `dark`
 * variant — no CSS inversion, no flash before color mode resolves.
 */
withDefaults(defineProps<{
  variant?: 'icon' | 'logo'
  alt?: string
}>(), {
  variant: 'icon',
  alt: 'AAPM — PT Agung Abadi Putra Mandiri',
})
</script>

<template>
  <span class="inline-flex shrink-0 items-center">
    <img
      :src="variant === 'icon' ? SITE_CONFIG.logo.light : SITE_CONFIG.lockup.light"
      :alt="alt"
      class="block h-full w-auto dark:hidden"
      draggable="false"
    >
    <img
      :src="variant === 'icon' ? SITE_CONFIG.logo.dark : SITE_CONFIG.lockup.dark"
      :alt="alt"
      class="hidden h-full w-auto dark:block"
      draggable="false"
    >
  </span>
</template>
