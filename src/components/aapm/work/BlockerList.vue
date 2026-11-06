<script setup lang="ts">
import type { ActionRef, Blocker } from '@/design-system/contracts'

import AapmIcon from '@/components/aapm/icon/AapmIcon.vue'
import { Button } from '@/components/ui/button'

import { wrapButtonClass } from './wrap'

/** Ordered blockers (order is the consumer's). Each says what blocks, why, and how to resolve it. */
defineProps<{ blockers: Blocker[] }>()
const emit = defineEmits<{ open: [source: ActionRef] }>()
</script>

<template>
  <ol v-if="blockers.length" class="grid gap-2" aria-label="Pemblokir">
    <li v-for="b in blockers" :key="b.code" data-tone="red" class="flex min-w-0 gap-3 rounded-lg border border-(--tone-border) bg-(--tone-bg) p-3">
      <AapmIcon name="ban" :size="16" class="mt-0.5 shrink-0 text-(--tone-fg)" />
      <div class="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)] gap-1 wrap-anywhere">
        <p data-blocker-title class="text-sm font-semibold">
          {{ b.title }}
        </p>
        <p class="text-sm text-muted-foreground">
          {{ b.reason }}
        </p>
        <p v-if="b.resolution" class="text-sm">
          <span class="font-medium">Cara menyelesaikan:</span> {{ b.resolution }}
        </p>
        <div v-if="b.source">
          <Button size="sm" variant="outline" class="mt-1" :class="[wrapButtonClass('sm')]" @click="emit('open', b.source)">
            {{ b.source.label }}
          </Button>
        </div>
      </div>
    </li>
  </ol>
</template>
