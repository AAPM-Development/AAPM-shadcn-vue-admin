<script setup lang="ts">
import { cn } from '@/lib/utils'

import type { LayoutHeaderProps } from './types'

defineProps<LayoutHeaderProps>()
</script>

<template>
  <header
    :class="cn(
      'flex flex-col gap-4 py-3 md:flex-row md:items-end md:justify-between',
      sticky ? 'sticky top-14 z-30 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70' : '',
    )"
  >
    <div class="min-w-0 space-y-1.5 wrap-anywhere">
      <p v-if="overline" class="eyebrow text-muted-foreground">
        {{ overline }}
      </p>
      <h1 class="text-2xl font-semibold tracking-title text-foreground sm:text-[1.75rem] sm:leading-[2.1875rem]">
        {{ title }}
      </h1>
      <p v-if="description" class="max-w-[65ch] text-sm text-muted-foreground text-pretty">
        {{ description }}
      </p>
    </div>

    <div class="flex min-w-0 flex-wrap items-center gap-2 [&_button]:h-auto [&_button]:min-h-9 [&_button]:max-w-full [&_button]:whitespace-normal [&_button]:wrap-anywhere">
      <slot name="actions" />
    </div>
  </header>
</template>
