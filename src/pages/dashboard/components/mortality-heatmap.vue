<script setup lang="ts">
import { Heatmap } from '@/components/aapm/charts'
import { Card, CardContent } from '@/components/ui/card'
import { formatNumber } from '@/lib/format-id'

import { HOUSES, MORTALITY_THRESHOLDS, mortalityGrid, WEEKS } from '../data/farm-overview'
import PanelHeader from './panel-header.vue'

const format = (n: number) => `${formatNumber(n, 2)}%`
</script>

<template>
  <Card id="mortalitas" class="h-full scroll-mt-20">
    <PanelHeader
      overline="Kesehatan flock"
      title="Mortalitas mingguan per kandang"
      description="Persentase kematian terhadap populasi awal minggu. Warna lebih gelap berarti mortalitas lebih tinggi."
    />
    <CardContent>
      <Heatmap
        :rows="HOUSES" :cols="WEEKS" :values="mortalityGrid" :thresholds="MORTALITY_THRESHOLDS"
        :format="format" label="Mortalitas mingguan per kandang, minggu 34 sampai 45"
      />
    </CardContent>
  </Card>
</template>
