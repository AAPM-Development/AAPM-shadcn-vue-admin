<script setup lang="ts">
import { CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

defineProps<{
  overline: string
  title: string
  description?: string
}>()
</script>

<template>
  <!-- Flex-wrap header: the title block keeps ≥ 16rem; actions wrap below it on narrow cards -->
  <CardHeader class="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
    <div class="grid min-w-0 flex-[1_1_16rem] gap-1">
      <p class="eyebrow text-muted-foreground">
        {{ overline }}
      </p>
      <CardTitle class="text-lg">
        {{ title }}
      </CardTitle>
      <CardDescription v-if="description" class="text-pretty">
        {{ description }}
      </CardDescription>
    </div>
    <CardAction v-if="$slots.action" class="max-w-full flex-[0_1_auto]">
      <slot name="action" />
    </CardAction>
  </CardHeader>
</template>
