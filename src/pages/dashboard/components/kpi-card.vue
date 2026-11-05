<script setup lang="ts">
import type { IconName } from '@/components/aapm/icon/registry'

import { Sparkline, TrendDelta } from '@/components/aapm/charts'
import AapmIcon from '@/components/aapm/icon/AapmIcon.vue'
import { Card } from '@/components/ui/card'
import { formatNumber, formatRupiah } from '@/lib/format-id'

import type { Kpi } from '../data/farm-overview'

const props = defineProps<{
  kpi: Kpi
  hero?: boolean
}>()

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
const display = computed(() => format(props.kpi.key, props.kpi.value))
const unitBefore = computed(() => props.kpi.unit === 'Rp')
const trendLabel = computed(() => `Tren ${props.kpi.label}, ${props.kpi.trend.length} titik data terakhir`)
</script>

<template>
  <Card
    class="group relative h-full gap-0 overflow-hidden py-0 shadow-none transition-[border-color] duration-200 ease-aapm hover:border-foreground/20"
    :class="hero ? 'min-h-[18rem]' : ''"
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
        <AapmIcon :name="ICON[kpi.key]" :size="hero ? 22 : 18" class="shrink-0 text-muted-foreground" />
      </div>

      <div class="mt-auto space-y-2">
        <p
          v-if="state !== 'unavailable'"
          class="flex items-baseline gap-1.5 font-semibold tracking-display text-foreground"
        >
          <span v-if="unitBefore" class="text-base font-medium text-muted-foreground">Rp</span>
          <span :class="hero ? 'text-[3.25rem] leading-none sm:text-[3.75rem]' : 'text-[1.75rem] leading-8'">{{ display }}</span>
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

      <Sparkline
        v-if="state !== 'unavailable'"
        :values="kpi.trend"
        :tone="hero ? 'brand' : 'muted'"
        :height="hero ? 72 : 30"
        :area="hero"
        :label="trendLabel"
        :format="(n: number) => `${format(kpi.key, n)} ${kpi.unit === 'Rp' ? '' : kpi.unit}`.trim()"
        :class="hero ? '-mx-1' : ''"
      />

      <!-- Provenance + drilldown (UX-09 / UX-12) -->
      <div class="-mx-5 -mb-5 flex items-center justify-between gap-2 border-t border-border/60 px-5 py-2.5 text-xs" :class="hero ? 'sm:-mx-7 sm:-mb-7 sm:px-7' : ''">
        <span class="flex min-w-0 items-center gap-1.5 text-muted-foreground">
          <span
            v-if="state === 'stale'"
            class="inline-flex shrink-0 items-center gap-1 rounded-md bg-warning-soft px-1.5 py-px font-semibold text-warning"
            :title="kpi.stateNote"
          >
            <AapmIcon name="pending" :size="12" />
            Tertunda
          </span>
          <span class="truncate" :title="state === 'stale' ? kpi.stateNote : kpi.source">
            {{ state === 'stale' ? kpi.stateNote : kpi.source }}
          </span>
        </span>
        <a
          v-if="kpi.drilldown"
          :href="`#${kpi.drilldown}`"
          class="inline-flex shrink-0 items-center gap-0.5 rounded font-semibold text-brand outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          Rincian
          <AapmIcon name="chevronRight" :size="14" />
        </a>
      </div>
    </div>
  </Card>
</template>
