<script setup lang="ts">
import { formatNumber } from '@/lib/format-id'

import type { BarListItem } from './types'

const props = withDefaults(defineProps<{
  items: BarListItem[]
  max?: number
  format?: (n: number) => string
  unit?: string
  label: string
}>(), {
  max: undefined,
  format: (n: number) => formatNumber(n),
  unit: '',
})

const ceiling = computed(() => props.max ?? Math.max(1, ...props.items.map(i => i.value)))
const active = shallowRef<number | null>(null)
</script>

<template>
  <ol class="grid gap-3.5" :aria-label="label">
    <li
      v-for="(item, i) in items" :key="item.label"
      class="grid gap-1.5"
      @pointerenter="active = i" @pointerleave="active = null"
    >
      <div class="flex items-baseline justify-between gap-3 text-sm">
        <span class="flex min-w-0 items-baseline gap-2">
          <span class="w-5 shrink-0 text-xs text-muted-foreground numeric">{{ String(i + 1).padStart(2, '0') }}</span>
          <span class="truncate font-medium">{{ item.label }}</span>
          <span v-if="item.meta" class="hidden truncate text-xs text-muted-foreground sm:inline">{{ item.meta }}</span>
          <span v-if="item.flag" class="shrink-0 rounded-md bg-warning-soft px-1.5 py-px text-[11px] font-semibold text-warning">{{ item.flag }}</span>
        </span>
        <span class="shrink-0 font-semibold numeric">
          {{ format(item.value) }}<span class="ml-1 text-xs font-normal text-muted-foreground">{{ unit }}</span>
        </span>
      </div>
      <div class="ml-7 h-2.5 overflow-hidden rounded-full bg-seq-0">
        <div
          class="h-full rounded-full bg-chart-1 transition-[width,opacity] duration-500 ease-emphasis"
          :style="{ width: `${(Math.max(0, item.value) / ceiling) * 100}%`, opacity: active === null || active === i ? 1 : 0.45 }"
        />
      </div>
    </li>
  </ol>
</template>
