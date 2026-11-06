<script setup lang="ts">
import type { ActionAvailability, ActivityEntry, Approver, CorrectionField, DecisionContext, Delegation, FeatureAvailability, Readiness, Revision } from '@/design-system/contracts'

import { notify } from '@/components/aapm/feedback/notify'
import ActivityFeed from '@/components/aapm/work/ActivityFeed.vue'
import ApprovalDelegation from '@/components/aapm/work/ApprovalDelegation.vue'
import CorrectionForm from '@/components/aapm/work/CorrectionForm.vue'
import DecisionForm from '@/components/aapm/work/DecisionForm.vue'
import Entity360 from '@/components/aapm/work/Entity360.vue'
import FeatureGate from '@/components/aapm/work/FeatureGate.vue'
import KeyValueList from '@/components/aapm/work/KeyValueList.vue'
import ProgressLog from '@/components/aapm/work/ProgressLog.vue'
import ReadinessReview from '@/components/aapm/work/ReadinessReview.vue'
import ReasonedAction from '@/components/aapm/work/ReasonedAction.vue'
import RelatedObjects from '@/components/aapm/work/RelatedObjects.vue'
import RevisionDiff from '@/components/aapm/work/RevisionDiff.vue'
import { wrapButtonClass } from '@/components/aapm/work/wrap'
import { Button } from '@/components/ui/button'

import KitSection from './kit-section.vue'

/** B2b demos: every lifecycle pattern with farm sample data (no business logic lives in the components). */
const now = Date.now()
const minutesAgo = (m: number) => now - m * 60_000

// ── Kesiapan: four results + PC05 onboarding ─────────────────────────────────
const readinessSamples: Readiness[] = [
  { subject: 'Posting GRN-2611-0087', result: 'ready', blockers: [], satisfied: ['Periode November terbuka', 'Semua baris punya lot', 'Pemasok aktif'], evaluatedAt: minutesAgo(2), next: { label: 'Posting sekarang' } },
  { subject: 'Koreksi GRN-2611-0086', result: 'blocked', evaluatedAt: minutesAgo(5), blockers: [
    { code: 'PI', title: 'Faktur PI-2611-031 sudah memakai baris 2', reason: 'Baris yang sudah difakturkan tidak bisa dikoreksi langsung.', resolution: 'Batalkan tautan faktur, lalu evaluasi ulang.', source: { label: 'Buka faktur' } },
    { code: 'LOT', title: 'Lot KL-2611-11 sudah keluar 200 kg ke mixing', reason: 'Koreksi akan membuat saldo lot negatif.', resolution: 'Catat pengembalian dari mixing terlebih dulu.' },
  ], satisfied: ['Pengguna berwenang'], next: { label: 'Buka koreksi' } },
  { subject: 'Tutup siklus Flok A1-2026', result: 'incomplete', blockers: [{ code: 'REC', title: 'Rekap mortalitas minggu 52 belum diisi', reason: 'Penutupan butuh rekap lengkap sampai minggu afkir.' }], next: { label: 'Tutup siklus' } },
  { subject: 'Pembayaran pemasok CV Minang Pangan', result: 'unknown', blockers: [], next: { label: 'Bayar' } },
]
const onboarding: Readiness = {
  subject: 'Perusahaan siap posting · PT AAPM Unit Pakan',
  result: 'blocked',
  evaluatedAt: minutesAgo(12),
  blockers: [
    { code: 'COA', title: 'Bagan akun belum lengkap', reason: 'Akun persediaan pakan dan HPP belum dipetakan.', resolution: 'Lengkapi pemetaan akun di Pengaturan › Akuntansi.', source: { label: 'Buka pemetaan akun' } },
    { code: 'OPEN', title: 'Periode pembukaan belum ditetapkan', reason: 'Saldo awal tidak bisa diposting tanpa periode pembukaan.', resolution: 'Tetapkan periode Januari 2026 sebagai pembukaan.' },
    { code: 'WH', title: 'Master gudang kosong', reason: 'Penerimaan barang butuh minimal satu gudang aktif.', resolution: 'Tambahkan gudang pakan utama.' },
  ],
  satisfied: ['Keanggotaan dan peran sudah diatur', 'Kategori barang terisi'],
  next: { label: 'Aktifkan posting' },
}

// ── Aksi beralasan ───────────────────────────────────────────────────────────
const actionStates: { label: string, availability: ActionAvailability }[] = [
  { label: 'Ajukan', availability: { state: 'available' } },
  { label: 'Posting', availability: { state: 'disabled', reason: 'Periode Oktober sudah ditutup — pakai tanggal November.' } },
  { label: 'Menyimpan…', availability: { state: 'loading' } },
  { label: 'Diajukan', availability: { state: 'done', note: 'menunggu review' } },
]
const rows = [
  { id: 'GRN-2611-0087', status: 'Diajukan', edit: { state: 'disabled', reason: 'Dokumen sedang direview; edit dikunci.' } as ActionAvailability },
  { id: 'GRN-2611-0086', status: 'Terposting', edit: { state: 'disabled', reason: 'Dokumen terposting hanya bisa dikoreksi lewat alur koreksi.' } as ActionAvailability },
  { id: 'GRN-2611-0084', status: 'Draft', edit: { state: 'available' } as ActionAvailability },
]

// ── Keputusan & koreksi ──────────────────────────────────────────────────────
const decision: DecisionContext = {
  document: 'Koreksi GRN-2611-0086',
  company: 'PT Agung Abadi Putra Mandiri',
  options: [
    { value: 'approve', label: 'Setujui', tone: 'approve', reasonRequired: false, effect: 'Kuantitas baris 2 menjadi 1.250,5 kg; jurnal stok disesuaikan.' },
    { value: 'return', label: 'Kembalikan', tone: 'neutral', reasonRequired: true, effect: 'Pengaju diminta memperbaiki koreksi.' },
    { value: 'reject', label: 'Tolak', tone: 'reject', reasonRequired: true, effect: 'Koreksi ditolak; dokumen tetap seperti semula.' },
  ],
  impacts: [{ label: 'Stok jagung giling', unit: 'kg', before: 18_400, change: 50.5 }],
  evidence: [{ label: 'Foto timbangan ulang', href: '#revisi' }],
}
let failNext = true
async function submitDecision() {
  await new Promise(r => setTimeout(r, 700))
  // The first attempt "times out" to show the outcome-unknown path; the retry succeeds.
  if (failNext) {
    failNext = false
    throw new Error('timeout')
  }
  notify.success('Keputusan tersimpan', { description: 'Koreksi GRN-2611-0086 disetujui.' })
}
const correctionFields: CorrectionField[] = [
  { key: 'qty', label: 'Kuantitas baris 2', unit: 'kg', original: '1.200', kind: 'number' },
  { key: 'lot', label: 'Lot baris 2', original: 'KL-2611-10', kind: 'text' },
]
function onCorrectionSubmit(payload: { revisions: Revision[] }) {
  notify.success('Koreksi diajukan', { description: `${payload.revisions.length} perubahan menunggu persetujuan.` })
}

// ── Progres, revisi, aktivitas ───────────────────────────────────────────────
const progress = ref<ActivityEntry[]>([
  { id: 'p1', kind: 'progress', actor: 'Andi Saputra', at: minutesAgo(180), reason: 'Vaksin ND kandang A1: 4.200 ekor' },
  { id: 'p2', kind: 'progress', actor: 'Andi Saputra', at: minutesAgo(150), reason: 'Vaksin ND kandang A1: 4.250 ekor (hitung ulang)', corrects: 'p1' },
])
function appendProgress(entry: { note: string, corrects?: string }) {
  progress.value = [...progress.value, { id: `p${progress.value.length + 1}`, kind: 'progress', actor: 'Anda', at: Date.now(), reason: entry.note, corrects: entry.corrects }]
}
const revisions: Revision[] = [
  { field: 'Kuantitas baris 2', before: '1.200 kg', after: '1.250,5 kg', reason: 'Timbang ulang di gudang pakan', actor: 'Yulia Fitri', at: minutesAgo(40), evidence: [{ label: 'Foto timbangan', href: '#revisi' }], stateBefore: 'work.completed', stateAfter: 'history.corrected' },
  { field: 'Lot baris 2', before: 'KL-2611-10', after: 'KL-2611-11', reason: 'Label karung salah baca', actor: 'Yulia Fitri', at: minutesAgo(40) },
]
const activity: ActivityEntry[] = [
  { id: 'a1', kind: 'submitted', actor: 'Yulia Fitri', role: 'Gudang pakan', at: minutesAgo(45), reason: 'Koreksi kuantitas setelah timbang ulang' },
  { id: 'a2', kind: 'approved', actor: 'Doni Pratama', role: 'Kepala gudang', at: minutesAgo(41) },
  { id: 'a3', kind: 'corrected', actor: 'Sistem', role: 'Posting otomatis', at: minutesAgo(40), revisions, source: { label: 'Dokumen', ref: 'GRN-2611-0086' }, correlationId: 'req_01JC9X7Q4N2V8T' },
]

// ── Ringkasan, terkait, entitas 360 ──────────────────────────────────────────
const summary = [
  { key: 'Pemasok', value: 'CV Minang Pangan' },
  { key: 'Tanggal bisnis', value: '04/11/2026' },
  { key: 'Gudang', value: 'Gudang pakan · Payakumbuh' },
  { key: 'Total berat', value: '12.000', unit: 'kg' },
  { key: 'Nilai', value: 'Rp 61.200.000' },
  { key: 'Catatan', value: '' },
]
const related = [
  { label: 'Faktur pembelian', ref: 'PI-2611-031', state: 'work.completed' as const, to: '/ui-kit#terkait', meta: 'Rp 61.200.000' },
  { label: 'Jurnal stok', ref: 'JS-2611-0412', state: 'work.completed' as const, to: '/ui-kit#terkait' },
  { label: 'Retur ke pemasok', ref: 'RT-2611-002', state: 'work.draft' as const },
]

// ── Delegasi & fitur ─────────────────────────────────────────────────────────
const approvers: Approver[] = [
  { name: 'Rina Sari', role: 'Manajer gudang', onBehalfOf: 'Doni Pratama' },
  { name: 'Hendra Wijaya', role: 'Kontroler keuangan' },
]
const delegations: Delegation[] = [
  { delegator: 'Doni Pratama', delegate: 'Rina Sari', from: new Date('2026-11-04T00:00:00+07:00'), to: new Date('2026-11-08T00:00:00+07:00'), scope: 'Persetujuan penerimaan barang' },
]
const features: FeatureAvailability[] = [
  { feature: 'Posting otomatis', enabled: false, reason: 'Akun persediaan belum dipetakan untuk perusahaan ini.', setting: { key: 'inventory.account', scope: 'company', to: '/settings' } },
  { feature: 'Impor penerimaan (CSV)', enabled: true },
]
</script>

<template>
  <div class="grid gap-4">
    <KitSection id="kesiapan" eyebrow="UI-WRK-READINESS · PC05" title="Kesiapan & pemblokir" description="Hasil kesiapan dihitung server; komponen menjelaskan hasilnya, urutan pemblokir milik konsumen, dan aksi berikutnya hanya tersedia saat siap. Termasuk contoh onboarding perusahaan.">
      <div class="grid gap-4 lg:grid-cols-2">
        <div v-for="r in readinessSamples" :key="r.subject" class="rounded-xl border p-4">
          <ReadinessReview :readiness="r" @open="notify.info('Membuka sumber', { description: $event.label })" @next="notify.success($event.label)" />
        </div>
      </div>
      <div class="rounded-xl border p-4">
        <ReadinessReview :readiness="onboarding" />
      </div>
    </KitSection>

    <KitSection id="aksi-beralasan" eyebrow="UI-FRM-008" title="Aksi beserta alasan" description="Tersedia, nonaktif dengan alasan, memuat, selesai. Tombol nonaktif tetap bisa difokus — alasannya muncul saat hover atau fokus dan dibacakan pembaca layar.">
      <div class="flex flex-wrap gap-3">
        <ReasonedAction v-for="a in actionStates" :key="a.label" :availability="a.availability" variant="outline" @activate="notify.success(a.label)">
          {{ a.label }}
        </ReasonedAction>
      </div>
      <div role="region" aria-label="Contoh aksi per baris" tabindex="0" class="overflow-x-auto rounded-lg border">
        <table class="w-full min-w-[28rem] text-sm">
          <thead class="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>
              <th scope="col" class="px-3 py-2 font-medium">
                Dokumen
              </th>
              <th scope="col" class="px-3 py-2 font-medium">
                Status
              </th>
              <th scope="col" class="px-3 py-2 font-medium">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id" class="border-t">
              <th scope="row" class="px-3 py-2 text-left font-mono text-xs font-normal">
                {{ row.id }}
              </th>
              <td class="px-3 py-2">
                {{ row.status }}
              </td>
              <td class="px-3 py-2">
                <ReasonedAction :availability="row.edit" size="sm" variant="outline" @activate="notify.info(`Edit ${row.id}`)">
                  Edit
                </ReasonedAction>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </KitSection>

    <div class="grid gap-4 xl:grid-cols-2">
      <KitSection id="keputusan" eyebrow="UI-FRM-007" title="Form keputusan" description="Alasan wajib untuk Kembalikan dan Tolak. Konfirmasi menyebut dokumen, perusahaan, dan dampak. Percobaan pertama di demo ini sengaja 'timeout' untuk menunjukkan Hasil belum pasti.">
        <DecisionForm :context="decision" :submit="submitDecision" @check-status="notify.info('Status: menunggu konfirmasi server')" />
      </KitSection>
      <KitSection id="koreksi" eyebrow="UI-FRM-011" title="Form koreksi" description="Nilai semula tetap terlihat, hanya field yang berubah menjadi revisi, alasan wajib. Angka mengikuti format Indonesia; format ambigu ditolak.">
        <CorrectionForm :fields="correctionFields" actor="Yulia Fitri" @submit="onCorrectionSubmit" />
      </KitSection>
    </div>

    <div class="grid gap-4 xl:grid-cols-2">
      <KitSection id="progres" eyebrow="UI-FRM-010" title="Catatan progres" description="Hanya bisa ditambah. Kesalahan dikoreksi dengan entri baru yang merujuk entri lama.">
        <ProgressLog :entries="progress" @append="appendProgress" />
      </KitSection>
      <KitSection id="revisi" eyebrow="UI-DAT-010" title="Ringkasan revisi" description="Field, semula → sekarang, alasan, pelaku, waktu, bukti, dan perubahan status.">
        <RevisionDiff :revisions="revisions" />
      </KitSection>
    </div>

    <KitSection id="aktivitas" eyebrow="UI-DAT-017 · PC11" title="Narasi aktivitas & lineage" description="Riwayat imutabel: pelaku, aksi, alasan, status, revisi inline, sumber dokumen, dan ID korelasi permintaan.">
      <ActivityFeed :entries="activity" terminal="Terkoreksi · revisi tercatat, dokumen terkunci" />
    </KitSection>

    <div class="grid gap-4 xl:grid-cols-2">
      <KitSection id="ringkasan" eyebrow="UI-DAT-007" title="Ringkasan record" description="Fakta key-value dengan satuan; nilai kosong ditulis —.">
        <KeyValueList :items="summary" />
      </KitSection>
      <KitSection id="terkait" eyebrow="UI-DAT-011" title="Dokumen terkait" description="Relasi milik konsumen; komponen mendaftar, memberi status, dan menautkan.">
        <RelatedObjects :items="related" />
      </KitSection>
    </div>

    <KitSection id="entitas-360" eyebrow="UI-DAT-012" title="Entity 360" description="Ringkasan pemasok, lalu aktivitas, dokumen terkait, dan dokumen.">
      <Entity360 title="CV Minang Pangan" subtitle="Pemasok jagung & dedak · Payakumbuh" state="work.completed">
        <template #summary>
          <KeyValueList :columns="3" :items="[{ key: 'Pemasok sejak', value: '2019' }, { key: 'Penerimaan 30 hari', value: '7', unit: 'dokumen' }, { key: 'Total berat 30 hari', value: '38.250', unit: 'kg' }]" />
        </template>
        <template #activity>
          <ActivityFeed :entries="activity" />
        </template>
        <template #related>
          <RelatedObjects :items="related" />
        </template>
      </Entity360>
    </KitSection>

    <div class="grid gap-4 xl:grid-cols-2">
      <KitSection id="delegasi" eyebrow="PC09" title="Persetujuan & delegasi" description="Approver efektif dan delegasi aktif dari server. Tanpa approver berwenang, tampil pemblokir — bukan override diam-diam.">
        <ApprovalDelegation :approvers="approvers" :delegations="delegations" />
        <ApprovalDelegation :approvers="[]" />
      </KitSection>
      <KitSection id="fitur" eyebrow="PC17" title="Ketersediaan fitur" description="Setting wajib yang belum diisi menonaktifkan aksi dengan alasan dan jalan ke pengaturannya; tidak menebak default.">
        <div class="grid gap-4">
          <FeatureGate v-for="f in features" :key="f.feature" :availability="f">
            <Button variant="outline" :class="wrapButtonClass()" @click="notify.success(f.feature)">
              {{ f.feature }}
            </Button>
          </FeatureGate>
        </div>
      </KitSection>
    </div>
  </div>
</template>
