<script setup lang="ts">
import { VisArea, VisAxis, VisLine, VisXYContainer } from '@unovis/vue'

import type { ChartConfig } from '@/components/ui/chart'

import { ChartLegend, TrendDelta } from '@/components/aapm/charts'
import { useChartInView } from '@/components/aapm/charts/use-chart-inview'
import AnimatedNumber from '@/components/aapm/motion/animated-number.vue'
import { prefersReducedMotion } from '@/components/aapm/motion/easing'
import SegmentedControl from '@/components/aapm/segmented-control.vue'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartCrosshair } from '@/components/ui/chart'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatNumber, formatSigned } from '@/lib/format-id'

import type { ProductionPoint } from '../data/farm-overview'

import { productionSeries } from '../data/farm-overview'

type Range = '14' | '30' | '90'
const range = shallowRef<Range>('30')
const view = shallowRef<'chart' | 'table'>('chart')

const data = computed(() => productionSeries.slice(-Number(range.value)))

const chartConfig = {
  hdp: { label: 'HD aktual', color: 'var(--chart-2)' },
  standard: { label: 'Standar breed', color: 'var(--chart-axis)' },
} satisfies ChartConfig
const Y_DOMAIN: [number, number] = [86, 96]
const hidden = ref<string[]>([])
/** Legend key under the pointer: that series stays, the other recedes (spotlight). */
const spot = ref<string | null>(null)
const showStandard = computed(() => !hidden.value.includes(chartConfig.standard.label))
const showActual = computed(() => !hidden.value.includes(chartConfig.hdp.label))
/** Range / legend changes tween (Unovis transitions) instead of redrawing; none under reduced motion. */
const TWEEN_MS = prefersReducedMotion() ? 0 : 600
const areaOpacity = computed(() => (!showActual.value ? 0 : spot.value && spot.value !== chartConfig.hdp.label ? 0.04 : 0.1))
const plot = useTemplateRef<HTMLElement>('plot')
useChartInView(plot)

const shortDate = (d: number | Date) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
const longDate = (d: number | Date) => new Date(d).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'long' })

const x = (d: ProductionPoint) => d.date.getTime()
const yActual = (d: ProductionPoint) => d.hdp
const yStandard = (d: ProductionPoint) => d.standard
const dim = (color: string) => `color-mix(in oklab, ${color} calc(var(--chart-dim) * 100%), transparent)`
// Hidden series keep their slot but turn transparent, so colors never repaint (color follows entity).
function lineColor(_d: ProductionPoint, i: number) {
  const series = [chartConfig.hdp, chartConfig.standard][i]!
  const shown = i === 0 ? showActual.value : showStandard.value
  if (!shown)
    return 'transparent'
  return spot.value && spot.value !== series.label ? dim(series.color) : series.color
}

/**
 * Scrub-to-read (signature moment): the hero readout follows the crosshair — the day under the
 * pointer, its HD and its gap to standard — and returns to today when the pointer leaves.
 */
const scrub = shallowRef<ProductionPoint | null>(null)
/**
 * Map the pointer onto the plotted series (the line component's own box, so axis gutters and
 * margins never skew it) and pick the nearest day — the same day the crosshair snaps to.
 */
function onPlotMove(event: PointerEvent) {
  const series = plot.value?.querySelector<SVGGElement>('[class$="-line-component"]')
  const n = data.value.length
  if (!series || n < 2)
    return
  const box = series.getBoundingClientRect()
  if (box.width <= 0)
    return
  const ratio = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width))
  scrub.value = data.value[Math.round(ratio * (n - 1))] ?? null
}
const readout = computed(() => scrub.value ?? data.value.at(-1)!)
const readoutGap = computed(() => readout.value.hdp - readout.value.standard)
const lineDash = (_d: ProductionPoint, i: number) => (i === 1 ? [4, 4] : undefined)
const crosshairColor = (_d: ProductionPoint, i: number) => [chartConfig.hdp.color, chartConfig.standard.color][i % 2]

const average = computed(() => data.value.reduce((s, p) => s + p.hdp, 0) / Math.max(data.value.length, 1))
const gap = computed(() => average.value - data.value.reduce((s, p) => s + p.standard, 0) / Math.max(data.value.length, 1))
const daysBelow = computed(() => data.value.filter(p => p.standard - p.hdp > 1.5).length)

const legend = [
  { label: chartConfig.hdp.label, color: chartConfig.hdp.color, shape: 'line' as const },
  { label: chartConfig.standard.label, color: chartConfig.standard.color, shape: 'dash' as const },
]
const tableRows = computed(() => [...data.value].reverse())

const stats = computed(() => {
  const hdps = data.value.map(p => p.hdp)
  const best = data.value.reduce((a, b) => (b.hdp > a.hdp ? b : a), data.value[0])
  const worst = data.value.reduce((a, b) => (b.hdp < a.hdp ? b : a), data.value[0])
  const eggs = data.value.reduce((s, p) => s + p.eggsKg, 0)
  return [
    { label: 'Hari ini', value: `${formatNumber(hdps.at(-1) ?? 0, 1)}%`, note: shortDate(data.value.at(-1)!.date) },
    { label: 'Tertinggi', value: `${formatNumber(best.hdp, 1)}%`, note: shortDate(best.date) },
    { label: 'Terendah', value: `${formatNumber(worst.hdp, 1)}%`, note: shortDate(worst.date) },
    { label: 'Total produksi', value: `${formatNumber(eggs / 1000, 1)} t`, note: `${data.value.length} hari` },
  ]
})
</script>

<template>
  <Card id="produksi" class="h-full scroll-mt-20">
    <!-- Flex-wrap header: the title block keeps ≥ 18rem, the controls wrap below it when the card is
         narrow (the stock grid header gave the controls an auto track and crushed the title). -->
    <CardHeader class="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
      <div class="grid min-w-0 flex-[1_1_18rem] gap-1">
        <p class="eyebrow text-muted-foreground">
          Hen-day (HD) · seluruh kandang
        </p>
        <CardTitle class="text-lg">
          Produksi harian terhadap standar
        </CardTitle>
        <CardDescription>
          Rata-rata {{ formatNumber(average, 1) }}% · {{ formatSigned(gap, 1, ' pt') }} terhadap standar · {{ daysBelow }} hari lebih dari 1,5 pt di bawah standar
        </CardDescription>
      </div>
      <CardAction class="flex max-w-full flex-[0_1_auto] items-center gap-2">
        <SegmentedControl
          v-model="range" label="Rentang waktu"
          :options="[{ value: '14', label: '14 hari' }, { value: '30', label: '30 hari' }, { value: '90', label: '90 hari' }]"
        />
        <SegmentedControl
          v-model="view" label="Tampilan"
          :options="[{ value: 'chart', label: 'Grafik', icon: 'chart' }, { value: 'table', label: 'Tabel', icon: 'table' }]"
          icon-only
        />
      </CardAction>
    </CardHeader>

    <CardContent class="grid grid-cols-[minmax(0,1fr)] gap-4">
      <template v-if="view === 'chart'">
        <!-- Hero readout: follows the crosshair (aria-live so a screen reader hears the scrubbed day) -->
        <div class="flex flex-wrap items-end justify-between gap-x-6 gap-y-2" aria-live="polite">
          <div class="grid gap-0.5">
            <p class="text-xs text-muted-foreground">
              {{ scrub ? longDate(readout.date) : `Hari ini · ${shortDate(readout.date)}` }}
            </p>
            <p class="flex flex-wrap items-baseline gap-x-1">
              <AnimatedNumber :value="readout.hdp" :format="(n: number) => formatNumber(n, 1)" class="text-[1.75rem] font-semibold leading-[2.1875rem] tracking-display" />
              <span class="text-sm font-medium text-muted-foreground">%</span>
            </p>
            <TrendDelta :value="readoutGap" good-when="up" suffix=" pt" :period="`vs standar ${formatNumber(readout.standard, 1)}%`" />
          </div>
          <p class="text-xs text-muted-foreground">
            {{ scrub ? `${formatNumber(readout.eggsKg)} kg telur` : 'Geser di grafik untuk membaca hari lain' }}
          </p>
        </div>
        <div ref="plot" class="min-w-0" @pointermove="onPlotMove" @pointerleave="scrub = null">
          <ChartContainer :config="chartConfig" class="aspect-auto h-(--chart-trend-height) w-full" cursor>
            <VisXYContainer :data="data" :margin="{ left: 4, right: 8, top: 8 }" :y-domain="Y_DOMAIN">
              <VisArea :x="x" :y="yActual" color="var(--chart-2)" :opacity="areaOpacity" :duration="TWEEN_MS" />
              <VisLine :x="x" :y="[yActual, yStandard]" :color="lineColor" :line-width="2" :line-dash-array="lineDash" :duration="TWEEN_MS" />
              <VisAxis
                type="x" :x="x" :tick-line="false" :domain-line="false" :grid-line="false" :num-ticks="6"
                :tick-format="(d: number) => shortDate(d)"
              />
              <VisAxis
                type="y" :num-ticks="5" :tick-line="false" :domain-line="false"
                :tick-format="(v: number) => `${v}%`"
              />
              <ChartCrosshair
                :x="x" :y="[yActual, yStandard]"
                :color="crosshairColor"
              />
            </VisXYContainer>
          </ChartContainer>
        </div>
        <dl class="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-4">
          <div v-for="s in stats" :key="s.label" class="bg-card px-4 py-3">
            <dt class="text-xs text-muted-foreground">
              {{ s.label }}
            </dt>
            <dd class="mt-1 flex flex-wrap items-baseline justify-between gap-x-2">
              <span class="text-lg font-semibold tracking-title numeric">{{ s.value }}</span>
              <span class="text-[11px] text-muted-foreground numeric">{{ s.note }}</span>
            </dd>
          </div>
        </dl>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <ChartLegend v-model:hidden="hidden" v-model:focused="spot" :items="legend" toggleable />
          <p class="text-xs text-muted-foreground">
            Sumbu Y dimulai {{ Y_DOMAIN[0] }}% (bukan nol) · Data contoh
          </p>
        </div>
      </template>

      <div v-else class="max-h-[300px] overflow-auto rounded-(--radius-panel) border">
        <Table>
          <TableHeader class="sticky top-0 bg-card">
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead class="text-right">
                HDP
              </TableHead>
              <TableHead class="text-right">
                Standar
              </TableHead>
              <TableHead class="text-right">
                Selisih
              </TableHead>
              <TableHead class="text-right">
                Produksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="row in tableRows" :key="row.date.getTime()">
              <TableCell>{{ longDate(row.date) }}</TableCell>
              <TableCell class="text-right numeric">
                {{ formatNumber(row.hdp, 1) }}%
              </TableCell>
              <TableCell class="text-right text-muted-foreground numeric">
                {{ formatNumber(row.standard, 1) }}%
              </TableCell>
              <TableCell class="text-right numeric" :class="row.hdp - row.standard < -1.5 ? 'font-semibold text-danger' : ''">
                {{ formatSigned(row.hdp - row.standard, 1, ' pt') }}
              </TableCell>
              <TableCell class="text-right numeric">
                {{ formatNumber(row.eggsKg) }} kg
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
</template>
