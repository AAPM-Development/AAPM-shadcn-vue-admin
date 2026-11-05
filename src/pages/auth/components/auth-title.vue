<script setup lang="ts">
import AnimatedBrandMark from '@/components/aapm/animated-brand-mark.vue'
import { AUTH_CONFIG } from '@/config/auth.ts'

withDefaults(defineProps<{ onDark?: boolean, paused?: boolean }>(), { onDark: false })
</script>

<template>
  <!-- The "AAPM Cloud ERP" lockup is the title; the text stays for assistive tech -->
  <h1 class="flex items-center justify-center">
    <AnimatedBrandMark variant="erp" :on-dark="onDark" :paused="paused" class="w-[min(72vw,18rem)]" :label="AUTH_CONFIG.title" />
  </h1>
</template>
