<script setup lang="ts">
import type { DocStatus } from '@/components/aapm/erp/types'

import { BarList, BulletChart, DonutChart, Heatmap, Sparkline, TrendDelta } from '@/components/aapm/charts'
import StatusChip from '@/components/aapm/erp/status-chip.vue'
import AapmIcon from '@/components/aapm/icon/AapmIcon.vue'
import AnimatedNumber from '@/components/aapm/motion/animated-number.vue'
import AutoHeight from '@/components/aapm/motion/auto-height.vue'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Table, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useStagedList } from '@/composables/use-staged-list'
import { formatNumber, formatRupiah } from '@/lib/format-id'

import KitSection from './kit-section.vue'

/* ── EntityDataTable (ERP contract): search, filters, count, sort, selection, empty vs no-match ── */
interface Receipt { id: string, supplier: string, kg: number, value: number, status: DocStatus, date: string }
const ALL: Receipt[] = [
  { id: 'GRN-2611-0087', supplier: 'CV Minang Pangan', kg: 7250.5, value: 38_427_650, status: 'submitted', date: '05/11/2026' },
  { id: 'GRN-2611-0086', supplier: 'PT Sumber Jagung Sumbar', kg: 12000, value: 61_200_000, status: 'posted', date: '04/11/2026' },
  { id: 'GRN-2611-0085', supplier: 'UD Dedak Sejahtera', kg: 3400, value: 11_560_000, status: 'verified', date: '04/11/2026' },
  { id: 'GRN-2611-0084', supplier: 'Koperasi Peternak Lima Puluh Kota', kg: 860, value: 4_644_000, status: 'draft', date: '03/11/2026' },
  { id: 'GRN-2611-0083', supplier: 'PT Sumber Jagung Sumbar', kg: 9800, value: 49_980_000, status: 'rejected', date: '02/11/2026' },
  { id: 'GRN-2611-0082', supplier: 'CV Minang Pangan', kg: 5100, value: 27_030_000, status: 'posted', date: '01/11/2026' },
]
const rows = ref<Receipt[]>([...ALL])
const query = shallowRef('')
const statuses = ref<string[]>([])
const sortKey = shallowRef<'date' | 'kg' | 'value'>('date')
const sortDir = shallowRef<1 | -1>(-1)
const selected = ref<string[]>([])

const visible = computed(() => {
  const q = query.value.trim().toLowerCase()
  const list = rows.value.filter(r => (!q || r.id.toLowerCase().includes(q) || r.supplier.toLowerCase().includes(q))
    && (!statuses.value.length || statuses.value.includes(r.status)))
  const key = sortKey.value
  return [...list].sort((a, b) => {
    const av = key === 'date' ? a.id : a[key]
    const bv = key === 'date' ? b.id : b[key]
    return (av > bv ? 1 : av < bv ? -1 : 0) * sortDir.value
  })
})
// Rendered rows: rows that leave fade + compress in place before the survivors FLIP and new rows enter.
const { items: shown, leaving } = useStagedList(visible, r => r.id)
const hasFilters = computed(() => !!query.value || statuses.value.length > 0)
function sortBy(key: typeof sortKey.value) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 1 ? -1 : 1
  }
  else {
    sortKey.value = key
    sortDir.value = -1
  }
}
function toggle(id: string, on: boolean | 'indeterminate') {
  selected.value = on === true ? [...selected.value, id] : selected.value.filter(x => x !== id)
}
const allOnPage = computed(() => visible.value.length > 0 && visible.value.every(r => selected.value.includes(r.id)))
function toggleAll(on: boolean | 'indeterminate') {
  selected.value = on === true ? visible.value.map(r => r.id) : []
}
function reset() {
  query.value = ''
  statuses.value = []
}
const ariaSort = (key: typeof sortKey.value) => (sortKey.value === key ? (sortDir.value === 1 ? 'ascending' : 'descending') : 'none')

/* ── Chart kit samples ── */
const spark = [88.2, 89.1, 90.4, 91.8, 92.6, 92.1, 91.4, 92.9, 93.2, 92.8, 93.4, 92.6, 91.9, 92.4]
const counter = shallowRef(6793)
</script>

<template>
  <KitSection id="tabel" eyebrow="EntityDataTable" title="Daftar penerimaan barang" description="Saat data berubah (cari, filter, urutkan) baris yang keluar memudar dan mengecil di tempat, baris yang tersisa bergeser ke posisi barunya, lalu baris baru mengalir masuk. Tinggi tabel ikut beranimasi sehingga konten di bawahnya bergeser halus.">
    <div class="flex flex-wrap items-center gap-2">
      <div class="relative min-w-0 flex-1 basis-56">
        <AapmIcon name="search" :size="16" class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input v-model="query" placeholder="Cari no. GRN atau pemasok" class="pl-8" aria-label="Cari penerimaan" />
      </div>
      <ToggleGroup v-model="statuses" type="multiple" variant="outline" size="sm" aria-label="Filter status" class="max-w-full flex-wrap gap-1">
        <ToggleGroupItem value="draft">
          Draft
        </ToggleGroupItem>
        <ToggleGroupItem value="submitted">
          Diajukan
        </ToggleGroupItem>
        <ToggleGroupItem value="posted">
          Terposting
        </ToggleGroupItem>
        <ToggleGroupItem value="rejected">
          Ditolak
        </ToggleGroupItem>
      </ToggleGroup>
      <Button v-if="hasFilters" variant="ghost" size="sm" @click="reset">
        <AapmIcon name="reject" :size="14" />
        Reset filter
      </Button>
    </div>

    <div class="flex min-h-8 flex-wrap items-center justify-between gap-2 text-sm" aria-live="polite">
      <span class="text-muted-foreground"><span class="font-semibold text-foreground numeric">{{ visible.length }}</span> dari {{ rows.length }} penerimaan</span>
      <Transition enter-active-class="transition-[opacity,transform] duration-200 ease-emphasis" enter-from-class="opacity-0 translate-y-1" leave-active-class="transition-opacity duration-100" leave-to-class="opacity-0">
        <span v-if="selected.length" class="inline-flex items-center gap-2 rounded-md bg-muted px-2 py-1">
          <span class="font-medium">{{ selected.length }} dipilih di halaman ini</span>
          <Button size="xs" variant="outline">Verifikasi</Button>
          <Button size="xs" variant="ghost" @click="selected = []">Batal</Button>
        </span>
      </Transition>
    </div>

    <AutoHeight>
      <div class="overflow-x-auto rounded-lg border" role="region" aria-label="Tabel penerimaan" tabindex="0">
        <Table class="min-w-[680px]">
          <TableHeader>
            <TableRow>
              <TableHead class="w-10">
                <Checkbox :model-value="allOnPage" aria-label="Pilih semua di halaman ini" @update:model-value="toggleAll" />
              </TableHead>
              <TableHead :aria-sort="ariaSort('date')">
                <button type="button" class="inline-flex items-center gap-1 font-medium" @click="sortBy('date')">
                  No. GRN
                  <AapmIcon :name="sortKey === 'date' ? (sortDir === 1 ? 'arrowUp' : 'arrowDown') : 'sort'" :size="13" />
                </button>
              </TableHead>
              <TableHead>Pemasok</TableHead>
              <TableHead class="text-right" :aria-sort="ariaSort('kg')">
                <button type="button" class="inline-flex items-center gap-1 font-medium" @click="sortBy('kg')">
                  Berat (kg)
                  <AapmIcon :name="sortKey === 'kg' ? (sortDir === 1 ? 'arrowUp' : 'arrowDown') : 'sort'" :size="13" />
                </button>
              </TableHead>
              <TableHead class="text-right" :aria-sort="ariaSort('value')">
                <button type="button" class="inline-flex items-center gap-1 font-medium" @click="sortBy('value')">
                  Nilai (Rp)
                  <AapmIcon :name="sortKey === 'value' ? (sortDir === 1 ? 'arrowUp' : 'arrowDown') : 'sort'" :size="13" />
                </button>
              </TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TransitionGroup tag="tbody" data-slot="table-body" data-aapm-staged class="[&_tr:last-child]:border-0" move-class="aapm-row-move" enter-active-class="aapm-row-enter-active" enter-from-class="aapm-row-enter-from" leave-active-class="aapm-row-leave-active">
            <template v-if="shown.length">
              <TableRow v-for="r in shown" :key="r.id" :data-state="selected.includes(r.id) ? 'selected' : undefined" :data-leaving="leaving.has(r.id) || undefined">
                <TableCell>
                  <Checkbox :model-value="selected.includes(r.id)" :aria-label="`Pilih ${r.id}`" @update:model-value="v => toggle(r.id, v)" />
                </TableCell>
                <TableCell class="font-mono text-xs">
                  {{ r.id }}
                </TableCell>
                <TableCell class="max-w-[14rem] truncate" :title="r.supplier">
                  {{ r.supplier }}
                </TableCell>
                <TableCell class="text-right numeric">
                  {{ formatNumber(r.kg, r.kg % 1 ? 1 : 0) }}
                </TableCell>
                <TableCell class="text-right numeric">
                  {{ formatNumber(r.value) }}
                </TableCell>
                <TableCell>
                  <StatusChip :status="r.status" />
                </TableCell>
              </TableRow>
            </template>
            <TableRow v-else key="__empty">
              <TableCell colspan="6" class="h-32 text-center">
                <div data-slot="empty-content" class="mx-auto grid max-w-sm justify-items-center gap-2 text-sm">
                  <AapmIcon :name="hasFilters ? 'search' : 'inventory'" :size="20" class="text-muted-foreground" />
                  <p class="font-medium">
                    {{ hasFilters ? 'Tidak ada yang cocok dengan filter' : 'Belum ada penerimaan' }}
                  </p>
                  <p class="text-muted-foreground">
                    {{ hasFilters ? `Ada ${rows.length} penerimaan, tetapi tidak ada yang sesuai pencarian ini.` : 'Penerimaan baru akan muncul di sini.' }}
                  </p>
                  <Button v-if="hasFilters" size="sm" variant="outline" @click="reset">
                    Reset filter
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TransitionGroup>
        </Table>
      </div>
    </AutoHeight>
  </KitSection>

  <KitSection id="visual" eyebrow="Visualisasi data" title="Chart kit AAPM" description="Garis tergambar saat masuk layar, bar tumbuh dari nol, angka menghitung naik; hover meredupkan seri lain. Semua memakai palet yang lolos validasi buta warna.">
    <div class="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      <div class="grid gap-2 rounded-lg border p-4">
        <p class="eyebrow text-muted-foreground">
          Sparkline + delta
        </p>
        <p class="flex items-baseline gap-1 text-[1.75rem] font-semibold tracking-display">
          <AnimatedNumber :value="counter" :format="(n: number) => formatNumber(n)" /><span class="text-sm text-muted-foreground">kg</span>
        </p>
        <TrendDelta :value="2.4" period="vs kemarin" />
        <Sparkline :values="spark" :height="48" label="HD 14 hari" :format="(n: number) => `${formatNumber(n, 1)}%`" />
        <Button size="sm" variant="ghost" class="justify-self-start" @click="counter = Math.round(counter * (0.92 + Math.random() * 0.16))">
          Acak angka
        </Button>
      </div>
      <div class="grid content-start gap-4 rounded-lg border p-4">
        <p class="eyebrow text-muted-foreground">
          Bullet · aktual vs target
        </p>
        <BulletChart label="Jagung giling" :actual="6.2" :target="14" :max="18" unit="ton" meta="≈ 3 hari pemakaian" :format="(n: number) => formatNumber(n, 1)" />
        <BulletChart label="Konsentrat" :actual="9.8" :target="10" :max="14" unit="ton" :format="(n: number) => formatNumber(n, 1)" />
      </div>
      <div class="rounded-lg border p-4">
        <p class="eyebrow mb-3 text-muted-foreground">
          Komposisi
        </p>
        <DonutChart :size="148" :thickness="16" center-label="Grading" unit="kg" :items="[{ label: 'Grade A', value: 3968, color: 'var(--chart-1)' }, { label: 'Grade B', value: 1847, color: 'var(--chart-2)' }, { label: 'Kecil', value: 616, color: 'var(--chart-4)' }, { label: 'Retak', value: 274, color: 'var(--chart-3)' }]" />
      </div>
      <div class="rounded-lg border p-4 md:col-span-2">
        <p class="eyebrow mb-3 text-muted-foreground">
          Heatmap · mortalitas mingguan (%)
        </p>
        <Heatmap
          :rows="['A1', 'A2', 'B1', 'B3']" :cols="['W40', 'W41', 'W42', 'W43', 'W44', 'W45']"
          :values="[[0.05, 0.07, 0.08, 0.05, 0.04, 0.05], [0.04, 0.09, 0.08, 0.06, 0.05, 0.04], [0.06, 0.1, 0.11, 0.06, 0.06, 0.07], [0.07, 0.1, 0.12, 0.13, 0.17, 0.21]]"
          :thresholds="[0.04, 0.06, 0.08, 0.11, 0.15]" :format="(n: number) => `${formatNumber(n, 2)}%`" label="Mortalitas mingguan contoh"
        />
      </div>
      <div class="rounded-lg border p-4">
        <p class="eyebrow mb-3 text-muted-foreground">
          Ranking
        </p>
        <BarList label="Produksi per kandang" unit="kg" :items="[{ label: 'Kandang B2', value: 948 }, { label: 'Kandang A1', value: 921 }, { label: 'Kandang A4', value: 660, flag: 'Di bawah standar' }]" />
      </div>
    </div>
    <p class="text-xs text-muted-foreground">
      Nilai {{ formatRupiah(482_650_000, { compact: true }) }} dan angka lain di halaman ini adalah data contoh.
    </p>
  </KitSection>
</template>
