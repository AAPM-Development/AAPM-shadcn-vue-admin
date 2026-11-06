/**
 * AAPM UI (Vue) capability matrix — the single source for what this template must provide.
 *
 * 83 rows:
 * - 45 generic UI requirements from AAPM_Ecosystem ECOSYSTEM_UI_CAPABILITY_REQUIREMENTS (@a75b57d)
 * - 16 ERP routes (erp.aapm.co.id MIGRATION_PARITY_MATRIX, R01–R16)
 * - 22 ERP platform capabilities (PLATFORM_CAPABILITY_WIRING, PC01–PC22)
 *
 * Status rule (B1 spec):
 * - ada: a component meets the requirement and /ui-kit demos it
 * - sebagian: something exists; `note` names what is missing
 * - belum: nothing yet
 * - milik-produk: backend, operations or domain authority
 *
 * Shown in /ui-kit → Kapabilitas and in docs/design-system/CAPABILITY_MATRIX.md (`pnpm capabilities:doc`).
 */
export type CapabilitySource = 'ecosystem' | 'erp-route' | 'erp-platform'
export type CapabilityStatus = 'ada' | 'sebagian' | 'belum' | 'milik-produk'
export type Subproject = 'B1' | 'B2' | 'B3' | 'B4'

export interface Capability {
  id: string
  title: string
  source: CapabilitySource
  priority: 'P0' | 'P1' | 'P2'
  subproject: Subproject
  status: CapabilityStatus
  /** Repo-relative files that implement it; empty for belum / milik-produk. */
  components: string[]
  /** `/ui-kit#<anchor>`; always present for `ada`. */
  demo?: string
  /** What is missing (sebagian) or who owns it (milik-produk). */
  note?: string
}

const A = 'src/components/aapm'
const UI = 'src/components/ui'

type Row = Omit<Capability, 'source'>
const eco = (r: Row): Capability => ({ ...r, source: 'ecosystem' })
const route = (r: Row): Capability => ({ ...r, source: 'erp-route' })
const platform = (r: Row): Capability => ({ ...r, source: 'erp-platform' })

export const CAPABILITIES: readonly Capability[] = Object.freeze([
  // ── Ecosystem · Foundation ─────────────────────────────────────────────────
  eco({ id: 'UI-FND-001', title: 'Shell aplikasi adaptif terautentikasi', priority: 'P0', subproject: 'B2', status: 'sebagian', components: ['src/layouts/default.vue', 'src/components/app-sidebar/index.vue'], note: 'Shell dipakai di seluruh aplikasi, tetapi belum ada demo /ui-kit dan kontraknya belum ditulis.' }),
  eco({ id: 'UI-FND-002', title: 'Navigasi dalam berbasis izin', priority: 'P1', subproject: 'B2', status: 'sebagian', components: ['src/components/app-sidebar/nav-team-collapsible.vue'], note: 'Sidebar bertingkat ada; belum difilter izin dan belum ada demo /ui-kit.' }),
  eco({ id: 'UI-FND-003', title: 'Navigasi seksi dalam halaman', priority: 'P1', subproject: 'B2', status: 'belum', components: [] }),
  eco({ id: 'UI-FND-004', title: 'Pemilih konteks tenant / farm / perusahaan', priority: 'P0', subproject: 'B2', status: 'sebagian', components: ['src/components/app-sidebar/team-switcher.vue'], demo: '/ui-kit#perusahaan', note: 'Pemilih perusahaan ada; level farm/tenant dan pemberitahuan pindah konteks ke tab lain belum.' }),
  eco({ id: 'UI-FND-005', title: 'Breadcrumb dan kembali yang aman', priority: 'P0', subproject: 'B2', status: 'sebagian', components: [`${A}/app-breadcrumbs.vue`], note: 'Breadcrumb aktif di header, tetapi belum ada demo /ui-kit.' }),
  eco({ id: 'UI-FND-006', title: 'Header halaman dan aksi kontekstual', priority: 'P0', subproject: 'B2', status: 'sebagian', components: ['src/components/global-layout/basic-page.vue', 'src/components/global-layout/basic-header.vue'], note: 'Dipakai semua halaman, tetapi belum ada demo /ui-kit tersendiri.' }),
  eco({ id: 'UI-FND-007', title: 'Overlay profil, tema, dan notifikasi', priority: 'P1', subproject: 'B2', status: 'sebagian', components: ['src/components/app-sidebar/nav-footer.vue', 'src/components/custom-theme/theme-popover.vue'], note: 'Profil dan tema ada; panel notifikasi belum; belum ada demo /ui-kit.' }),
  eco({ id: 'UI-FND-008', title: 'Tab dan segmentasi rute lokal', priority: 'P0', subproject: 'B2', status: 'sebagian', components: [`${UI}/tabs/Tabs.vue`, 'src/plugins/motion/setup.ts'], demo: '/ui-kit#navigasi', note: 'Tab lokal ada; tab yang tersinkron ke URL (segmentasi rute) belum.' }),
  eco({ id: 'UI-FND-009', title: 'Pencarian dan command surface', priority: 'P2', subproject: 'B4', status: 'sebagian', components: ['src/components/command-menu-panel/index.vue'], demo: '/ui-kit#menu', note: 'Palet perintah ada; pencarian berlingkup (scope) dan hasil lintas modul belum.' }),
  eco({ id: 'UI-FND-010', title: 'Shell autentikasi', priority: 'P0', subproject: 'B2', status: 'sebagian', components: ['src/pages/auth/components/sign-in-split.vue', `${A}/brand-bumper.vue`, `${A}/animated-brand-mark.vue`], note: 'Halaman masuk dua kolom ada; masih di pages/ (belum komponen layer) dan belum ada demo /ui-kit.' }),
  eco({ id: 'UI-FND-011', title: 'Densitas dan geometri responsif', priority: 'P0', subproject: 'B2', status: 'sebagian', components: ['src/assets/adaptive-density.css'], note: 'Densitas otomatis untuk layar pendek ada; pilihan comfortable/compact/dense dan demo /ui-kit belum.' }),
  eco({ id: 'UI-FND-012', title: 'Sumber warna brand AAPM yang persis', priority: 'P0', subproject: 'B1', status: 'ada', components: ['scripts/sync-brand-tokens.mjs', 'src/assets/tokens/brand.generated.css', 'src/assets/tokens/primitives.css'], demo: '/ui-kit#brand-token' }),
  eco({ id: 'UI-FND-013', title: 'Navigasi bawah web yang sadar safe-area', priority: 'P1', subproject: 'B2', status: 'belum', components: [] }),
  eco({ id: 'UI-FND-014', title: 'Pemilih hierarki / resource scope', priority: 'P1', subproject: 'B2', status: 'belum', components: [] }),
  eco({ id: 'UI-FND-015', title: 'Ekspor interoperabilitas token (DTCG)', priority: 'P0', subproject: 'B4', status: 'belum', components: [] }),

  // ── Ecosystem · Data display ───────────────────────────────────────────────
  eco({ id: 'UI-DAT-001', title: 'DataTable standar', priority: 'P0', subproject: 'B1', status: 'ada', components: ['src/components/data-table/data-table.vue'], demo: '/ui-kit#tabel' }),
  eco({ id: 'UI-DAT-002', title: 'Grid enterprise padat yang bisa diedit', priority: 'P1', subproject: 'B4', status: 'belum', components: [] }),
  eco({ id: 'UI-DAT-003', title: 'Tabel ledger / mutasi', priority: 'P1', subproject: 'B3', status: 'sebagian', components: [`${A}/erp/stock-movement.vue`], demo: '/ui-kit#stok', note: 'Kartu stok ada; tabel ledger umum dengan filter, paging, dan saldo berjalan belum.' }),
  eco({ id: 'UI-DAT-004', title: 'Kartu metrik', priority: 'P0', subproject: 'B2', status: 'sebagian', components: ['src/pages/dashboard/components/kpi-card.vue'], note: 'KPI card masih di pages/dashboard; perlu dipindah ke components/aapm dan diberi demo /ui-kit.' }),
  eco({ id: 'UI-DAT-005', title: 'Klaster / grid KPI', priority: 'P0', subproject: 'B2', status: 'sebagian', components: ['src/pages/dashboard/components/overview-content.vue'], note: 'Grid KPI dashboard ada; belum jadi pola reusable dan belum ada demo /ui-kit.' }),
  eco({ id: 'UI-DAT-006', title: 'Panel grafik', priority: 'P0', subproject: 'B1', status: 'ada', components: [`${A}/charts/index.ts`, `${A}/charts/sparkline.vue`, `${A}/charts/donut-chart.vue`], demo: '/ui-kit#grafik' }),
  eco({ id: 'UI-DAT-007', title: 'Ringkasan record / fakta key-value', priority: 'P0', subproject: 'B2', status: 'ada', components: ['src/components/aapm/work/KeyValueList.vue'], demo: '/ui-kit#ringkasan' }),
  eco({ id: 'UI-DAT-008', title: 'Chip / badge status', priority: 'P0', subproject: 'B1', status: 'ada', components: [`${A}/tone/tone-chip.vue`, `${A}/tone/state-chip.vue`, `${A}/tone/tones.ts`, 'src/design-system/states.ts'], demo: '/ui-kit#status-semantik' }),
  eco({ id: 'UI-DAT-009', title: 'Perbandingan rencana vs aktual', priority: 'P1', subproject: 'B2', status: 'sebagian', components: ['src/pages/dashboard/components/production-trend.vue'], note: 'Grafik HD aktual vs standar ada; pola tabel rencana-vs-aktual dan demo /ui-kit belum.' }),
  eco({ id: 'UI-DAT-010', title: 'Revisi / ringkasan perubahan', priority: 'P1', subproject: 'B2', status: 'ada', components: ['src/components/aapm/work/RevisionDiff.vue'], demo: '/ui-kit#revisi' }),
  eco({ id: 'UI-DAT-011', title: 'Objek terkait', priority: 'P1', subproject: 'B2', status: 'ada', components: ['src/components/aapm/work/RelatedObjects.vue'], demo: '/ui-kit#terkait' }),
  eco({ id: 'UI-DAT-012', title: 'Entity 360', priority: 'P1', subproject: 'B2', status: 'ada', components: ['src/components/aapm/work/Entity360.vue'], demo: '/ui-kit#entitas-360' }),
  eco({ id: 'UI-DAT-013', title: 'Bukti / lampiran', priority: 'P1', subproject: 'B2', status: 'belum', components: [] }),
  eco({ id: 'UI-DAT-014', title: 'Kapasitas / utilisasi / cakupan', priority: 'P1', subproject: 'B2', status: 'sebagian', components: [`${A}/charts/bullet-chart.vue`, `${A}/charts/radial-gauge.vue`], demo: '/ui-kit#grafik', note: 'Bullet dan gauge ada; resep load planning / forecast kapasitas belum.' }),
  eco({ id: 'UI-DAT-015', title: 'Tampilan dan pemilihan pohon / hierarki', priority: 'P1', subproject: 'B2', status: 'belum', components: [] }),
  eco({ id: 'UI-DAT-016', title: 'Permukaan hasil laporan', priority: 'P1', subproject: 'B2', status: 'belum', components: [] }),
  eco({ id: 'UI-DAT-017', title: 'Narasi aktivitas / audit yang imutabel', priority: 'P1', subproject: 'B2', status: 'ada', components: ['src/components/aapm/work/ActivityFeed.vue'], demo: '/ui-kit#aktivitas' }),

  // ── Ecosystem · Forms ──────────────────────────────────────────────────────
  eco({ id: 'UI-FRM-001', title: 'Field berlabel dengan error, hint, dan read-only', priority: 'P0', subproject: 'B2', status: 'sebagian', components: [`${UI}/input/Input.vue`, `${UI}/label/Label.vue`], demo: '/ui-kit#input', note: 'Field berlabel ada; contoh hint, read-only, dan error per field di /ui-kit#input belum.' }),
  eco({ id: 'UI-FRM-002', title: 'Input angka, mata uang, dan persen', priority: 'P0', subproject: 'B2', status: 'sebagian', components: [`${UI}/number-field/NumberField.vue`], demo: '/ui-kit#pemilih', note: 'Input angka bulat ada; input mata uang (Rp) dan persen belum.' }),
  eco({ id: 'UI-FRM-003', title: 'Select / Combobox / MultiSelect', priority: 'P0', subproject: 'B1', status: 'ada', components: [`${UI}/select/Select.vue`, `${UI}/combobox/Combobox.vue`], demo: '/ui-kit#pemilih' }),
  eco({ id: 'UI-FRM-004', title: 'Tanggal, rentang tanggal, waktu, tanggal-waktu', priority: 'P0', subproject: 'B2', status: 'sebagian', components: [`${UI}/calendar/Calendar.vue`, `${UI}/range-calendar/RangeCalendar.vue`], demo: '/ui-kit#pemilih', note: 'Tanggal dan rentang ada; input waktu dan tanggal-waktu belum.' }),
  eco({ id: 'UI-FRM-005', title: 'Textarea / catatan panjang', priority: 'P0', subproject: 'B1', status: 'ada', components: [`${UI}/textarea/Textarea.vue`], demo: '/ui-kit#input' }),
  eco({ id: 'UI-FRM-006', title: 'Form panjang multi-seksi', priority: 'P1', subproject: 'B2', status: 'belum', components: [] }),
  eco({ id: 'UI-FRM-007', title: 'Form keputusan yang berdampak', priority: 'P1', subproject: 'B2', status: 'ada', components: ['src/components/aapm/work/DecisionForm.vue'], demo: '/ui-kit#keputusan' }),
  eco({ id: 'UI-FRM-008', title: 'Ketersediaan aksi baris beserta alasannya', priority: 'P1', subproject: 'B2', status: 'ada', components: ['src/components/aapm/work/ReasonedAction.vue'], demo: '/ui-kit#aksi-beralasan' }),
  eco({ id: 'UI-FRM-009', title: 'Ringkasan rekonsiliasi', priority: 'P1', subproject: 'B2', status: 'sebagian', components: [`${A}/erp/journal-preview.vue`], demo: '/ui-kit#jurnal', note: 'Debit = kredit ada; ringkasan rekonsiliasi umum (selisih, penjelasan) belum.' }),
  eco({ id: 'UI-FRM-010', title: 'Entri progres / realisasi append-only', priority: 'P1', subproject: 'B2', status: 'ada', components: ['src/components/aapm/work/ProgressLog.vue'], demo: '/ui-kit#progres' }),
  eco({ id: 'UI-FRM-011', title: 'Form koreksi', priority: 'P1', subproject: 'B2', status: 'ada', components: ['src/components/aapm/work/CorrectionForm.vue'], demo: '/ui-kit#koreksi' }),
  eco({ id: 'UI-FRM-012', title: 'Unggah / ambil bukti di web', priority: 'P1', subproject: 'B3', status: 'belum', components: [] }),
  eco({ id: 'UI-WRK-READINESS', title: 'Review kesiapan / kelayakan / pemblokir', priority: 'P1', subproject: 'B2', status: 'ada', components: ['src/components/aapm/work/ReadinessReview.vue', 'src/components/aapm/work/BlockerList.vue'], demo: '/ui-kit#kesiapan' }),

  // ── ERP · Inventory Receipt routes (pilot) ─────────────────────────────────
  route({ id: 'R01', title: 'Daftar penerimaan standard (tabel server)', priority: 'P0', subproject: 'B3', status: 'sebagian', components: ['src/components/data-table/data-table.vue'], demo: '/ui-kit#tabel', note: 'Daftar contoh ada; paging server dan scope inventori belum.' }),
  route({ id: 'R02', title: 'Siapkan penerimaan standard (form)', priority: 'P0', subproject: 'B3', status: 'sebagian', components: [`${A}/erp/document-header.vue`, `${A}/erp/receipt-line-editor.vue`], demo: '/ui-kit#dokumen', note: 'Header dan editor baris ada; master barang, jasa vs stok belum.' }),
  route({ id: 'R03', title: 'Simpan penerimaan standard dan hasil commit', priority: 'P0', subproject: 'B3', status: 'belum', components: [] }),
  route({ id: 'R04', title: 'Buka koreksi dengan dampak dan alasan kunci', priority: 'P0', subproject: 'B3', status: 'belum', components: [] }),
  route({ id: 'R05', title: 'Koreksi atomik dan pemulihan', priority: 'P0', subproject: 'B3', status: 'belum', components: [] }),
  route({ id: 'R06', title: 'Hapus yang eligible beserta dampaknya', priority: 'P0', subproject: 'B3', status: 'belum', components: [] }),
  route({ id: 'R07', title: 'Daftar penerimaan jagung & dedak', priority: 'P0', subproject: 'B3', status: 'belum', components: [] }),
  route({ id: 'R08', title: 'Form dan detail timbang', priority: 'P0', subproject: 'B3', status: 'belum', components: [] }),
  route({ id: 'R09', title: 'Simpan timbang, detail, dan batch', priority: 'P0', subproject: 'B3', status: 'belum', components: [] }),
  route({ id: 'R10', title: 'Buka koreksi timbang', priority: 'P0', subproject: 'B3', status: 'belum', components: [] }),
  route({ id: 'R11', title: 'Koreksi timbang sesuai dampak', priority: 'P0', subproject: 'B3', status: 'belum', components: [] }),
  route({ id: 'R12', title: 'Hapus timbang yang eligible', priority: 'P0', subproject: 'B3', status: 'belum', components: [] }),
  route({ id: 'R13', title: 'Cetak BAST', priority: 'P0', subproject: 'B3', status: 'belum', components: [] }),
  route({ id: 'R14', title: 'Cetak rekap timbang', priority: 'P0', subproject: 'B3', status: 'belum', components: [] }),
  route({ id: 'R15', title: 'Tinjau jurnal stok', priority: 'P0', subproject: 'B3', status: 'sebagian', components: [`${A}/erp/journal-preview.vue`], demo: '/ui-kit#jurnal', note: 'Pratinjau jurnal ada; daftar jurnal stok per gudang belum.' }),
  route({ id: 'R16', title: 'Data tabel jurnal stok', priority: 'P0', subproject: 'B3', status: 'belum', components: [] }),

  // ── ERP · Platform capabilities ────────────────────────────────────────────
  platform({ id: 'PC01', title: 'Identitas dan pemulihan akses', priority: 'P1', subproject: 'B4', status: 'sebagian', components: ['src/pages/auth/components/login-form.vue'], demo: '/ui-kit#mfa', note: 'Masuk dan MFA ada; pemulihan akun dan penegakan oleh backend belum.' }),
  platform({ id: 'PC02', title: 'Lingkup tenant / perusahaan', priority: 'P1', subproject: 'B4', status: 'sebagian', components: ['src/components/app-sidebar/team-switcher.vue'], demo: '/ui-kit#perusahaan', note: 'Pemilih perusahaan ada; isolasi tab A/B dan penolakan lingkup hilang belum.' }),
  platform({ id: 'PC03', title: 'Peran, aksi, dan otoritas', priority: 'P1', subproject: 'B4', status: 'sebagian', components: [`${A}/erp/state-view.vue`], demo: '/ui-kit#tanpa-akses', note: 'Tampilan tanpa akses ada; aksi yang mengikuti grant efektif belum.' }),
  platform({ id: 'PC04', title: 'Administrasi akun dan akses', priority: 'P1', subproject: 'B4', status: 'sebagian', components: ['src/pages/users/index.vue'], note: 'Daftar pengguna dan undangan contoh ada; pratinjau grant dan cabut akses belum; belum ada demo /ui-kit.' }),
  platform({ id: 'PC05', title: 'Kesiapan dan onboarding perusahaan', priority: 'P1', subproject: 'B2', status: 'ada', components: ['src/components/aapm/work/ReadinessReview.vue'], demo: '/ui-kit#kesiapan' }),
  platform({ id: 'PC06', title: 'UI bersama (token, shell, ikon, kontrak tabel/form/detail/riwayat)', priority: 'P1', subproject: 'B3', status: 'sebagian', components: ['src/assets/tokens/brand.generated.css', `${A}/icon/registry.ts`, 'src/components/data-table/data-table.vue'], demo: '/ui-kit#brand-token', note: 'Token, ikon, dan tabel ada; kontrak form/detail/riwayat baru sebagian.' }),
  platform({ id: 'PC07', title: 'Draft dan konkurensi', priority: 'P1', subproject: 'B3', status: 'belum', components: [] }),
  platform({ id: 'PC08', title: 'Penomoran dokumen', priority: 'P1', subproject: 'B3', status: 'belum', components: [] }),
  platform({ id: 'PC09', title: 'Persetujuan dan delegasi', priority: 'P1', subproject: 'B2', status: 'ada', components: ['src/components/aapm/work/ApprovalDelegation.vue'], demo: '/ui-kit#delegasi' }),
  platform({ id: 'PC10', title: 'Periode, backdate, dan jam bisnis', priority: 'P1', subproject: 'B3', status: 'belum', components: [] }),
  platform({ id: 'PC11', title: 'Audit dan lineage', priority: 'P1', subproject: 'B2', status: 'sebagian', components: ['src/components/aapm/work/ActivityFeed.vue', 'src/components/aapm/work/RevisionDiff.vue'], demo: '/ui-kit#aktivitas', note: 'Narasi audit, sumber, dan ID korelasi tampil; korelasi lintas layanan dan akses baca berlingkup milik backend.' }),
  platform({ id: 'PC12', title: 'Lampiran', priority: 'P1', subproject: 'B3', status: 'belum', components: [] }),
  platform({ id: 'PC13', title: 'Notifikasi dan inbox aksi', priority: 'P1', subproject: 'B4', status: 'belum', components: [] }),
  platform({ id: 'PC14', title: 'Job dan penjadwal', priority: 'P1', subproject: 'B4', status: 'sebagian', components: [`${A}/erp/state-view.vue`], demo: '/ui-kit#status', note: 'Status "job berjalan" ada di StateView; daftar job dan dead-letter belum.' }),
  platform({ id: 'PC15', title: 'Impor, ekspor, dan cetak', priority: 'P1', subproject: 'B3', status: 'belum', components: [] }),
  platform({ id: 'PC16', title: 'Pencarian dan lookup', priority: 'P1', subproject: 'B3', status: 'sebagian', components: [`${UI}/combobox/Combobox.vue`], demo: '/ui-kit#pemilih', note: 'Combobox ada; lookup berlingkup dengan paging dan referensi nonaktif historis belum.' }),
  platform({ id: 'PC17', title: 'Setting dan ketersediaan fitur', priority: 'P1', subproject: 'B2', status: 'ada', components: ['src/components/aapm/work/FeatureGate.vue'], demo: '/ui-kit#fitur' }),
  platform({ id: 'PC18', title: 'Alur antarperusahaan', priority: 'P1', subproject: 'B4', status: 'milik-produk', components: [], note: 'Dokumen dua sisi dan kompensasi milik domain ERP; UI hanya menampilkan status korelasi.' }),
  platform({ id: 'PC19', title: 'KPI dan read model', priority: 'P1', subproject: 'B4', status: 'sebagian', components: ['src/pages/dashboard/components/kpi-card.vue', `${A}/charts/sparkline.vue`], demo: '/ui-kit#grafik', note: 'KPI dan grafik ada; watermark, stale ≠ nol, dan preview vs official belum.' }),
  platform({ id: 'PC20', title: 'Integrasi eksternal', priority: 'P1', subproject: 'B4', status: 'milik-produk', components: [], note: 'Kontrak, dedupe, dan replay milik domain/integrasi; UI hanya status integrasi.' }),
  platform({ id: 'PC21', title: 'Operasi dan rilis', priority: 'P1', subproject: 'B4', status: 'milik-produk', components: [], note: 'Health, log, dan alert milik operasi; UI hanya halaman status.' }),
  platform({ id: 'PC22', title: 'Retensi dan offboarding', priority: 'P1', subproject: 'B4', status: 'milik-produk', components: [], note: 'Kebijakan retensi milik pemilik data; UI hanya konfirmasi dan status.' }),
])
