<script setup lang="ts">
import type { ToneDomain } from '@/components/aapm/tone/tones'

import FreshnessIndicator from '@/components/aapm/tone/freshness-indicator.vue'
import StateChip from '@/components/aapm/tone/state-chip.vue'
import ToneChip from '@/components/aapm/tone/tone-chip.vue'
import { semanticOf, TONE_MAP, TONES } from '@/components/aapm/tone/tones'
import brandTokens from '@/design-system/brand/aapm-brand.tokens.json'
import { SEMANTIC_STATES, STATE_FAMILIES } from '@/design-system/states'

import KitSection from './kit-section.vue'

/** Indonesian labels for the domain values shown in the map below. */
const LABELS: Partial<Record<ToneDomain, Record<string, string>>> = {
  doc: { draft: 'Draft', submitted: 'Diajukan', review: 'Dalam review', verified: 'Terverifikasi', posted: 'Terposting', paid: 'Lunas', rejected: 'Ditolak', reversed: 'Dibalik', locked: 'Periode dikunci' },
  task: { 'backlog': 'Backlog', 'todo': 'Akan dikerjakan', 'in progress': 'Dikerjakan', 'done': 'Selesai', 'canceled': 'Dibatalkan' },
  priority: { low: 'Rendah', medium: 'Sedang', high: 'Tinggi' },
  user: { active: 'Aktif', inactive: 'Nonaktif', invited: 'Diundang', suspended: 'Ditangguhkan' },
  billing: { paid: 'Lunas', unpaid: 'Belum dibayar', overdue: 'Lewat jatuh tempo', cancelled: 'Dibatalkan' },
  order: { draft: 'Draft', shipped: 'Dikirim', paid: 'Lunas', due: 'Jatuh tempo' },
}
const DOMAIN_TITLES: Partial<Record<ToneDomain, string>> = {
  doc: 'Dokumen ERP',
  task: 'Status tugas',
  priority: 'Prioritas',
  user: 'Status pengguna',
  billing: 'Tagihan',
  order: 'Pesanan',
}
const domains = Object.keys(DOMAIN_TITLES) as ToneDomain[]

/** Ecosystem §17 state families, as shown in the "Status semantik" section. */
const FAMILY_TITLES = { data: 'Data', freshness: 'Kesegaran & koneksi', work: 'Pekerjaan', history: 'Riwayat & disposisi' } as const
const families = STATE_FAMILIES.map(family => ({
  family,
  title: FAMILY_TITLES[family],
  states: (Object.keys(SEMANTIC_STATES) as (keyof typeof SEMANTIC_STATES)[]).filter(key => SEMANTIC_STATES[key].family === family),
}))

/** Fixed sample times so the freshness demo reads the same on every visit. */
const now = new Date('2026-11-05T10:00:00+07:00')
const minutesAgo = (m: number) => new Date(now.getTime() - m * 60_000)
const freshness = [
  { state: 'current', since: minutesAgo(2) },
  { state: 'stale', since: minutesAgo(190) },
  { state: 'offline', since: minutesAgo(60 * 26) },
  { state: 'syncing', since: minutesAgo(0.3) },
  { state: 'sync_failed', since: minutesAgo(15) },
] as const
const retries = shallowRef(0)

/** Generated brand variables (src/assets/tokens/brand.generated.css), from the vendored Ecosystem file. */
const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
const brandSwatches = (['core', 'digital'] as const).flatMap(group => Object.entries(brandTokens.brand[group]).map(([name, token]) => ({
  group,
  name,
  variable: `--aapm-brand-${group}-${kebab(name)}`,
  value: token.$value,
})))
</script>

<template>
  <KitSection
    id="warna-kategori" eyebrow="Status" title="Warna kategori"
    description="Setiap status, prioritas, label, peran, dan paket punya warna kategori yang konsisten di seluruh aplikasi — hijau selesai, merah gagal, kuning menunggu, biru berjalan — sehingga kolom bisa dipindai sekilas. Warna tidak pernah sendirian: selalu ada ikon atau titik plus teks. Teks ≥ 4,5:1 dan titik ≥ 3:1 di tema terang dan gelap."
  >
    <div class="grid gap-3">
      <p class="eyebrow text-muted-foreground">
        10 tone · soft, outline, solid
      </p>
      <div class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,9.5rem),1fr))] gap-3">
        <div v-for="tone in TONES" :key="tone" class="grid content-start justify-items-start gap-1.5 rounded-lg border p-3">
          <ToneChip :tone="tone">
            {{ tone }}
          </ToneChip>
          <ToneChip :tone="tone" variant="outline" dot>
            {{ tone }}
          </ToneChip>
          <ToneChip :tone="tone" variant="solid" dot>
            {{ tone }}
          </ToneChip>
        </div>
      </div>
    </div>

    <div class="grid gap-3">
      <p class="eyebrow text-muted-foreground">
        Peta makna per domain
      </p>
      <dl class="grid gap-x-6 gap-y-4 md:grid-cols-2">
        <div v-for="domain in domains" :key="domain" class="grid gap-2">
          <dt class="text-sm font-medium">
            {{ DOMAIN_TITLES[domain] }}
          </dt>
          <dd class="flex flex-wrap content-start items-start gap-1.5">
            <ToneChip v-for="(tone, value) in TONE_MAP[domain]" :key="value" :tone="tone" dot>
              {{ LABELS[domain]?.[value] ?? value }}
            </ToneChip>
          </dd>
        </div>
      </dl>
    </div>
  </KitSection>

  <KitSection
    id="status-semantik" eyebrow="Status" title="Status semantik"
    description="Kosakata status bersama AAPM Ecosystem: data, kesegaran, pekerjaan, dan riwayat. Status bisnis (dokumen, tugas, tagihan, pesanan) dipetakan ke status ini dulu, baru ke warna — warna chip yang sudah ada tidak berubah. Dua status bertanda ekstensi AAPM: draf dan sedang berjalan."
  >
    <dl class="grid gap-x-6 gap-y-4 md:grid-cols-2">
      <div v-for="f in families" :key="f.family" class="grid gap-2">
        <dt class="text-sm font-medium">
          {{ f.title }}
        </dt>
        <dd class="flex flex-wrap content-start items-start gap-1.5">
          <StateChip v-for="state in f.states" :key="state" :state="state" :title="SEMANTIC_STATES[state].extension ? `Ekstensi AAPM: ${SEMANTIC_STATES[state].rationale}` : state" />
        </dd>
      </div>
    </dl>
    <p class="text-xs text-muted-foreground">
      Contoh pemetaan: dokumen “Dalam review” → <code>{{ semanticOf('doc', 'review') }}</code>, tugas “Dibatalkan” → <code>{{ semanticOf('task', 'canceled') }}</code>.
    </p>
  </KitSection>

  <KitSection
    id="freshness" eyebrow="Status" title="Kesegaran data"
    description="Setiap wilayah data mengatakan seberapa baru isinya. Waktu relatif dalam bahasa Indonesia dan tidak pernah terbaca “di masa depan” meski jam perangkat berbeda. Sinkron gagal menawarkan coba lagi."
  >
    <ul class="grid gap-2">
      <li v-for="f in freshness" :key="f.state">
        <FreshnessIndicator :state="f.state" :since="f.since" :now="now" @retry="retries++" />
      </li>
    </ul>
    <p v-if="retries" class="text-xs text-muted-foreground" aria-live="polite">
      Coba lagi ditekan {{ retries }}×.
    </p>
  </KitSection>

  <KitSection
    id="brand-token" eyebrow="Fondasi" title="Sumber token brand"
    description="Nilai Brand Core dan Digital Extension disalin dari AAPM Ecosystem (aapm-brand.tokens.json) dan di-generate menjadi variabel CSS dengan pnpm tokens:sync. Tidak ada hex brand yang ditulis langsung di aplikasi."
  >
    <ul class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,13rem),1fr))] gap-2">
      <li v-for="s in brandSwatches" :key="s.variable" class="flex min-w-0 items-center gap-3 rounded-lg border p-2">
        <span class="size-8 shrink-0 rounded-md border" :style="{ background: `var(${s.variable})` }" aria-hidden="true" />
        <span class="grid min-w-0">
          <span class="truncate text-sm font-medium">{{ s.group }}.{{ s.name }}</span>
          <code class="truncate text-[11px] text-muted-foreground">{{ s.variable }} · {{ s.value }}</code>
        </span>
      </li>
    </ul>
  </KitSection>
</template>
