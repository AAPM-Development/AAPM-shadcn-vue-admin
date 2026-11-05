<script setup lang="ts">
import type { BarListItem, DonutItem } from '@/components/aapm/charts'

import { BarList, BulletChart, DivergingBars, DonutChart, Heatmap, RadialGauge, SegmentedBar, SmallMultiples, Sparkline } from '@/components/aapm/charts'
import AapmIcon from '@/components/aapm/icon/AapmIcon.vue'
import { Button } from '@/components/ui/button'
import { formatNumber } from '@/lib/format-id'

import KitSection from './kit-section.vue'

/**
 * Data-viz motion showcase (Task 11). "Acak data" changes every series so the tweens are visible:
 * bars and the bullet fill resize from their old value, paths and arcs morph, heatmap cells recolour.
 * Entrance plays once when each chart scrolls into view.
 */
let seed = 7
function rand() {
  seed = (seed * 9301 + 49297) % 233280
  return seed / 233280
}
const jitter = (base: number, spread: number) => Math.round((base + (rand() - 0.5) * spread) * 10) / 10

const HOUSES = ['B3', 'B2', 'A1', 'A2', 'C1']
const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

function makeBars(): BarListItem[] {
  return HOUSES.map((h, i) => ({ label: `Kandang ${h}`, value: Math.round(jitter(1300 - i * 120, 260)), flag: i === 4 ? 'Pullet' : undefined }))
    .sort((a, b) => b.value - a.value)
}
function makeDonut(): DonutItem[] {
  return [
    { label: 'Grade A', value: Math.round(jitter(5200, 900)), color: 'var(--chart-1)' },
    { label: 'Grade B', value: Math.round(jitter(1800, 500)), color: 'var(--chart-2)' },
    { label: 'Retak', value: Math.round(jitter(260, 120)), color: 'var(--chart-3)' },
    { label: 'Kotor', value: Math.round(jitter(180, 80)), color: 'var(--chart-4)' },
  ]
}
const makeSpark = () => Array.from({ length: 14 }, (_, i) => jitter(90 + Math.sin(i / 2) * 1.6, 1.4))
const makeHeat = () => HOUSES.map(() => DAYS.map(() => Math.max(0, jitter(0.03, 0.05))))

const bars = ref(makeBars())
const donut = ref(makeDonut())
const spark = ref(makeSpark())
const heat = ref(makeHeat())
const feed = ref({ actual: 18400, target: 24000 })
const makeGap = () => ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4'].map(h => ({ label: `Kandang ${h}`, value: jitter(0, 3.2) }))
const gap = ref(makeGap())
const makeMultiples = () => HOUSES.slice(0, 4).map((house, index) => ({ id: house, label: `Kandang ${house}`, values: DAYS.map((_, day) => jitter(93 - index * 1.2 + Math.sin(day / 2), 0.8)) }))
const multiples = ref(makeMultiples())

function shuffle() {
  bars.value = makeBars()
  donut.value = makeDonut()
  spark.value = makeSpark()
  heat.value = makeHeat()
  feed.value = { actual: Math.round(jitter(16000, 14000)), target: 24000 }
  gap.value = makeGap()
  multiples.value = makeMultiples()
}

const sparkLabels = Array.from({ length: 14 }, (_, i) => `Hari ${i + 1}`)
const sparkLast = computed(() => spark.value.at(-1) ?? 0)
</script>

<template>
  <KitSection
    id="grafik" eyebrow="Visual data" title="Grafik bergerak"
    description="Grafik masuk sekali saat terlihat: batang tumbuh dari dasar, garis tergambar, donat tersapu searah jarum jam, heatmap mengalir diagonal. Saat data berubah, nilainya berpindah dari posisi lama — tidak digambar ulang dari nol. Dengan reduced motion, data langsung tampil."
  >
    <div class="flex flex-wrap items-center justify-between gap-2">
      <p class="text-sm text-muted-foreground">
        Data contoh · klik untuk melihat transisi antarnilai.
      </p>
      <Button variant="outline" size="sm" @click="shuffle">
        <AapmIcon name="refresh" :size="16" />
        Acak data
      </Button>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <div class="grid content-start gap-3 rounded-lg border p-4">
        <p class="eyebrow text-muted-foreground">
          Bar list · produksi per kandang
        </p>
        <BarList :items="bars" unit="kg" label="Produksi telur per kandang, kg" />
      </div>

      <div class="grid content-start gap-5 rounded-lg border p-4">
        <p class="eyebrow text-muted-foreground">
          Bullet · stok pakan &amp; sparkline · HD 14 hari
        </p>
        <BulletChart label="Jagung giling" meta="Gudang Pakan" :actual="feed.actual" :target="feed.target" :max="30000" unit="kg" />
        <div class="grid gap-1">
          <div class="flex items-baseline justify-between text-sm">
            <span class="font-medium">HD harian</span>
            <span class="font-semibold numeric">{{ formatNumber(sparkLast, 1) }}%</span>
          </div>
          <Sparkline :values="spark" :labels="sparkLabels" :height="64" :format="(n: number) => `${formatNumber(n, 1)}%`" label="HD 14 hari terakhir" />
        </div>
      </div>

      <div class="grid content-start gap-3 rounded-lg border p-4">
        <p class="eyebrow text-muted-foreground">
          Donat · komposisi grading
        </p>
        <DonutChart :items="donut" center-label="Total grading" unit="kg" />
      </div>

      <div class="grid min-w-0 content-start gap-3 rounded-lg border p-4">
        <p class="eyebrow text-muted-foreground">
          Segmented bar · komposisi grading (tipis &amp; tinggi)
        </p>
        <SegmentedBar :items="donut" variant="thin" unit="kg" label="Komposisi grading" :legend="false" />
        <SegmentedBar :items="donut" variant="tall" unit="kg" label="Komposisi grading" />
      </div>

      <div class="grid min-w-0 content-start gap-3 rounded-lg border p-4">
        <p class="eyebrow text-muted-foreground">
          Diverging · selisih HD terhadap standar per kandang
        </p>
        <DivergingBars :items="gap" label="Selisih HD terhadap standar per kandang" />
      </div>

      <div class="grid min-w-0 content-start gap-3 rounded-lg border p-4">
        <p class="eyebrow text-muted-foreground">
          Heatmap · mortalitas harian (%)
        </p>
        <Heatmap
          ramp="bad"
          :rows="HOUSES.map(h => `Kandang ${h}`)" :cols="DAYS" :values="heat" :thresholds="[0.01, 0.02, 0.04, 0.06, 0.08]"
          :format="(n: number) => formatNumber(n * 100, 1)" unit="%" label="Mortalitas harian per kandang"
        />
      </div>

      <div class="grid min-w-0 items-start gap-6 lg:col-span-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div class="grid min-w-0 content-start gap-4 rounded-lg border p-4">
          <p class="eyebrow text-muted-foreground">
            Radial gauge · pencapaian HD
          </p>
          <RadialGauge :value="sparkLast" :target="93" label="Hen day production" />
        </div>

        <div class="grid min-w-0 content-start gap-4 rounded-lg border p-4">
          <p class="eyebrow text-muted-foreground">
            Small multiples · tren HD per kandang
          </p>
          <SmallMultiples :items="multiples" :labels="DAYS" :target="93" label="HD per kandang selama 7 hari" />
        </div>
      </div>
    </div>
  </KitSection>
</template>
