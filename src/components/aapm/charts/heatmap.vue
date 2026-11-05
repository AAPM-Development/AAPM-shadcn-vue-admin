<script setup lang="ts">
import { bucket } from '@/lib/chart-geometry'
import { formatNumber } from '@/lib/format-id'

import ChartTooltip from './chart-tooltip.vue'

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
}>(), {
  format: (n: number) => formatNumber(n, 2),
  unit: '',
})

const root = useTemplateRef<HTMLElement>('root')
const hover = shallowRef<{ r: number, c: number, x: number, y: number } | null>(null)

const valueAt = (r: number, c: number) => props.values[r]?.[c] ?? 0
const step = (v: number) => `var(--seq-${Math.min(5, bucket(v, props.thresholds))})`

function show(event: Event, r: number, c: number) {
  const box = root.value?.getBoundingClientRect()
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  if (box)
    hover.value = { r, c, x: rect.left - box.left + rect.width / 2, y: rect.top - box.top }
}

const legend = computed(() => [
  { color: 'var(--seq-0)', label: `< ${props.format(props.thresholds[0] ?? 0)}` },
  ...props.thresholds.map((t, i) => ({ color: `var(--seq-${Math.min(5, i + 1)})`, label: `≥ ${props.format(t)}` })),
])
</script>

<template>
  <div ref="root" class="relative grid gap-3">
    <div class="overflow-x-auto pb-1">
      <div
        class="grid min-w-[520px] gap-[2px] text-xs"
        :style="{ gridTemplateColumns: `minmax(4.5rem, auto) repeat(${cols.length}, minmax(0, 1fr))` }"
        role="grid" :aria-label="label"
      >
        <div />
        <div v-for="col in cols" :key="col" class="pb-1 text-center text-[11px] text-muted-foreground numeric">
          {{ col }}
        </div>
        <template v-for="(row, r) in rows" :key="row">
          <div class="flex items-center pr-2 font-medium text-foreground/80">
            {{ row }}
          </div>
          <div
            v-for="(col, c) in cols" :key="col"
            role="gridcell" tabindex="0"
            class="h-7 rounded-[4px] outline-none ring-ring transition-[transform,box-shadow] duration-150 ease-aapm hover:scale-[1.08] focus-visible:ring-2"
            :style="{ background: step(valueAt(r, c)) }"
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
