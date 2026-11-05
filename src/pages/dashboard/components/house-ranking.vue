<script setup lang="ts">
import { BarList } from '@/components/aapm/charts'
import { Card, CardContent } from '@/components/ui/card'
import { formatNumber } from '@/lib/format-id'

import { houseOutput } from '../data/farm-overview'
import PanelHeader from './panel-header.vue'

const total = computed(() => houseOutput.reduce((sum, h) => sum + h.value, 0))
</script>

<template>
  <Card class="h-full">
    <PanelHeader
      overline="Per kandang"
      title="Produksi telur hari ini"
      :description="`Diurutkan dari tertinggi. Total ${formatNumber(total)} kg dari ${houseOutput.length} kandang; bar mulai dari nol.`"
    />
    <CardContent>
      <BarList :items="houseOutput" unit="kg" label="Produksi telur per kandang hari ini, kg" />
    </CardContent>
  </Card>
</template>
