<script setup lang="ts">
import AapmIcon from '@/components/aapm/icon/AapmIcon.vue'
import { formatNumber } from '@/lib/format-id'

const props = withDefaults(defineProps<{
  label: string
  actual: number
  target: number
  max: number
  unit?: string
  /** Ratios of target below which the state is critical / low. */
  thresholds?: [number, number]
  meta?: string
  format?: (n: number) => string
}>(), {
  unit: '',
  thresholds: () => [0.5, 0.8],
  meta: undefined,
  format: (n: number) => formatNumber(n),
})

const pct = (v: number) => `${Math.min(100, Math.max(0, (v / Math.max(props.max, 1)) * 100))}%`
const ratio = computed(() => props.target > 0 ? props.actual / props.target : 1)
const state = computed(() => {
  const [critical, low] = props.thresholds
  if (ratio.value < critical)
    return { tone: 'danger', label: 'Kritis', icon: 'danger' } as const
  if (ratio.value < low)
    return { tone: 'warning', label: 'Menipis', icon: 'warning' } as const
  return { tone: 'success', label: 'Aman', icon: 'success' } as const
})
const summary = computed(() => `${props.label}: ${props.format(props.actual)} ${props.unit} dari target ${props.format(props.target)} ${props.unit}, status ${state.value.label}`)
</script>

<template>
  <div class="grid gap-2" role="img" :aria-label="summary">
    <div class="flex items-baseline justify-between gap-3">
      <div class="min-w-0">
        <p class="truncate text-sm font-medium">
          {{ label }}
        </p>
        <p v-if="meta" class="truncate text-xs text-muted-foreground">
          {{ meta }}
        </p>
      </div>
      <div class="flex shrink-0 items-baseline gap-1.5">
        <span class="text-sm font-semibold numeric">{{ format(actual) }}</span>
        <span class="text-xs text-muted-foreground numeric">/ {{ format(target) }} {{ unit }}</span>
      </div>
    </div>
    <div class="relative h-4">
      <!-- Qualitative bands (critical / low / healthy) as lighter steps of one neutral ramp -->
      <div class="absolute inset-x-0 inset-y-1 overflow-hidden rounded-full bg-seq-0">
        <div class="absolute inset-y-0 left-0 bg-foreground/[0.05]" :style="{ width: pct(target * thresholds[1]) }" />
        <div class="absolute inset-y-0 left-0 bg-foreground/[0.05]" :style="{ width: pct(target * thresholds[0]) }" />
      </div>
      <div
        class="absolute inset-y-1 left-0 rounded-full transition-[width] duration-500 ease-emphasis"
        :class="{
          'bg-chart-1': state.tone === 'success',
          'bg-warning-fill': state.tone === 'warning',
          'bg-danger-fill': state.tone === 'danger',
        }"
        :style="{ width: pct(actual) }"
      />
      <div
        class="absolute inset-y-0 w-0.5 -translate-x-1/2 rounded-full bg-chart-target"
        :style="{ left: pct(target) }"
        aria-hidden="true"
      />
    </div>
    <div class="flex items-center justify-between text-xs">
      <span
        class="inline-flex items-center gap-1 font-medium"
        :class="{
          'text-success': state.tone === 'success',
          'text-warning': state.tone === 'warning',
          'text-danger': state.tone === 'danger',
        }"
      >
        <AapmIcon :name="state.icon" :size="13" />
        {{ state.label }}
      </span>
      <span class="text-muted-foreground numeric">{{ formatNumber(ratio * 100, 0) }}% dari target</span>
    </div>
  </div>
</template>
