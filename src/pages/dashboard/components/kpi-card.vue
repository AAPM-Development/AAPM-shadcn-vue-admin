<script setup lang="ts">
import type { IconName } from '@/components/aapm/icon/registry'

import { SegmentedBar, Sparkline, TrendDelta } from '@/components/aapm/charts'
import AapmIcon from '@/components/aapm/icon/AapmIcon.vue'
import AnimatedNumber from '@/components/aapm/motion/animated-number.vue'
import { Card } from '@/components/ui/card'
import { formatNumber, formatRupiah } from '@/lib/format-id'

import type { Kpi } from '../data/farm-overview'

import { gradeMix, productionSeries } from '../data/farm-overview'

const props = defineProps<{
  kpi: Kpi
  hero?: boolean
}>()

/** Colour follows the metric everywhere it appears (HD is --chart-2 in the production trend too). */
const HUE: Record<Kpi['key'], string> = {
  eggs: 'var(--chart-1)',
  hdp: 'var(--chart-2)',
  fcr: 'var(--chart-3)',
  population: 'var(--chart-4)',
  sales: 'var(--chart-5)',
}

const ICON: Record<Kpi['key'], IconName> = {
  eggs: 'egg',
  hdp: 'hdp',
  fcr: 'fcr',
  population: 'flock',
  sales: 'revenue',
}

function format(key: Kpi['key'], v: number) {
  switch (key) {
    case 'hdp': return formatNumber(v, 1)
    case 'fcr': return formatNumber(v, 2)
    case 'sales': return formatRupiah(v, { compact: true }).replace('Rp ', '')
    default: return formatNumber(v)
  }
}

const state = computed(() => props.kpi.state ?? 'ok')
const unitBefore = computed(() => props.kpi.unit === 'Rp')
/** One date per trend point, ending on the latest recorded day (callout context). */
const trendDates = computed(() => {
  const end = productionSeries.at(-1)!.date.getTime()
  const n = props.kpi.trend.length
  return props.kpi.trend.map((_, i) => new Date(end - (n - 1 - i) * 86_400_000)
    .toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }))
})
const trendLabel = computed(() => `Tren ${props.kpi.label}, ${props.kpi.trend.length} titik data terakhir`)
</script>

<template>
  <Card
    data-aapm-kpi
    :style="{ '--kpi-hue': HUE[kpi.key] }"
    class="group relative h-full min-w-0 gap-0 py-0 wrap-anywhere"
    :class="hero ? 'min-h-(--kpi-hero-min)' : ''"
  >
    <div class="relative flex h-full flex-col gap-4 p-5" :class="hero ? 'sm:p-7' : ''">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0 space-y-1">
          <h3 class="eyebrow text-muted-foreground">
            {{ kpi.label }}
          </h3>
          <p v-if="hero && kpi.note" class="text-sm text-muted-foreground numeric">
            {{ kpi.note }}
          </p>
        </div>
        <span data-aapm-kpi-icon class="grid shrink-0 place-items-center rounded-lg text-foreground/80" :class="hero ? 'size-10' : 'size-8'">
          <AapmIcon :name="ICON[kpi.key]" :size="hero ? 22 : 18" />
        </span>
      </div>

      <div class="space-y-2" :class="hero ? '' : 'mt-auto'">
        <p
          v-if="state !== 'unavailable'"
          class="flex items-baseline gap-1.5 font-semibold tracking-display text-foreground"
        >
          <span v-if="unitBefore" class="text-base font-medium text-muted-foreground">Rp</span>
          <AnimatedNumber :value="kpi.value" :format="(n: number) => format(kpi.key, n)" class="leading-tight" :class="hero ? 'text-(length:--kpi-value-hero)' : 'text-(length:--kpi-value-tile)'" />
          <span v-if="!unitBefore && kpi.unit" class="font-medium text-muted-foreground" :class="hero ? 'text-xl' : 'text-sm'">{{ kpi.unit }}</span>
        </p>
        <p v-else class="text-sm font-medium text-muted-foreground">
          Belum tersedia — {{ kpi.stateNote }}
        </p>
        <TrendDelta
          v-if="state !== 'unavailable'"
          :value="kpi.delta" :good-when="kpi.goodWhen" :suffix="kpi.deltaSuffix ?? '%'"
          :digits="kpi.key === 'population' ? 2 : 1" :period="kpi.period"
        />
      </div>

      <!-- One sparkline family across tiles and the trend chart: brand line + gradient wash -->
      <div v-if="state !== 'unavailable'" :class="hero ? '-mx-1' : ''">
        <Sparkline
          :values="kpi.trend"
          :color="HUE[kpi.key]"
          :height="hero ? 64 : 32"
          :extremes="hero"
          area
          :labels="trendDates"
          :unit="kpi.unit === 'Rp' ? '' : kpi.unit"
          compare
          compare-label="hari sebelumnya"
          :label="trendLabel"
          :format="(n: number) => (kpi.unit === 'Rp' ? `Rp ${format(kpi.key, n)}` : format(kpi.key, n))"
          :delta-unit="kpi.unit === '%' ? 'pt' : undefined"
        />
      </div>

      <!-- Hero only: today's grade composition fills the tile with data instead of air -->
      <div v-if="hero && kpi.key === 'eggs'" class="mt-auto grid gap-2 border-t border-dashed border-border/70 pt-4">
        <p class="text-xs font-medium text-muted-foreground">
          Komposisi grade hari ini
        </p>
        <SegmentedBar :items="gradeMix" variant="tall" unit="kg" label="Komposisi grade telur hari ini" />
      </div>

      <!-- Provenance + drilldown (UX-09 / UX-12) -->
      <div class="-mx-5 -mb-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-border/60 px-5 py-1.5 text-xs" :class="hero ? 'sm:-mx-7 sm:-mb-7 sm:px-7' : ''">
        <span class="flex min-w-0 flex-1 basis-32 flex-wrap items-center gap-1.5 text-muted-foreground">
          <span
            v-if="state === 'stale'"
            class="inline-flex shrink-0 items-center gap-1 rounded-md bg-warning-soft px-1.5 py-px font-semibold text-warning"
            :title="kpi.stateNote"
          >
            <AapmIcon name="pending" :size="12" />
            Tertunda
          </span>
          <span class="min-w-0 wrap-anywhere">
            {{ state === 'stale' ? kpi.stateNote : kpi.source }}
          </span>
        </span>
        <a
          v-if="kpi.drilldown"
          :href="`#${kpi.drilldown}`"
          class="-mr-1.5 inline-flex min-h-8 max-w-full items-center gap-0.5 rounded-md px-1.5 font-semibold text-brand outline-none transition-colors duration-150 ease-aapm wrap-anywhere hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring pointer-coarse:min-h-11"
        >
          Rincian
          <AapmIcon name="chevronRight" :size="14" />
        </a>
      </div>
    </div>
  </Card>
</template>
