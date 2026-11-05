<script setup lang="ts">
import { BulletChart } from '@/components/aapm/charts'
import { Card, CardContent } from '@/components/ui/card'
import { formatNumber } from '@/lib/format-id'

import { feedStock } from '../data/farm-overview'
import PanelHeader from './panel-header.vue'

const format = (n: number) => formatNumber(n, 1)
</script>

<template>
  <Card id="pakan" class="h-full scroll-mt-20">
    <PanelHeader
      overline="Gudang pakan"
      title="Stok terhadap kebutuhan minimum"
      description="Garis vertikal = stok minimum. Ambang kritis < 50% dan menipis < 80% adalah contoh konfigurasi."
    />
    <CardContent class="grid gap-5">
      <BulletChart
        v-for="item in feedStock" :key="item.label"
        :label="item.label" :actual="item.actual" :target="item.target" :max="item.max"
        :unit="item.unit" :meta="item.meta" :format="format"
      />
    </CardContent>
  </Card>
</template>
