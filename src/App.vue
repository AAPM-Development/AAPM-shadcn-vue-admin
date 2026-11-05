<script setup lang="ts">
import { MotionConfig } from 'motion-v'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import Loading from '@/components/loading.vue'
import { Toaster } from '@/components/ui/sonner'
import { useSystemTheme } from '@/composables/use-system-theme'
import { envError } from '@/utils/env'

useSystemTheme()

onMounted(() => {
  if (envError) {
    const flattenError = z.flattenError(envError)
    toast.error('Env error: you should check your .env file', {
      description: h(
        'pre',
        { class: 'mt-2 rounded-md bg-slate-950 p-4 text-wrap' },
        h('code', { class: 'text-white' }, JSON.stringify(flattenError, null, 2)),
      ),
      duration: 10000,
    })
  }
})
</script>

<template>
  <Toaster />

  <!-- Shared directional motion-blur filters (levels 1–5 = 0.6/1.2/2/3/4px along one axis) -->
  <svg aria-hidden="true" width="0" height="0" class="pointer-events-none absolute size-0 overflow-hidden">
    <filter id="aapm-mb-y-1" x="-2%" y="-20%" width="104%" height="140%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="0 0.6" /></filter>
    <filter id="aapm-mb-y-2" x="-2%" y="-20%" width="104%" height="140%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="0 1.2" /></filter>
    <filter id="aapm-mb-y-3" x="-2%" y="-20%" width="104%" height="140%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="0 2" /></filter>
    <filter id="aapm-mb-y-4" x="-2%" y="-20%" width="104%" height="140%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="0 3" /></filter>
    <filter id="aapm-mb-y-5" x="-2%" y="-20%" width="104%" height="140%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="0 4" /></filter>
    <filter id="aapm-mb-x-1" x="-20%" y="-2%" width="140%" height="104%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="0.6 0" /></filter>
    <filter id="aapm-mb-x-2" x="-20%" y="-2%" width="140%" height="104%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="1.2 0" /></filter>
    <filter id="aapm-mb-x-3" x="-20%" y="-2%" width="140%" height="104%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="2 0" /></filter>
    <filter id="aapm-mb-x-4" x="-20%" y="-2%" width="140%" height="104%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="3 0" /></filter>
    <filter id="aapm-mb-x-5" x="-20%" y="-2%" width="140%" height="104%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="4 0" /></filter>
  </svg>

  <!-- Subtle motion everywhere; switched off when the OS asks for reduced motion -->
  <MotionConfig reduced-motion="user">
    <Suspense>
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>

      <template #fallback>
        <Loading />
      </template>
    </Suspense>
  </MotionConfig>
</template>
