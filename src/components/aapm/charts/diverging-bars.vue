<script setup lang="ts">
import { formatSigned } from '@/lib/format-id'

import { stagger, useChartInView } from './use-chart-inview'

/**
 * Diverging bars — polarity around a neutral midline (dataviz direction §2 "Diverging"):
 * below target grows left in --chart-3 (orange), above grows right in --chart-2 (teal); the midline
 * is the neutral axis. Bars ≤ 24px, 4px rounded data end, square at the midline; value labels sit at
 * the bar tip in text tokens. Hover/focus dims the other rows.
 */
const props = withDefaults(defineProps<{
  items: { label: string, value: number }[]
  label: string
  /** Formats a signed value, e.g. "+0,4 pt". */
  format?: (n: number) => string
  /** Symmetric scale limit; defaults to the largest |value|. */
  limit?: number
  negativeLabel?: string
  positiveLabel?: string
}>(), {
  format: (n: number) => formatSigned(n, 1, ' pt'),
  limit: undefined,
  negativeLabel: 'Di bawah standar',
  positiveLabel: 'Di atas standar',
})

const root = useTemplateRef<HTMLElement>('root')
const inView = useChartInView(root)
const max = computed(() => props.limit ?? Math.max(0.0001, ...props.items.map(i => Math.abs(i.value))))
const pct = (v: number) => `${(Math.min(Math.abs(v), max.value) / max.value) * 50}%`
const active = shallowRef<number | null>(null)
</script>

<template>
  <div ref="root" class="grid gap-3">
    <div class="grid grid-cols-2 text-[11px] text-muted-foreground">
      <span class="flex items-center gap-1.5"><span class="size-2.5 rounded-[3px] bg-chart-3" aria-hidden="true" />{{ negativeLabel }}</span>
      <span class="flex items-center justify-end gap-1.5">{{ positiveLabel }}<span class="size-2.5 rounded-[3px] bg-chart-2" aria-hidden="true" /></span>
    </div>
    <ol class="grid gap-1.5" :aria-label="label">
      <li
        v-for="(item, i) in items" :key="item.label"
        data-aapm-bar-row tabindex="0"
        class="-mx-2 grid grid-cols-[minmax(0,5.5rem)_minmax(0,1fr)_max-content] items-center gap-3 rounded-lg px-2 py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        :data-active="active === i || undefined"
        :aria-label="`${item.label}: ${format(item.value)}`"
        @pointerenter="active = i" @pointerleave="active = null" @focus="active = i" @blur="active = null"
      >
        <span class="truncate text-sm font-medium" :title="item.label">{{ item.label }}</span>
        <div class="relative h-6" :style="{ opacity: active === null || active === i ? 1 : 'var(--chart-dim)' }">
          <!-- neutral midline -->
          <span class="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-(--chart-axis) opacity-40" aria-hidden="true" />
          <span
            data-aapm-diverge
            class="absolute top-1/2 h-3.5 -translate-y-1/2"
            :class="item.value < 0 ? 'right-1/2 origin-right rounded-l-[4px] bg-chart-3' : 'left-1/2 origin-left rounded-r-[4px] bg-chart-2'"
            :style="{ 'width': pct(item.value), 'scale': inView ? undefined : '0 1', '--aapm-delay': `${stagger(i)}s` }"
          />
        </div>
        <span class="text-right text-xs font-semibold numeric">{{ format(item.value) }}</span>
      </li>
    </ol>
  </div>
</template>
