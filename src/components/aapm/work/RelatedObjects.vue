<script setup lang="ts">
import type { SemanticState } from '@/design-system/states'

import StateChip from '@/components/aapm/tone/state-chip.vue'

/** Related objects (Ecosystem UI-DAT-011): the relationship is the consumer's; this lists and links. */
export interface RelatedItem { label: string, ref: string, state?: SemanticState, to?: string, meta?: string }
defineProps<{ items: RelatedItem[] }>()
</script>

<template>
  <ul v-if="items.length" class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,15rem),1fr))] gap-2" aria-label="Dokumen terkait">
    <li v-for="item in items" :key="item.ref" class="grid min-w-0 content-start gap-1.5 rounded-lg border bg-card p-3">
      <p class="text-xs text-muted-foreground wrap-anywhere">
        {{ item.label }}
      </p>
      <component :is="item.to ? 'RouterLink' : 'span'" :to="item.to" class="font-mono text-sm font-semibold wrap-anywhere" :class="item.to && 'text-primary underline-offset-2 hover:underline'">
        {{ item.ref }}
      </component>
      <div class="flex flex-wrap items-center gap-2">
        <StateChip v-if="item.state" :state="item.state" />
        <span v-if="item.meta" class="text-xs text-muted-foreground">{{ item.meta }}</span>
      </div>
    </li>
  </ul>
  <p v-else class="text-sm text-muted-foreground">
    Belum ada dokumen terkait.
  </p>
</template>
