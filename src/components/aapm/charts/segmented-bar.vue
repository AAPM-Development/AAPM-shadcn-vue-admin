<script setup lang="ts">
import { formatNumber, formatPercent } from '@/lib/format-id'

import type { DonutItem } from './types'

import ChartTooltip from './chart-tooltip.vue'
import { stagger, useChartInView } from './use-chart-inview'

/**
 * Segmented bar — one whole split into parts (dataviz direction §3; dataviz "Figures").
 * thin: 8px, fully rounded ends, no text. tall: 28px blocks with 4px corners, the share printed
 * inside when the block is wide enough (≥ 12%); narrower blocks keep their value in the tooltip
 * and the legend. 2px surface gaps separate parts; hover/focus dims the rest and shows a readout.
 */
const props = withDefaults(defineProps<{
  items: DonutItem[]
  label: string
  variant?: 'thin' | 'tall'
  unit?: string
  format?: (n: number) => string
  legend?: boolean
}>(), {
  variant: 'thin',
  unit: '',
  format: (n: number) => formatNumber(n),
  legend: true,
})

const root = useTemplateRef<HTMLElement>('root')
const inView = useChartInView(root)
const total = computed(() => props.items.reduce((s, i) => s + Math.max(0, i.value), 0))
const parts = computed(() => props.items.filter(i => i.value > 0))
const share = (v: number) => (total.value ? (v / total.value) * 100 : 0)
const active = shallowRef<number | null>(null)
const tip = shallowRef<{ x: number, y: number } | null>(null)
const summary = computed(() => `${props.label}: ${parts.value.map(p => `${p.label} ${formatPercent(share(p.value), 0)}`).join(', ')}`)

function show(event: Event, i: number) {
  const box = root.value?.getBoundingClientRect()
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  active.value = i
  if (box)
    tip.value = { x: rect.left - box.left + rect.width / 2, y: rect.top - box.top }
}
function hide() {
  active.value = null
  tip.value = null
}
</script>

<template>
  <div ref="root" class="relative grid gap-2.5">
    <div
      class="flex w-full gap-[2px]" :class="variant === 'tall' ? 'h-7' : 'h-2'"
      role="img" :aria-label="summary"
    >
      <div
        v-for="(part, i) in parts" :key="part.label"
        data-aapm-segment
        class="relative min-w-[3px] origin-left"
        :class="variant === 'tall' ? 'rounded-[4px]' : 'first:rounded-l-full last:rounded-r-full'"
        :style="{
          'flexGrow': part.value,
          'flexBasis': 0,
          'background': part.color,
          'opacity': active === null || active === i ? 1 : 'var(--chart-dim)',
          '--aapm-i': i,
          '--aapm-delay': `${stagger(i, 0.06)}s`,
          'scale': inView ? undefined : '0 1',
        }"
        :aria-label="`${part.label}: ${format(part.value)} ${unit}, ${formatPercent(share(part.value), 1)}`"
        @pointerenter="show($event, i)" @pointerleave="hide"
      />
    </div>
    <ChartTooltip v-if="tip && active !== null" :x="tip.x" :y="tip.y" :visible="true">
      <div class="text-sm font-semibold numeric">
        {{ formatPercent(share(parts[active]!.value), 1) }}
      </div>
      <div class="text-muted-foreground">
        {{ parts[active]!.label }} · {{ format(parts[active]!.value) }} {{ unit }}
      </div>
    </ChartTooltip>
    <ul v-if="legend" class="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
      <li
        v-for="(part, i) in parts" :key="part.label" tabindex="0"
        class="-mx-1 flex min-h-6 min-w-0 max-w-full flex-wrap items-center gap-1.5 rounded-md px-1 outline-none wrap-anywhere focus-visible:ring-2 focus-visible:ring-ring"
        :class="active === i ? 'text-foreground' : ''"
        @pointerenter="active = i" @pointerleave="active = null" @focus="active = i" @blur="active = null"
      >
        <span class="size-2.5 rounded-[3px]" :style="{ background: part.color }" aria-hidden="true" />
        <span>{{ part.label }}</span>
        <span class="font-semibold text-foreground numeric">{{ formatPercent(share(part.value), 0) }}</span>
      </li>
    </ul>
  </div>
</template>
