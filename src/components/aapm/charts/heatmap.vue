<script setup lang="ts">
import { bucket } from '@/lib/chart-geometry'
import { formatNumber } from '@/lib/format-id'

import ChartTooltip from './chart-tooltip.vue'
import { useChartInView } from './use-chart-inview'

const props = withDefaults(defineProps<{
  rows: string[]
  cols: string[]
  /** values[row][col] */
  values: number[][]
  /** Ascending thresholds → sequential steps --seq-1…--seq-5. Below the first = --seq-0. */
  thresholds: number[]
  format?: (n: number) => string
  unit?: string
  label: string
  /** `good`: more is better (green ramp). `bad`: more is worse — mortality, rejects (red ramp). */
  ramp?: 'good' | 'bad'
}>(), {
  ramp: 'good',
  format: (n: number) => formatNumber(n, 2),
  unit: '',
})

const root = useTemplateRef<HTMLElement>('root')
useChartInView(root)
const hover = shallowRef<{ r: number, c: number, x: number, y: number } | null>(null)

const valueAt = (r: number, c: number) => props.values[r]?.[c] ?? 0
function step(v: number) {
  const n = Math.min(5, bucket(v, props.thresholds))
  return n === 0 ? 'var(--seq-0)' : `var(--seq-${props.ramp === 'bad' ? 'bad-' : ''}${n})`
}

function show(event: Event, r: number, c: number) {
  const box = root.value?.getBoundingClientRect()
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  if (box)
    hover.value = { r, c, x: rect.left - box.left + rect.width / 2, y: rect.top - box.top }
}

const legend = computed(() => [
  { color: 'var(--seq-0)', label: `< ${props.format(props.thresholds[0] ?? 0)}` },
  ...props.thresholds.map((t, i) => ({ color: `var(--seq-${props.ramp === 'bad' ? 'bad-' : ''}${Math.min(5, i + 1)})`, label: `≥ ${props.format(t)}` })),
])
</script>

<template>
  <div ref="root" class="relative grid gap-3">
    <div class="min-w-0">
      <div
        class="grid gap-[2px] text-xs"
        :style="{ gridTemplateColumns: `minmax(0, max-content) repeat(${cols.length}, minmax(0, 1fr))` }"
        role="grid" :aria-label="label"
      >
        <div />
        <div v-for="(col, c) in cols" :key="col" data-aapm-axis-label :data-active="hover?.c === c || undefined" :title="col" class="min-w-0 truncate pb-1 text-center text-[11px] text-muted-foreground numeric">
          {{ col }}
        </div>
        <template v-for="(row, r) in rows" :key="row">
          <div data-aapm-axis-label :data-active="hover?.r === r || undefined" :title="row" class="flex min-w-0 max-w-[7.5rem] items-center pr-2 font-medium text-foreground/80">
            <span class="truncate">{{ row }}</span>
          </div>
          <div
            v-for="(col, c) in cols" :key="col"
            role="gridcell" tabindex="0"
            data-aapm-cell
            :data-cross="hover && (hover.r === r || hover.c === c) && !(hover.r === r && hover.c === c) ? '' : undefined"
            class="relative h-7 rounded-[4px] outline-none"
            :style="{ 'background': step(valueAt(r, c)), '--aapm-d': Math.min(r + c, 40) }"
            :aria-label="`${row}, ${col}: ${format(valueAt(r, c))} ${unit}`"
            @pointerenter="show($event, r, c)" @pointerleave="hover = null"
            @focus="show($event, r, c)" @blur="hover = null"
          />
        </template>
      </div>
    </div>
    <ChartTooltip v-if="hover" :x="hover.x" :y="hover.y" :visible="!!hover">
      <div class="text-muted-foreground">
        {{ rows[hover.r] }} · {{ cols[hover.c] }}
      </div>
      <div class="font-semibold numeric">
        {{ format(valueAt(hover.r, hover.c)) }} {{ unit }}
      </div>
    </ChartTooltip>
    <div class="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
      <span class="eyebrow">Skala</span>
      <span v-for="item in legend" :key="item.label" class="flex items-center gap-1.5">
        <span class="size-3 rounded-[3px] border border-border/60" :style="{ background: item.color }" />
        <span class="numeric">{{ item.label }}</span>
      </span>
    </div>
  </div>
</template>
