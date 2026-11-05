<script setup lang="ts">
import { SITE_CONFIG } from '@/config/site'

/**
 * Official AAPM mark / lockup. Both masters are rendered and swapped with the `dark`
 * variant — no CSS inversion, no flash before color mode resolves.
 */
const props = withDefaults(defineProps<{
  /** icon = rooster mark · logo = company lockup · erp / erp-stacked = "AAPM Cloud ERP" lockups */
  variant?: 'icon' | 'logo' | 'erp' | 'erp-stacked'
  /** Force the white master (e.g. on the green bumper) regardless of colour mode. */
  onDark?: boolean
  alt?: string
}>(), {
  variant: 'icon',
  onDark: false,
  alt: 'AAPM — PT Agung Abadi Putra Mandiri',
})

const src = computed(() => ({
  'icon': SITE_CONFIG.logo,
  'logo': SITE_CONFIG.lockup,
  'erp': SITE_CONFIG.erp.horizontal,
  'erp-stacked': SITE_CONFIG.erp.stacked,
}[props.variant]))
/** Intrinsic size of each master's viewBox, so the box is reserved before the SVG loads (no layout shift, #121). */
const size = computed(() => ({
  'icon': [79, 86],
  'logo': [300, 86],
  'erp': [114, 40],
  'erp-stacked': [70, 29],
}[props.variant]))
</script>

<template>
  <span class="inline-flex shrink-0 items-center">
    <img v-if="onDark" :src="src.dark" :alt="alt" :width="size[0]" :height="size[1]" class="block h-full w-auto" draggable="false">
    <template v-else>
      <img :src="src.light" :alt="alt" :width="size[0]" :height="size[1]" class="block h-full w-auto dark:hidden" draggable="false">
      <img :src="src.dark" :alt="alt" :width="size[0]" :height="size[1]" class="hidden h-full w-auto dark:block" draggable="false">
    </template>
  </span>
</template>
