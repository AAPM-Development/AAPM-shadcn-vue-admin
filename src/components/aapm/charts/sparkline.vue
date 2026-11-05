<script setup lang="ts">
import { useElementSize } from '@vueuse/core'

import { areaPath, linearScale, linePath } from '@/lib/chart-geometry'
import { formatNumber } from '@/lib/format-id'

import ChartTooltip from './chart-tooltip.vue'

const props = withDefaults(defineProps<{
  values: number[]
  labels?: string[]
  tone?: 'brand' | 'muted' | 'accent'
  area?: boolean
  height?: number
  format?: (n: number) => string
  /** Accessible summary, e.g. "Produksi 14 hari terakhir, naik 3,2%". */
  label?: string
}>(), {
  labels: () => [],
  tone: 'brand',
  area: true,
  height: 40,
  format: (n: number) => formatNumber(n),
  label: undefined,
})

const PAD = 4
const root = useTemplateRef<HTMLElement>('root')
const { width } = useElementSize(root)

const stroke = computed(() => ({
  brand: 'var(--chart-1)',
  muted: 'var(--muted-foreground)',
  accent: 'var(--chart-3)',
}[props.tone]))

const w = computed(() => Math.max(width.value, 1))
const line = computed(() => linePath(props.values, w.value, props.height, PAD))
const fill = computed(() => props.area ? areaPath(props.values, w.value, props.height, PAD) : '')

function pointAt(index: number) {
  const min = Math.min(...props.values)
  const max = Math.max(...props.values)
  const x = props.values.length === 1
    ? w.value / 2
    : linearScale([0, props.values.length - 1], [PAD, w.value - PAD])(index)
  const y = linearScale([min, max], [props.height - PAD, PAD])(props.values[index])
  return { x, y }
}

const last = computed(() => props.values.length ? pointAt(props.values.length - 1) : null)
const hover = shallowRef<number | null>(null)
const hoverPoint = computed(() => hover.value === null ? null : pointAt(hover.value))

function onMove(event: PointerEvent) {
  if (props.values.length < 2)
    return
  const rect = (event.currentTarget as SVGElement).getBoundingClientRect()
  const ratio = (event.clientX - rect.left - PAD) / Math.max(rect.width - PAD * 2, 1)
  hover.value = Math.min(props.values.length - 1, Math.max(0, Math.round(ratio * (props.values.length - 1))))
}
</script>

<template>
  <div ref="root" class="relative w-full" :style="{ height: `${height}px` }">
    <svg
      v-if="values.length"
      :width="w" :height="height" class="block overflow-visible"
      role="img" :aria-label="label"
      @pointermove="onMove" @pointerleave="hover = null"
    >
      <path v-if="fill" :d="fill" :fill="stroke" opacity="0.1" />
      <path :d="line" fill="none" :stroke="stroke" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <line
        v-if="hoverPoint" :x1="hoverPoint.x" :x2="hoverPoint.x" :y1="0" :y2="height"
        stroke="var(--chart-axis)" stroke-width="1" opacity="0.5"
      />
      <circle
        v-if="hoverPoint ?? last" :cx="(hoverPoint ?? last)!.x" :cy="(hoverPoint ?? last)!.y" r="4"
        :fill="stroke" stroke="var(--card)" stroke-width="2"
      />
    </svg>
    <ChartTooltip v-if="hoverPoint" :x="hoverPoint.x" :y="hoverPoint.y" :visible="hover !== null">
      <div class="text-muted-foreground">
        {{ labels[hover!] ?? '' }}
      </div>
      <div class="font-semibold numeric">
        {{ format(values[hover!]) }}
      </div>
    </ChartTooltip>
  </div>
</template>
