<script setup lang="ts">
import type { IconName } from '@/components/aapm/icon/registry'

import AapmIcon from '@/components/aapm/icon/AapmIcon.vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import type { RegionState } from './types'

/**
 * UX-07 state & recovery contract for a region. Each state says which case applies and
 * offers the permitted next action — never "No data", never a stack trace.
 */

const props = withDefaults(defineProps<{
  state: RegionState
  /** Support reference shown on server failure. */
  reference?: string
  jobProgress?: number
}>(), {
  reference: 'REQ-7F3A-21C9',
  jobProgress: 42,
})
const emit = defineEmits<{ action: [RegionState] }>()

const COPY: Record<Exclude<RegionState, 'loading'>, { icon: IconName, title: string, body: string, action?: string, tone: string }> = {
  'empty': { icon: 'inventory', title: 'Belum ada penerimaan barang', body: 'Penerimaan yang Anda buat untuk Farm Payakumbuh akan muncul di sini.', action: 'Buat penerimaan', tone: 'text-muted-foreground' },
  'no-matches': { icon: 'search', title: 'Tidak ada yang cocok dengan filter', body: 'Ada 142 penerimaan, tetapi tidak satu pun berstatus "Ditolak" pada Oktober 2026.', action: 'Reset filter', tone: 'text-muted-foreground' },
  'validation': { icon: 'warning', title: '3 isian perlu diperbaiki', body: 'Baris 2: jumlah melebihi PO. Baris 4: lot wajib diisi. Tanggal bisnis berada di periode yang sudah dikunci.', action: 'Ke isian pertama', tone: 'text-warning' },
  'forbidden': { icon: 'denied', title: 'Anda tidak memiliki akses ke laporan ini', body: 'Peran Operator Gudang tidak dapat melihat nilai persediaan. Hubungi admin perusahaan bila Anda memerlukannya.', action: 'Kembali ke ringkasan', tone: 'text-danger' },
  'conflict': { icon: 'history', title: 'Dokumen sudah diubah orang lain', body: 'Yulia Fitri menyimpan versi baru pukul 10.42. Muat ulang untuk melihat perubahan sebelum menyimpan lagi.', action: 'Bandingkan & muat ulang', tone: 'text-warning' },
  'session-expired': { icon: 'locked', title: 'Sesi Anda berakhir', body: 'Masuk lagi untuk melanjutkan. Draft yang sudah tersimpan di server tetap aman; isian yang belum disimpan tidak dipulihkan otomatis.', action: 'Masuk lagi', tone: 'text-muted-foreground' },
  'missing': { icon: 'report', title: 'Dokumen tidak tersedia', body: 'Dokumen ini tidak ditemukan atau tidak berada dalam cakupan perusahaan Anda.', action: 'Kembali ke daftar', tone: 'text-muted-foreground' },
  'offline': { icon: 'offline', title: 'Koneksi terputus', body: 'Perubahan terakhir belum terkirim dan statusnya belum diketahui. Jangan input ulang — periksa status setelah tersambung.', action: 'Periksa status', tone: 'text-warning' },
  'server-error': { icon: 'danger', title: 'Server tidak dapat memproses permintaan', body: 'Coba lagi beberapa saat. Jika berulang, sertakan kode referensi saat menghubungi tim IT.', action: 'Coba lagi', tone: 'text-danger' },
  'job': { icon: 'loading', title: 'Ekspor sedang diproses', body: 'Laporan produksi Oktober 2026 · Farm Payakumbuh. Anda boleh meninggalkan halaman ini.', action: 'Batalkan', tone: 'text-info' },
}
const copy = computed(() => (props.state === 'loading' ? null : COPY[props.state]))
</script>

<template>
  <div class="min-h-56 rounded-xl border p-5" :aria-busy="state === 'loading' || state === 'job'" role="status">
    <!-- Loading: skeleton shaped like the real list, layout stays stable -->
    <div v-if="state === 'loading'" class="grid gap-3" aria-label="Memuat penerimaan barang">
      <Skeleton class="h-4 w-40" />
      <div v-for="i in 4" :key="i" class="grid grid-cols-[1fr_6rem_5rem] items-center gap-4">
        <Skeleton class="h-3.5" :style="{ width: `${70 - i * 8}%` }" />
        <Skeleton class="h-3.5" />
        <Skeleton class="h-5 rounded-md" />
      </div>
    </div>

    <div v-else-if="copy" class="flex h-full flex-col items-start gap-3">
      <AapmIcon :name="copy.icon" :size="22" :class="[copy.tone, state === 'job' ? 'animate-spin' : '']" />
      <div class="space-y-1">
        <p class="font-semibold">
          {{ copy.title }}
        </p>
        <p class="max-w-[60ch] text-sm text-muted-foreground text-pretty">
          {{ copy.body }}
        </p>
        <p v-if="state === 'server-error'" class="font-mono text-xs text-muted-foreground">
          Referensi: {{ reference }}
        </p>
      </div>
      <div v-if="state === 'job'" class="h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-muted">
        <div class="h-full origin-left rounded-full bg-info-fill transition-transform duration-500 ease-emphasis" :style="{ transform: `scaleX(${jobProgress / 100})` }" />
      </div>
      <Button v-if="copy.action" size="sm" :variant="state === 'empty' ? 'default' : 'outline'" @click="emit('action', state)">
        {{ copy.action }}
      </Button>
    </div>
  </div>
</template>
