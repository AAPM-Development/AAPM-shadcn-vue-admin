<script setup lang="ts">
import { CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

defineProps<{
  overline: string
  title: string
  description?: string
}>()
</script>

<template>
  <CardHeader class="gap-1">
    <p class="eyebrow text-muted-foreground">
      {{ overline }}
    </p>
    <CardTitle class="text-lg">
      {{ title }}
    </CardTitle>
    <CardDescription v-if="description" class="text-pretty">
      {{ description }}
    </CardDescription>
    <CardAction v-if="$slots.action">
      <slot name="action" />
    </CardAction>
  </CardHeader>
</template>
