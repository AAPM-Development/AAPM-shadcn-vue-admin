<script setup lang="ts">
import { Motion } from 'motion-v'

import { AAPM_EASE } from '@/components/aapm/motion/easing'
import ToneChip from '@/components/aapm/tone/tone-chip.vue'
import { formatNumber } from '@/lib/format-id'

import type { BarListItem } from './types'

import { stagger, useChartInView } from './use-chart-inview'

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
const root = useTemplateRef<HTMLElement>('root')
const inView = useChartInView(root)
</script>

<template>
  <ol ref="root" class="grid gap-3.5" :aria-label="label">
    <li
      v-for="(item, i) in items" :key="item.label"
      data-aapm-bar-row
      class="-mx-2 grid gap-1.5 rounded-lg px-2 py-1"
      :data-active="active === i || undefined"
      @pointerenter="active = i" @pointerleave="active = null"
    >
      <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm">
        <span class="flex min-w-0 flex-1 basis-32 flex-wrap items-baseline gap-2">
          <span class="min-w-5 shrink-0 text-xs text-muted-foreground numeric">{{ String(i + 1).padStart(2, '0') }}</span>
          <span class="min-w-0 font-medium wrap-anywhere">{{ item.label }}</span>
          <span v-if="item.meta" class="hidden truncate text-xs text-muted-foreground sm:inline">{{ item.meta }}</span>
          <ToneChip v-if="item.flag" tone="amber">{{ item.flag }}</ToneChip>
        </span>
        <span class="shrink-0 font-semibold numeric">
          {{ format(item.value) }}<span class="ml-1 text-xs font-normal text-muted-foreground">{{ unit }}</span>
        </span>
      </div>
      <div class="ml-7 h-2.5 overflow-hidden rounded-full bg-seq-0">
        <div data-aapm-bar class="h-full" :style="{ width: `${(Math.max(0, item.value) / ceiling) * 100}%`, opacity: active === null || active === i ? 1 : 'var(--chart-dim)' }">
          <Motion
            class="h-full origin-left rounded-full bg-chart-1"
            :initial="{ scaleX: inView ? 1 : 0 }" :animate="{ scaleX: inView ? 1 : 0 }"
            :transition="{ duration: 0.6, ease: AAPM_EASE.emphasis, delay: stagger(i) }"
          />
        </div>
      </div>
    </li>
  </ol>
</template>
