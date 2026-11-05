<script setup lang="ts">
import { formatNumber } from '@/lib/format-id'

import { useChartInView } from './use-chart-inview'

const props = withDefaults(defineProps<{
  label: string
  value: number | null
  min?: number
  max?: number
  target?: number
  unit?: string
  color?: string
  format?: (value: number) => string
}>(), {
  min: 0,
  max: 100,
  target: undefined,
  unit: '%',
  color: 'var(--chart-2)',
  format: (value: number) => formatNumber(value, 1),
})

const root = useTemplateRef<HTMLElement>('root')
useChartInView(root)
const validRange = computed(() => Number.isFinite(props.min) && Number.isFinite(props.max) && props.max > props.min)
const hasData = computed(() => validRange.value && props.value !== null && Number.isFinite(props.value))
const ratio = (value: number) => Math.min(1, Math.max(0, (value - props.min) / (props.max - props.min)))
const progress = computed(() => hasData.value ? ratio(props.value!) * 100 : 0)
const targetPoint = computed(() => {
  if (!validRange.value || props.target === undefined || !Number.isFinite(props.target) || props.target < props.min || props.target > props.max)
    return null
  const angle = ((ratio(props.target) * 270 - 225) * Math.PI) / 180
  return { x: 100 + Math.cos(angle) * 80, y: 100 + Math.sin(angle) * 80, rotation: ratio(props.target) * 270 - 225 }
})
const valueLabel = computed(() => hasData.value ? `${props.format(props.value!)} ${props.unit}`.trim() : 'Belum ada data')
const summary = computed(() => `${props.label}: ${valueLabel.value}${targetPoint.value ? `; target ${props.format(props.target!)} ${props.unit}` : ''}.`)
</script>

<template>
  <figure ref="root" data-aapm-gauge class="grid min-w-0 justify-items-center gap-3" :aria-label="summary">
    <div class="relative w-full max-w-64">
      <svg viewBox="0 0 200 175" class="block w-full" role="img" :aria-label="summary">
        <path d="M43.43,156.57 A80,80 0 1 1 156.57,156.57" fill="none" stroke="var(--muted)" stroke-width="12" stroke-linecap="round" />
        <path
          v-if="hasData && progress > 0" data-aapm-gauge-fill
          d="M43.43,156.57 A80,80 0 1 1 156.57,156.57" pathLength="100"
          fill="none" :stroke="color" stroke-width="12" stroke-linecap="round"
          :stroke-dasharray="`${progress} 100`"
        />
        <line
          v-if="targetPoint" data-aapm-gauge-target x1="-10" x2="10" y1="0" y2="0"
          :transform="`translate(${targetPoint.x} ${targetPoint.y}) rotate(${targetPoint.rotation})`"
          stroke="var(--chart-target)" stroke-width="2.5" stroke-linecap="round"
        />
      </svg>
      <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 px-8 pb-3 text-center" aria-hidden="true">
        <span class="text-3xl font-semibold tracking-title numeric">{{ hasData ? format(value!) : '—' }}</span>
        <span class="text-sm text-muted-foreground">{{ hasData ? unit : 'Belum ada data' }}</span>
      </div>
    </div>
    <figcaption class="grid justify-items-center gap-2 text-center">
      <span class="text-sm font-semibold wrap-anywhere">{{ label }}</span>
      <span v-if="targetPoint" class="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
        <span class="h-3 w-0.5 bg-chart-target" aria-hidden="true" />
        Target {{ format(target!) }} {{ unit }}
      </span>
      <span v-if="validRange" class="text-xs text-muted-foreground numeric">Skala {{ format(min) }}–{{ format(max) }} {{ unit }}</span>
      <span v-else class="text-xs text-muted-foreground">Rentang skala belum valid.</span>
    </figcaption>
  </figure>
</template>

<style scoped>
@media (prefers-reduced-motion: no-preference) {
  [data-aapm-gauge][data-aapm-inview] svg {
    animation: gauge-enter var(--chart-enter) var(--aapm-ease-emphasis) both;
    transform-origin: center;
  }
}
@keyframes gauge-enter {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
}
</style>
