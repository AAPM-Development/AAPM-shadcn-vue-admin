<script setup lang="ts">
import { useElementSize } from '@vueuse/core'

import { linearScale, smoothAreaPath, smoothLinePath, sparkDomain } from '@/lib/chart-geometry'
import { formatNumber } from '@/lib/format-id'

import ChartTooltip from './chart-tooltip.vue'
import { useChartInView } from './use-chart-inview'

/**
 * Sparkline (dataviz direction §4–5): a smooth monotone curve in the metric's own hue.
 * An explicit comparison period can distinguish history by colour. A gradient wash sits
 * under the uniform 2px line, and the latest point breathes. Optional extremes mark
 * the period's high and low. Hover: crosshair + value-first tooltip.
 */
const props = withDefaults(defineProps<{
  values: number[]
  labels?: string[]
  tone?: 'brand' | 'muted' | 'accent'
  /** Any CSS colour (normally a categorical token, e.g. `var(--chart-2)`); overrides `tone`. */
  color?: string
  area?: boolean
  /** Pixels, or `'fill'` to take the height of its container (min 48px). */
  height?: number | 'fill'
  /** Optional, explicit comparison period. Default 0 keeps a uniform line. */
  current?: number
  /** Mark the highest and lowest point. */
  extremes?: boolean
  format?: (n: number) => string
  /** Unit shown after the value in the callout (e.g. "kg", "%"). */
  unit?: string
  /** Unit for the change line; defaults to `unit` (use "pt" for percentage metrics). */
  deltaUnit?: string
  /** Callout also shows the change against the previous point. */
  compare?: boolean
  /** Callout wording for the previous point, e.g. "hari sebelumnya". */
  compareLabel?: string
  /** Accessible summary, e.g. "Produksi 14 hari terakhir, naik 3,2%". */
  label?: string
}>(), {
  labels: () => [],
  tone: 'brand',
  color: undefined,
  area: true,
  height: 40,
  current: undefined,
  extremes: false,
  format: (n: number) => formatNumber(n),
  unit: '',
  deltaUnit: undefined,
  compare: false,
  compareLabel: 'titik sebelumnya',
  label: undefined,
})

const PAD = 4
const root = useTemplateRef<HTMLElement>('root')
const { width, height: boxHeight } = useElementSize(root)
const h = computed(() => (props.height === 'fill' ? Math.max(boxHeight.value, 48) : props.height))
useChartInView(root)
const uid = useId()
const gradientId = `aapm-spark-g-${uid}`
const clipId = `aapm-spark-c-${uid}`

const stroke = computed(() => props.color ?? ({
  brand: 'var(--chart-1)',
  muted: 'var(--muted-foreground)',
  accent: 'var(--chart-3)',
}[props.tone]))
const history = computed(() => `color-mix(in oklab, ${stroke.value} calc(var(--chart-history) * 100%), transparent)`)

const w = computed(() => Math.max(width.value, 1))
/** Padded domain: noise and one-day dips keep their real size instead of filling the height. */
const domain = computed(() => sparkDomain(props.values))
const line = computed(() => smoothLinePath(props.values, w.value, h.value, PAD, domain.value))
const fill = computed(() => props.area ? smoothAreaPath(props.values, w.value, h.value, PAD, domain.value) : '')

function pointAt(index: number) {
  const [min, max] = domain.value
  const x = props.values.length === 1
    ? w.value / 2
    : linearScale([0, props.values.length - 1], [PAD, w.value - PAD])(index)
  const y = linearScale([min, max], [h.value - PAD, PAD])(props.values[index])
  return { x, y }
}

/** Never invent an unexplained "current period" for an otherwise uniform time series. */
const currentCount = computed(() => props.current ?? 0)
const split = computed(() => {
  const n = props.values.length
  if (n < 3 || currentCount.value <= 0 || currentCount.value >= n)
    return null
  return pointAt(n - currentCount.value).x
})

const extremePoints = computed(() => {
  if (!props.extremes || props.values.length < 3)
    return []
  const hi = props.values.indexOf(Math.max(...props.values))
  const lo = props.values.indexOf(Math.min(...props.values))
  return [hi, lo].filter((i, k, a) => a.indexOf(i) === k && i !== props.values.length - 1).map(i => ({ i, ...pointAt(i) }))
})

const last = computed(() => props.values.length ? pointAt(props.values.length - 1) : null)
const hover = shallowRef<number | null>(null)
const hoverPoint = computed(() => hover.value === null ? null : pointAt(hover.value))

/** Callout change vs the previous point: signed, formatted like the value, with a direction arrow. */
const change = computed(() => {
  const i = hover.value
  if (!props.compare || i === null || i === 0)
    return null
  const d = props.values[i]! - props.values[i - 1]!
  const arrow = d > 0 ? '↑' : d < 0 ? '↓' : '→'
  const u = props.deltaUnit ?? props.unit
  return `${arrow} ${d > 0 ? '+' : d < 0 ? '−' : ''}${props.format(Math.abs(d))}${u ? ` ${u}` : ''}`
})

function onMove(event: PointerEvent) {
  if (props.values.length < 2)
    return
  const rect = (event.currentTarget as SVGElement).getBoundingClientRect()
  const ratio = (event.clientX - rect.left - PAD) / Math.max(rect.width - PAD * 2, 1)
  hover.value = Math.min(props.values.length - 1, Math.max(0, Math.round(ratio * (props.values.length - 1))))
}
</script>

<template>
  <div ref="root" class="relative w-full" :class="height === 'fill' ? 'h-full min-h-12' : ''" :style="height === 'fill' ? undefined : { height: `${height}px` }">
    <svg
      v-if="values.length"
      :width="w" :height="h" class="block overflow-visible"
      role="img" :aria-label="label"
      @pointermove="onMove" @pointerleave="hover = null"
    >
      <defs>
        <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="stroke" style="stop-opacity: var(--chart-area-top)" />
          <stop offset="100%" :stop-color="stroke" stop-opacity="0" />
        </linearGradient>
        <clipPath v-if="split !== null" :id="clipId">
          <rect :x="split" y="-8" :width="Math.max(w - split + 8, 0)" :height="h + 16" />
        </clipPath>
      </defs>
      <!-- One entrance for the whole plot: a left → right wipe (charts.css), then the dot arrives -->
      <g data-aapm-spark-plot>
        <path v-if="fill" data-aapm-area data-aapm-tween :d="fill" :fill="`url(#${gradientId})`" />
        <!-- History: the same curve, quieter -->
        <path
          data-aapm-tween :d="line" fill="none" :stroke="split !== null ? history : stroke"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        />
        <!-- Explicit comparison keeps the same line weight; only its opacity changes. -->
        <g v-if="split !== null" :clip-path="`url(#${clipId})`">
          <path
            data-aapm-tween data-aapm-current :d="line" fill="none" :stroke="stroke"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          />
        </g>
      </g>
      <!-- Period high / low -->
      <circle
        v-for="p in extremePoints" :key="p.i" data-aapm-extreme cx="0" cy="0" r="2.5"
        :style="{ transform: `translate(${p.x}px, ${p.y}px)` }"
        fill="var(--card)" :stroke="history" stroke-width="1.5" aria-hidden="true"
      />
      <!-- Crosshair and dot glide with a transform (assets/motion/charts.css), not by jumping x -->
      <line
        v-if="hoverPoint" data-aapm-crosshair x1="0" x2="0" :y1="0" :y2="h"
        :style="{ transform: `translateX(${hoverPoint.x}px)` }"
        stroke="var(--chart-axis)" stroke-width="1" opacity="0.85"
      />
      <!-- "Today" pulse: a ring that breathes out from the last point while nothing is hovered -->
      <g v-if="last && !hoverPoint" :style="{ transform: `translate(${last.x}px, ${last.y}px)` }" aria-hidden="true">
        <circle data-aapm-live cx="0" cy="0" r="4" fill="none" :stroke="stroke" stroke-width="2" />
      </g>
      <circle
        v-if="hoverPoint ?? last" data-aapm-dot cx="0" cy="0"
        :r="hoverPoint ? 5 : 4"
        :style="{ transform: `translate(${(hoverPoint ?? last)!.x}px, ${(hoverPoint ?? last)!.y}px)` }"
        :fill="stroke" stroke="var(--card)" stroke-width="2"
      />
    </svg>
    <ChartTooltip v-if="hoverPoint" :x="hoverPoint.x" :y="hoverPoint.y" :visible="hover !== null">
      <div class="text-[11px] text-muted-foreground">
        {{ labels[hover!] ?? '' }}
      </div>
      <div class="flex items-baseline gap-1">
        <span class="text-sm font-semibold numeric">{{ format(values[hover!]) }}</span>
        <span v-if="unit" class="text-muted-foreground">{{ unit }}</span>
      </div>
      <div v-if="change" class="text-[11px] text-muted-foreground numeric">
        {{ change }} vs {{ compareLabel }}
      </div>
    </ChartTooltip>
  </div>
</template>
