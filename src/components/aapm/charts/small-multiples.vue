<script setup lang="ts">
import { linearScale } from '@/lib/chart-geometry'
import { formatNumber } from '@/lib/format-id'

import type { SmallMultipleSeries } from './types'

const props = withDefaults(defineProps<{
  items: SmallMultipleSeries[]
  labels: string[]
  label: string
  unit?: string
  target?: number
  format?: (value: number) => string
}>(), {
  unit: '%',
  target: undefined,
  format: (value: number) => formatNumber(value, 1),
})

// One y-domain and one x-domain for the entire collection (#65–90): independent
// auto-scaled sparklines would make a weak house look as strong as a strong one.
const finiteValues = computed(() => props.items.flatMap(item => item.values).filter((value): value is number => value !== null && Number.isFinite(value)))
const domain = computed<[number, number]>(() => {
  const values = [...finiteValues.value]
  if (props.target !== undefined && Number.isFinite(props.target))
    values.push(props.target)
  if (!values.length)
    return [0, 100]
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  const pad = Math.max((hi - lo) * 0.15, 0.5)
  return [lo - pad, hi + pad]
})
const count = computed(() => Math.max(props.labels.length, ...props.items.map(item => item.values.length), 1))
const x = (index: number) => count.value === 1 ? 150 : linearScale([0, count.value - 1], [6, 294])(index)
const y = (value: number) => linearScale(domain.value, [80, 8])(value)
const targetY = computed(() => props.target !== undefined && Number.isFinite(props.target) ? y(props.target) : null)
const selected = shallowRef<number | null>(null)
const active = computed(() => Math.min(selected.value ?? count.value - 1, count.value - 1))
const period = (index: number) => props.labels[index] ?? `Titik ${index + 1}`
function readout(item: SmallMultipleSeries) {
  const value = item.values[active.value]
  return value === null || value === undefined || !Number.isFinite(value) ? 'Belum ada data' : `${props.format(value)} ${props.unit}`.trim()
}

function path(item: SmallMultipleSeries) {
  // Missing observations break the line instead of inventing interpolated data.
  return item.values.map((value, index) => {
    if (value === null || !Number.isFinite(value))
      return ''
    const previous = item.values[index - 1]
    const command = index === 0 || previous === null || !Number.isFinite(previous) ? 'M' : 'L'
    return `${command}${x(index)},${y(value)}`
  }).join('')
}
function move(event: PointerEvent) {
  const rect = (event.currentTarget as HTMLElement).querySelector('svg')?.getBoundingClientRect()
  if (!rect || rect.width <= 0)
    return
  selected.value = Math.min(count.value - 1, Math.max(0, Math.round(((event.clientX - rect.left) / rect.width) * (count.value - 1))))
}
function navigate(event: KeyboardEvent) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key))
    return
  event.preventDefault()
  selected.value = event.key === 'Home' ? 0 : event.key === 'End' ? count.value - 1 : Math.min(count.value - 1, Math.max(0, active.value + (event.key === 'ArrowRight' ? 1 : -1)))
}
</script>

<template>
  <figure data-aapm-small-multiples class="grid min-w-0 gap-4" :aria-label="label">
    <figcaption class="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
      <span class="wrap-anywhere">{{ label }} · {{ period(active) }}</span>
      <span class="numeric">Skala bersama {{ format(domain[0]) }}–{{ format(domain[1]) }} {{ unit }}</span>
      <span v-if="targetY !== null" class="flex items-center gap-1.5"><span class="w-4 border-t border-dashed border-chart-target" aria-hidden="true" />Target {{ format(target!) }} {{ unit }}</span>
    </figcaption>
    <p v-if="!items.length" class="rounded-lg bg-muted p-5 text-sm text-muted-foreground">
      Belum ada seri untuk dibandingkan.
    </p>
    <!-- A house collection keeps consistent widths while counts change (#65–90). -->
    <div v-else class="aapm-multiples-grid" data-audit-ignore="grid-empty-tracks">
      <button
        v-for="item in items" :key="item.id" type="button"
        class="aapm-multiple group grid min-w-0 content-start gap-2 rounded-lg bg-background/70 p-3 text-left ring-1 ring-border transition-colors duration-150 ease-aapm hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        :aria-label="`${item.label}, ${period(active)}: ${readout(item)}. Gunakan panah kiri atau kanan untuk membaca periode.`"
        @pointermove="move" @pointerdown="move" @pointerleave="selected = null" @blur="selected = null" @keydown="navigate"
      >
        <span class="flex min-w-0 flex-wrap items-baseline justify-between gap-2 text-sm">
          <span class="min-w-0 font-medium wrap-anywhere">{{ item.label }}</span>
          <span class="font-semibold numeric">{{ readout(item) }}</span>
        </span>
        <svg viewBox="0 0 300 88" class="block w-full" aria-hidden="true">
          <line v-if="targetY !== null" x1="6" x2="294" :y1="targetY" :y2="targetY" stroke="var(--chart-target)" stroke-dasharray="4 4" opacity="0.5" />
          <line x1="6" x2="294" y1="80" y2="80" stroke="var(--chart-grid)" />
          <path :d="path(item)" fill="none" :stroke="item.color ?? 'var(--chart-2)'" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
          <line v-if="selected !== null" :x1="x(active)" :x2="x(active)" y1="6" y2="82" stroke="var(--chart-axis)" stroke-dasharray="2 3" />
          <circle
            v-if="item.values[active] !== null && Number.isFinite(item.values[active])"
            :cx="x(active)" :cy="y(item.values[active]!)" r="4"
            :fill="item.color ?? 'var(--chart-2)'" stroke="var(--card)" stroke-width="2"
          />
        </svg>
        <span class="flex justify-between gap-2 text-xs text-muted-foreground"><span>{{ period(0) }}</span><span>{{ period(count - 1) }}</span></span>
      </button>
    </div>
    <p v-if="items.length" class="text-xs text-muted-foreground">
      Arahkan pointer atau fokuskan kartu, lalu gunakan ← → untuk membaca hari yang sama di semua kandang.
    </p>
    <details v-if="items.length" class="min-w-0 text-sm">
      <summary class="w-fit cursor-pointer rounded-md py-2 font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring">
        Lihat tabel data
      </summary>
      <div role="region" :aria-label="`Tabel ${label}`" tabindex="0" class="mt-2 max-w-full overflow-x-auto rounded-lg border focus-visible:outline-2 focus-visible:outline-ring">
        <table class="w-full text-xs numeric">
          <caption class="sr-only">
            {{ label }} ({{ unit }})
          </caption>
          <thead>
            <tr class="border-b">
              <th scope="col" class="p-3 text-left">
                Periode
              </th><th v-for="item in items" :key="item.id" scope="col" class="p-3 text-right">
                {{ item.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(_, index) in count" :key="index" class="border-b last:border-0">
              <th scope="row" class="p-3 text-left font-normal">
                {{ period(index) }}
              </th><td v-for="item in items" :key="item.id" class="p-3 text-right">
                {{ item.values[index] !== null && Number.isFinite(item.values[index]) ? format(item.values[index]!) : '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>
  </figure>
</template>

<style scoped>
.aapm-multiples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 14rem), 1fr));
  gap: 0.75rem;
}
.aapm-multiples-grid:has(> :only-child) {
  grid-template-columns: minmax(0, min(100%, 26rem));
}
</style>
