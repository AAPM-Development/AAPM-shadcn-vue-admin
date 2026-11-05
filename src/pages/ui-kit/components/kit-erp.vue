<script setup lang="ts">
import type { RegionState } from '@/components/aapm/erp/types'

import ApprovalTimeline from '@/components/aapm/erp/approval-timeline.vue'
import AuditDrawer from '@/components/aapm/erp/audit-drawer.vue'
import DocumentHeader from '@/components/aapm/erp/document-header.vue'
import JournalPreview from '@/components/aapm/erp/journal-preview.vue'
import ReceiptLineEditor from '@/components/aapm/erp/receipt-line-editor.vue'
import StateView from '@/components/aapm/erp/state-view.vue'
import StockMovement from '@/components/aapm/erp/stock-movement.vue'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import KitSection from './kit-section.vue'

const STATES: { value: RegionState, label: string }[] = [
  { value: 'loading', label: 'Loading' },
  { value: 'empty', label: 'Belum ada data' },
  { value: 'no-matches', label: 'Tidak cocok filter' },
  { value: 'validation', label: 'Validasi (422)' },
  { value: 'forbidden', label: 'Tidak berwenang (403)' },
  { value: 'conflict', label: 'Versi basi (409)' },
  { value: 'session-expired', label: 'Sesi berakhir' },
  { value: 'missing', label: 'Dokumen tidak ada' },
  { value: 'offline', label: 'Offline' },
  { value: 'server-error', label: 'Galat server' },
  { value: 'job', label: 'Proses async' },
]
const state = shallowRef<RegionState>('loading')
</script>

<template>
  <KitSection id="dokumen" eyebrow="DocumentHeader + TransactionForm" title="Penerimaan barang (pilot ERP)" description="Identitas dokumen, konteks perusahaan, status, sumber, lalu editor baris: tambah/hapus baris mengalir, error per baris, total dan dampak stok terlihat, draft terpisah dari ajukan. Ajukan dengan isian kosong untuk melihat getar.">
    <DocumentHeader
      doc-type="Penerimaan barang"
      doc-no="GRN-2611-0087"
      status="draft"
      company="PT Agung Abadi Putra Mandiri"
      site="Gudang Pakan · Payakumbuh"
      business-date="05/11/2026"
      created-by="Yulia Fitri"
      :source="{ label: 'Dari PO', ref: 'PO-2610-0311' }"
    />
    <ReceiptLineEditor />
    <div class="flex justify-end">
      <AuditDrawer />
    </div>
  </KitSection>

  <KitSection id="persetujuan" eyebrow="ApprovalTimeline" title="Riwayat persetujuan" description="Pelaku, aksi, alasan, waktu WIB, dan status akhir yang terkunci.">
    <ApprovalTimeline
      terminal="Terposting · dokumen terkunci, koreksi hanya lewat pembalikan"
      :events="[
        { id: 'e1', action: 'created', actor: 'Yulia Fitri', role: 'Gudang pakan', at: '05/11/2026 10.31 WIB' },
        { id: 'e2', action: 'submitted', actor: 'Yulia Fitri', role: 'Gudang pakan', at: '05/11/2026 10.42 WIB', attachments: 2 },
        { id: 'e3', action: 'returned', actor: 'Doni Pratama', role: 'Kepala gudang', at: '05/11/2026 11.05 WIB', reason: 'Lot baris 2 belum sesuai label karung.' },
        { id: 'e4', action: 'submitted', actor: 'Yulia Fitri', role: 'Gudang pakan', at: '05/11/2026 11.20 WIB' },
        { id: 'e5', action: 'approved', actor: 'Doni Pratama', role: 'Kepala gudang', at: '05/11/2026 11.34 WIB' },
        { id: 'e6', action: 'posted', actor: 'Sistem', role: 'Posting otomatis', at: '05/11/2026 11.34 WIB' },
      ]"
    />
  </KitSection>

  <div class="grid gap-4 xl:grid-cols-2">
    <KitSection id="stok" eyebrow="StockMovementViewer" title="Kartu stok" description="Mutasi bertanda, saldo berjalan, saldo negatif diblokir.">
      <StockMovement
        item="Jagung giling" warehouse="Gudang Pakan" unit="kg" :opening="2400"
        :movements="[
          { id: 'm1', date: '03/11', doc: 'GRN-2611-0083', type: 'Penerimaan', lot: 'JG-2611-01', qty: 9800 },
          { id: 'm2', date: '04/11', doc: 'MIX-2611-0042', type: 'Pemakaian mixing', lot: 'JG-2611-01', qty: -3600 },
          { id: 'm3', date: '05/11', doc: 'MIX-2611-0043', type: 'Pemakaian mixing', lot: 'JG-2611-01', qty: -2400 },
        ]"
      />
    </KitSection>
    <KitSection id="jurnal" eyebrow="JournalPreview" title="Pratinjau jurnal" description="Debit dan kredit harus seimbang sebelum posting.">
      <JournalPreview
        :lines="[
          { account: '1-1410', name: 'Persediaan bahan pakan', debit: 38427650, credit: 0 },
          { account: '1-1150', name: 'PPN masukan', debit: 4227041, credit: 0 },
          { account: '2-1100', name: 'Utang usaha · CV Minang Pangan', debit: 0, credit: 42654691 },
        ]"
      />
    </KitSection>
  </div>

  <KitSection id="status" eyebrow="State & recovery (UX-07)" title="Status layar" description="Setiap wilayah menjelaskan kasus yang berlaku dan aksi yang diizinkan. Ganti status untuk melihat transisinya.">
    <div class="grid gap-2 sm:max-w-xs">
      <Label for="state-pick">Status</Label>
      <Select v-model="state">
        <SelectTrigger id="state-pick" class="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="s in STATES" :key="s.value" :value="s.value">
            {{ s.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
    <Transition mode="out-in" enter-active-class="transition-[opacity,transform] duration-300 ease-emphasis" enter-from-class="opacity-0 translate-y-1" leave-active-class="transition-opacity duration-100 ease-aapm" leave-to-class="opacity-0">
      <StateView :key="state" :state="state" />
    </Transition>
  </KitSection>
</template>
