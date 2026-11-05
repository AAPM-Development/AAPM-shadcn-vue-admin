<script setup lang="ts">
import { toast } from 'vue-sonner'

import AapmIcon from '@/components/aapm/icon/AapmIcon.vue'
import { BasicPage } from '@/components/global-layout'
import { Button } from '@/components/ui/button'

import OverviewContent from './components/overview-content.vue'
import { COMPANY_NAME, IS_SAMPLE_DATA, PERIOD_LABEL, SITE_NAME, UPDATED_AT } from './data/farm-overview'

function exportReport() {
  toast('Ekspor disiapkan', {
    description: `Ringkasan ${SITE_NAME}, periode ${PERIOD_LABEL}. Berkas akan muncul di unduhan setelah selesai.`,
  })
}
</script>

<template>
  <BasicPage
    :overline="`${SITE_NAME} · ${PERIOD_LABEL}`"
    title="Ringkasan produksi"
    description="118.460 ekor aktif di 8 kandang. Mulai dari antrean tindakan, lalu periksa tren dan stok."
  >
    <template #actions>
      <Button variant="outline" @click="exportReport">
        <AapmIcon name="export" :size="16" />
        Ekspor
      </Button>
      <Button>
        <AapmIcon name="add" :size="16" />
        Catat produksi
      </Button>
    </template>

    <!-- Context strip: company, period, freshness, data provenance (UX-03 / UX-09) -->
    <div class="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
      <span class="inline-flex items-center gap-1.5">
        <AapmIcon name="company" :size="14" />
        <span class="font-medium text-foreground">{{ COMPANY_NAME }}</span>
      </span>
      <span class="inline-flex items-center gap-1.5">
        <AapmIcon name="location" :size="14" />
        {{ SITE_NAME }}
      </span>
      <span class="inline-flex items-center gap-1.5">
        <AapmIcon name="refresh" :size="14" />
        Diperbarui {{ UPDATED_AT }}
      </span>
      <span
        v-if="IS_SAMPLE_DATA"
        class="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-warning"
        title="Angka di halaman ini adalah data contoh dan belum terhubung ke ERP."
      >
        <AapmIcon name="info" :size="13" />
        Data contoh — belum terhubung ke ERP
      </span>
    </div>

    <OverviewContent />
  </BasicPage>
</template>
