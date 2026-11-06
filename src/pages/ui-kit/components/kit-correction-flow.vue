<script setup lang="ts">
import type { ActivityEntry, CorrectionField, DecisionContext, Readiness, Revision } from '@/design-system/contracts'
import type { SemanticState } from '@/design-system/states'

import DocumentHeader from '@/components/aapm/erp/document-header.vue'
import StateChip from '@/components/aapm/tone/state-chip.vue'
import ActivityFeed from '@/components/aapm/work/ActivityFeed.vue'
import CorrectionForm from '@/components/aapm/work/CorrectionForm.vue'
import DecisionForm from '@/components/aapm/work/DecisionForm.vue'
import KeyValueList from '@/components/aapm/work/KeyValueList.vue'
import ReadinessReview from '@/components/aapm/work/ReadinessReview.vue'
import RelatedObjects from '@/components/aapm/work/RelatedObjects.vue'
import { wrapButtonClass } from '@/components/aapm/work/wrap'
import { Button } from '@/components/ui/button'

import KitSection from './kit-section.vue'

/**
 * End-to-end demo "Koreksi penerimaan barang" (B2b). The state machine below is demo-only: in the
 * product, readiness, approval and posting come from the server. The components only render data
 * and emit intents, which is exactly what this page wires together.
 */
type Stage = 'review' | 'correcting' | 'deciding' | 'done'

const T0 = new Date('2026-11-04T09:00:00+07:00').getTime()
const minutes = (m: number) => T0 + m * 60_000
const INITIAL_ACTIVITY: ActivityEntry[] = [
  { id: 'h1', kind: 'created', actor: 'Yulia Fitri', role: 'Gudang pakan', at: minutes(0) },
  { id: 'h2', kind: 'submitted', actor: 'Yulia Fitri', role: 'Gudang pakan', at: minutes(12) },
  { id: 'h3', kind: 'approved', actor: 'Doni Pratama', role: 'Kepala gudang', at: minutes(40) },
  { id: 'h4', kind: 'posted', actor: 'Sistem', role: 'Posting otomatis', at: minutes(41) },
]

const stage = shallowRef<Stage>('review')
const docState = shallowRef<SemanticState>('work.completed')
const invoiceLinked = shallowRef(true)
const activity = ref<ActivityEntry[]>([...INITIAL_ACTIVITY])
const pendingRevisions = shallowRef<Revision[]>([])
const flowKey = shallowRef(0)

const readiness = computed<Readiness>(() => ({
  subject: 'Koreksi GRN-2611-0086',
  result: invoiceLinked.value ? 'blocked' : 'ready',
  evaluatedAt: Date.now(),
  blockers: invoiceLinked.value
    ? [{ code: 'PI', title: 'Faktur pembelian PI-2611-031 sudah memakai baris 2', reason: 'Baris yang sudah difakturkan tidak bisa dikoreksi selama tautan faktur aktif.', resolution: 'Batalkan tautan faktur, lalu koreksi bisa dibuka.', source: { label: 'Batalkan tautan faktur', intent: 'unlink' } }]
    : [],
  satisfied: ['Periode November masih terbuka', 'Stok lot KL-2611-11 cukup untuk koreksi', ...(invoiceLinked.value ? [] : ['Tautan faktur PI-2611-031 dibatalkan'])],
  next: { label: 'Buka koreksi', intent: 'open' },
}))

const fields: CorrectionField[] = [
  { key: 'qty', label: 'Kuantitas baris 2', unit: 'kg', original: '1.200', kind: 'number' },
  { key: 'lot', label: 'Lot baris 2', original: 'KL-2611-11', kind: 'text' },
]
const decision: DecisionContext = {
  document: 'Koreksi GRN-2611-0086',
  company: 'PT Agung Abadi Putra Mandiri',
  options: [
    { value: 'approve', label: 'Setujui', tone: 'approve', reasonRequired: false, effect: 'Kuantitas baris 2 menjadi 1.250,5 kg; jurnal stok disesuaikan.' },
    { value: 'return', label: 'Kembalikan', tone: 'neutral', reasonRequired: true, effect: 'Pengaju diminta memperbaiki koreksi.' },
    { value: 'reject', label: 'Tolak', tone: 'reject', reasonRequired: true, effect: 'Koreksi ditolak; dokumen tetap seperti semula.' },
  ],
}

const related = computed(() => [
  { label: 'Faktur pembelian', ref: 'PI-2611-031', state: (invoiceLinked.value ? 'work.completed' : 'history.withdrawn') as SemanticState, meta: invoiceLinked.value ? 'Tertaut ke baris 2' : 'Tautan dibatalkan' },
  { label: 'Jurnal stok', ref: 'JS-2611-0412', state: (docState.value === 'history.corrected' ? 'history.corrected' : 'work.completed') as SemanticState },
])
const summary = [
  { key: 'Pemasok', value: 'PT Sumber Jagung Sumbar' },
  { key: 'Tanggal bisnis', value: '04/11/2026' },
  { key: 'Gudang', value: 'Gudang pakan · Payakumbuh' },
  { key: 'Baris 2 · jagung giling', value: '1.200', unit: 'kg' },
]

function onOpen(source: { intent?: string }) {
  if (source.intent === 'unlink')
    invoiceLinked.value = false
}
function onCorrection(payload: { revisions: Revision[], reason: string }) {
  pendingRevisions.value = payload.revisions
  activity.value = [...activity.value, { id: `c${activity.value.length}`, kind: 'submitted', actor: 'Yulia Fitri', role: 'Gudang pakan', at: Date.now(), reason: payload.reason }]
  docState.value = 'work.pending_review'
  stage.value = 'deciding'
}
async function submitDecision({ value, reason }: { value: string, reason: string }) {
  await new Promise(resolve => setTimeout(resolve, 900))
  const at = Date.now()
  if (value === 'approve') {
    activity.value = [
      ...activity.value,
      { id: `d${activity.value.length}`, kind: 'approved', actor: 'Doni Pratama', role: 'Kepala gudang', at, reason: reason || undefined },
      { id: `k${activity.value.length + 1}`, kind: 'corrected', actor: 'Sistem', role: 'Posting koreksi', at, revisions: pendingRevisions.value, source: { label: 'Dokumen', ref: 'GRN-2611-0086' }, correlationId: 'req_01JCB4F0Z8K2QP' },
    ]
    docState.value = 'history.corrected'
    stage.value = 'done'
  }
  else if (value === 'return') {
    activity.value = [...activity.value, { id: `d${activity.value.length}`, kind: 'returned', actor: 'Doni Pratama', role: 'Kepala gudang', at, reason }]
    docState.value = 'work.pending'
    stage.value = 'correcting'
  }
  else {
    activity.value = [...activity.value, { id: `d${activity.value.length}`, kind: 'rejected', actor: 'Doni Pratama', role: 'Kepala gudang', at, reason }]
    docState.value = 'work.completed'
    stage.value = 'review'
  }
}
function restart() {
  stage.value = 'review'
  docState.value = 'work.completed'
  invoiceLinked.value = true
  activity.value = [...INITIAL_ACTIVITY]
  pendingRevisions.value = []
  flowKey.value++
}
const STEPS = ['Kesiapan', 'Koreksi', 'Keputusan', 'Selesai'] as const
const stepIndex = computed(() => ({ review: 0, correcting: 1, deciding: 2, done: 3 })[stage.value])

/**
 * Each stage swap unmounts the control that had focus. Move focus to the named stage region so
 * keyboard and screen-reader users keep their place (WCAG 2.4.3); never on first render.
 */
const stagePanel = useTemplateRef<HTMLElement>('stagePanel')
watch([stage, invoiceLinked, flowKey], async () => {
  await nextTick()
  stagePanel.value?.focus()
})
</script>

<template>
  <KitSection id="alur-koreksi" eyebrow="Alur utuh · B2b" title="Koreksi penerimaan barang" description="Dokumen terposting → cek kesiapan → selesaikan pemblokir → buka koreksi → ajukan dengan alasan → approver memutuskan → revisi dan jejak audit tercatat. Status dokumen bergerak lewat kosakata semantik.">
    <div :key="flowKey" class="grid min-w-0 gap-5">
      <div class="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <ol class="flex flex-wrap items-center gap-2 text-xs" aria-label="Langkah">
          <li v-for="(s, i) in STEPS" :key="s" class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1" :class="i === stepIndex ? 'border-primary font-semibold text-foreground' : i < stepIndex ? 'text-success' : 'text-muted-foreground'" :aria-current="i === stepIndex ? 'step' : undefined">
            <span class="numeric">{{ i + 1 }}</span> {{ s }}
          </li>
        </ol>
        <span data-flow-state class="inline-flex items-center gap-2 text-sm">
          Status dokumen <StateChip :state="docState" size="md" />
        </span>
      </div>

      <DocumentHeader doc-type="Penerimaan barang" doc-no="GRN-2611-0086" status="posted" company="PT Agung Abadi Putra Mandiri" site="Farm Payakumbuh · Gudang pakan" business-date="04/11/2026" created-by="Yulia Fitri" />
      <KeyValueList :items="summary" :columns="2" />

      <div class="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div class="grid min-w-0 content-start gap-5">
          <div ref="stagePanel" data-flow-stage tabindex="-1" role="region" :aria-label="`Langkah ${stepIndex + 1} dari ${STEPS.length}: ${STEPS[stepIndex]}`" class="grid min-w-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <div v-if="stage === 'review'" class="rounded-xl border p-4">
              <ReadinessReview :readiness="readiness" @open="onOpen" @next="stage = 'correcting'" />
            </div>
            <div v-else-if="stage === 'correcting'" data-flow-correction class="grid gap-3 rounded-xl border p-4">
              <p class="text-sm font-semibold">
                Koreksi baris
              </p>
              <CorrectionForm :fields="fields" actor="Yulia Fitri" @submit="onCorrection" />
            </div>
            <div v-else-if="stage === 'deciding'" class="grid gap-3 rounded-xl border p-4">
              <p class="text-sm font-semibold">
                Keputusan approver · Doni Pratama
              </p>
              <DecisionForm :context="decision" :submit="submitDecision" />
            </div>
            <div v-else class="grid gap-2 rounded-xl border p-4 text-sm" role="status">
              <p class="font-semibold">
                Koreksi tercatat
              </p>
              <p class="text-muted-foreground">
                Kuantitas baris 2 kini 1.250,5 kg. Jurnal stok JS-2611-0412 disesuaikan dan revisinya tersimpan di riwayat.
              </p>
            </div>
          </div>
          <div>
            <Button variant="outline" size="sm" :class="wrapButtonClass('sm')" @click="restart">
              Mulai ulang
            </Button>
          </div>
        </div>

        <aside class="grid min-w-0 content-start gap-5" aria-label="Konteks dokumen">
          <div class="grid gap-2">
            <p class="text-xs font-medium text-muted-foreground">
              Dokumen terkait
            </p>
            <RelatedObjects :items="related" />
          </div>
          <div data-flow-activity class="grid gap-2">
            <p class="text-xs font-medium text-muted-foreground">
              Riwayat
            </p>
            <ActivityFeed :entries="activity" />
          </div>
        </aside>
      </div>
    </div>
  </KitSection>
</template>
