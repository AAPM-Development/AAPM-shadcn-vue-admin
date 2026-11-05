<script setup lang="ts">
import { heroKpi, kpis } from '../data/farm-overview'
import EggGradeCard from './egg-grade-card.vue'
import ExceptionsCard from './exceptions-card.vue'
import FeedStockCard from './feed-stock-card.vue'
import HouseRanking from './house-ranking.vue'
import KpiCard from './kpi-card.vue'
import MortalityHeatmap from './mortality-heatmap.vue'
import ProductionTrend from './production-trend.vue'
import RecentOrders from './recent-orders.vue'

/** Rows enter one after another; reduced motion removes the animation globally. */
const rise = (index: number) => ({ '--rise-index': index })
</script>

<template>
  <div class="grid grid-cols-1 gap-4 lg:gap-5">
    <!-- 1 · Hero + 2×2 KPI bento -->
    <section aria-label="Indikator utama" class="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
      <div class="animate-rise rise-stagger lg:col-span-5" :style="rise(0)">
        <KpiCard :kpi="heroKpi" hero />
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7 lg:gap-5">
        <div v-for="(kpi, i) in kpis" :key="kpi.key" class="animate-rise rise-stagger" :style="rise(i + 1)">
          <KpiCard :kpi="kpi" />
        </div>
      </div>
    </section>

    <!-- 2 · Actionable queue first (UX-09), then the production trend -->
    <section aria-label="Produksi dan tindakan" class="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
      <div class="animate-rise rise-stagger lg:col-span-8" :style="rise(3)">
        <ProductionTrend />
      </div>
      <div class="animate-rise rise-stagger lg:col-span-4" :style="rise(4)">
        <ExceptionsCard />
      </div>
    </section>

    <!-- 3 · Health and grading -->
    <section aria-label="Kesehatan flock dan grading" class="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
      <div class="animate-rise rise-stagger lg:col-span-7" :style="rise(5)">
        <MortalityHeatmap />
      </div>
      <div class="animate-rise rise-stagger lg:col-span-5" :style="rise(6)">
        <EggGradeCard />
      </div>
    </section>

    <!-- 4 · Inputs and output -->
    <section aria-label="Pakan dan output kandang" class="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
      <div class="animate-rise rise-stagger lg:col-span-5" :style="rise(7)">
        <FeedStockCard />
      </div>
      <div class="animate-rise rise-stagger lg:col-span-7" :style="rise(8)">
        <HouseRanking />
      </div>
    </section>

    <!-- 5 · Sales -->
    <section aria-label="Penjualan" class="animate-rise rise-stagger" :style="rise(9)">
      <RecentOrders />
    </section>
  </div>
</template>
