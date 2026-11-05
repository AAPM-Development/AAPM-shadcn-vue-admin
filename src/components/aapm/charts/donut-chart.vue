<script setup lang="ts">
import { donutArcs } from '@/lib/chart-geometry'
import { formatNumber, formatPercent } from '@/lib/format-id'

import type { DonutItem } from './types'

const props = withDefaults(defineProps<{
  items: DonutItem[]
  centerLabel: string
  size?: number
  thickness?: number
  format?: (n: number) => string
  unit?: string
}>(), {
  size: 176,
  thickness: 18,
  format: (n: number) => formatNumber(n),
  unit: '',
})

const radius = computed(() => props.size / 2)
const arcs = computed(() => donutArcs(props.items.map(i => i.value), {
  radius: radius.value,
  thickness: props.thickness,
  // ≈ 2px surface gap measured at the outer edge
  gapDeg: (2 / (Math.PI * props.size)) * 360,
}))
const total = computed(() => props.items.reduce((sum, i) => sum + Math.max(0, i.value), 0))
const active = shallowRef<number | null>(null)
const focused = computed(() => active.value === null ? null : props.items[active.value])
const share = (v: number) => total.value ? (v / total.value) * 100 : 0
const summary = computed(() => `${props.centerLabel}: ${props.items.map(i => `${i.label} ${formatPercent(share(i.value))}`).join(', ')}`)
</script>

<template>
  <div class="@container w-full">
    <div class="flex flex-col items-center gap-5 @[27rem]:flex-row">
      <div class="relative shrink-0" :style="{ width: `${size}px`, height: `${size}px` }">
        <svg :width="size" :height="size" role="img" :aria-label="summary">
          <circle
            v-if="!arcs.length" :cx="radius" :cy="radius" :r="radius - thickness / 2"
            fill="none" stroke="var(--seq-0)" :stroke-width="thickness"
          />
          <path
            v-for="arc in arcs" :key="arc.index" :d="arc.d" :fill="items[arc.index].color" fill-rule="evenodd"
            class="cursor-pointer transition-opacity duration-200 ease-aapm"
            :opacity="active === null || active === arc.index ? 1 : 0.3"
            @pointerenter="active = arc.index" @pointerleave="active = null"
          />
        </svg>
        <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span class="eyebrow max-w-[70%] truncate text-muted-foreground">{{ focused ? focused.label : centerLabel }}</span>
          <span class="text-2xl font-semibold tracking-title">
            {{ focused ? formatPercent(share(focused.value)) : format(total) }}
          </span>
          <span class="text-xs text-muted-foreground numeric">
            {{ focused ? `${format(focused.value)} ${unit}` : unit }}
          </span>
        </div>
      </div>
      <ul class="grid w-full min-w-0 flex-1 grid-cols-[minmax(0,1fr)] gap-0.5">
        <li
          v-for="(item, i) in items" :key="item.label"
          class="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm outline-none transition-colors duration-150 ease-aapm focus-visible:ring-2 focus-visible:ring-ring"
          :class="active === i ? 'bg-muted' : ''"
          tabindex="0"
          @pointerenter="active = i" @pointerleave="active = null" @focus="active = i" @blur="active = null"
        >
          <span class="size-2.5 shrink-0 rounded-[3px]" :style="{ background: item.color }" aria-hidden="true" />
          <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
          <span class="text-muted-foreground numeric">{{ format(item.value) }}</span>
          <span class="w-11 text-right font-semibold numeric">{{ formatPercent(share(item.value), 0) }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
