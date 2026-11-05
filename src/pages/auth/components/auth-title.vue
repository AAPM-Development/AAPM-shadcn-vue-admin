<script setup lang="ts">
import BrandMark from '@/components/aapm/brand-mark.vue'
import { AUTH_CONFIG } from '@/config/auth.ts'
</script>

<template>
  <h1 class="flex items-center gap-3 text-xl font-semibold tracking-title">
    <BrandMark class="h-9" />
    <span>{{ AUTH_CONFIG.title }}</span>
  </h1>
</template>
