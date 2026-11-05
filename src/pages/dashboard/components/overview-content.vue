<script setup lang="ts">
import BrandBumper from '@/components/aapm/brand-bumper.vue'
import Reveal from '@/components/aapm/motion/reveal.vue'
import { formatNumber } from '@/lib/format-id'

import { exceptions, heroKpi, kpis, productionSeries } from '../data/farm-overview'
import EggGradeCard from './egg-grade-card.vue'
import ExceptionsCard from './exceptions-card.vue'
import FeedStockCard from './feed-stock-card.vue'
import HouseRanking from './house-ranking.vue'
import KpiCard from './kpi-card.vue'
import MortalityHeatmap from './mortality-heatmap.vue'
import ProductionTrend from './production-trend.vue'
import RecentOrders from './recent-orders.vue'

/** Morning brief (brand bumper): today in one sentence, then three facts that matter. */
const today = productionSeries.at(-1)!
const critical = exceptions.filter(e => e.tone === 'danger').length
const greeting = (() => {
  const h = new Date().getHours()
  return h < 11 ? 'Selamat pagi.' : h < 15 ? 'Selamat siang.' : h < 18 ? 'Selamat sore.' : 'Selamat malam.'
})()
const facts = [
  { label: 'HD hari ini', value: `${formatNumber(today.hdp, 1)}%` },
  { label: 'Produksi', value: `${formatNumber(today.eggsKg)} kg` },
  { label: 'Perlu tindakan', value: `${exceptions.length} · ${critical} kritis` },
]
</script>

<template>
  <div class="grid grid-cols-1 gap-4 lg:gap-5">
    <!-- 0 · Morning brief — the farm.aapm.co.id green bumper as the dashboard's signature moment -->
    <Reveal :index="0">
      <BrandBumper :words="`${greeting} Farm berjalan, ${critical} hal kritis menunggu.`" eyebrow="Ringkasan hari ini · Farm Payakumbuh">
        <dl class="mt-2 flex flex-wrap gap-x-8 gap-y-3">
          <div v-for="fact in facts" :key="fact.label" class="grid gap-0.5">
            <dt class="text-xs text-white/65">
              {{ fact.label }}
            </dt>
            <dd class="text-lg font-semibold numeric">
              {{ fact.value }}
            </dd>
          </div>
        </dl>
      </BrandBumper>
    </Reveal>

    <!-- 1 · Hero + 2×2 KPI bento -->
    <section aria-label="Indikator utama" class="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
      <Reveal :index="0" class="lg:col-span-5">
        <KpiCard :kpi="heroKpi" hero />
      </Reveal>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7 lg:gap-5">
        <Reveal v-for="(kpi, i) in kpis" :key="kpi.key" :index="i + 1">
          <KpiCard :kpi="kpi" />
        </Reveal>
      </div>
    </section>

    <!-- 2 · Actionable queue first (UX-09), then the production trend -->
    <section aria-label="Produksi dan tindakan" class="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
      <Reveal :index="3" class="lg:col-span-8">
        <ProductionTrend />
      </Reveal>
      <Reveal :index="4" class="lg:col-span-4">
        <ExceptionsCard />
      </Reveal>
    </section>

    <!-- 3 · Health and grading -->
    <section aria-label="Kesehatan flock dan grading" class="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
      <Reveal :index="5" class="lg:col-span-7">
        <MortalityHeatmap />
      </Reveal>
      <Reveal :index="6" class="lg:col-span-5">
        <EggGradeCard />
      </Reveal>
    </section>

    <!-- 4 · Inputs and output -->
    <section aria-label="Pakan dan output kandang" class="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
      <Reveal :index="7" class="lg:col-span-5">
        <FeedStockCard />
      </Reveal>
      <Reveal :index="8" class="lg:col-span-7">
        <HouseRanking />
      </Reveal>
    </section>

    <!-- 5 · Sales -->
    <Reveal as="section" aria-label="Penjualan" :index="9">
      <RecentOrders />
    </Reveal>
  </div>
</template>
