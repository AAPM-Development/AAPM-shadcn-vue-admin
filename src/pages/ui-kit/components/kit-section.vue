<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

defineProps<{
  id: string
  eyebrow: string
  title: string
  description?: string
}>()
</script>

<template>
  <Card :id="id" class="min-w-0 scroll-mt-20 shadow-none">
    <CardHeader class="min-w-0 gap-1 wrap-anywhere">
      <p class="eyebrow text-muted-foreground">
        {{ eyebrow }}
      </p>
      <CardTitle class="text-lg">
        {{ title }}
      </CardTitle>
      <CardDescription v-if="description" class="max-w-[70ch] text-pretty">
        {{ description }}
      </CardDescription>
    </CardHeader>
    <CardContent class="grid min-w-0 grid-cols-1 gap-6">
      <slot />
    </CardContent>
  </Card>
</template>
