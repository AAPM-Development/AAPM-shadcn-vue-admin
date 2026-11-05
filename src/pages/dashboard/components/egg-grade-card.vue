<script setup lang="ts">
import { DonutChart } from '@/components/aapm/charts'
import { Card, CardContent } from '@/components/ui/card'

import { gradeMix } from '../data/farm-overview'
import PanelHeader from './panel-header.vue'
</script>

<template>
  <Card class="h-full">
    <PanelHeader
      overline="Grading hari ini"
      title="Komposisi telur"
      description="Bagian dari total telur yang digrading, dalam kg. Satu telur hanya masuk satu kelas."
    />
    <CardContent>
      <DonutChart :items="gradeMix" center-label="Total grading" unit="kg" />
    </CardContent>
  </Card>
</template>
