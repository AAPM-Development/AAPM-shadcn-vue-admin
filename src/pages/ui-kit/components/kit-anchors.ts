/**
 * Which /ui-kit tab holds each demo anchor, so `/ui-kit#<anchor>` links (the capability matrix,
 * docs) open the right tab and scroll to the section. Reka unmounts inactive tab content, so an
 * anchor only exists in the DOM once its tab is active. capabilities.test.ts proves the map.
 */
export const KIT_TABS = ['kontrol', 'navigasi', 'data', 'erp', 'identitas', 'kapabilitas'] as const
export type KitTab = (typeof KIT_TABS)[number]

/** The kit components each tab renders (ui-kit/index.vue). */
export const KIT_TAB_FILES: Record<KitTab, string[]> = {
  kontrol: ['kit-controls.vue'],
  navigasi: ['kit-overlays.vue'],
  data: ['kit-tones.vue', 'kit-data.vue', 'kit-charts.vue'],
  erp: ['kit-erp.vue'],
  identitas: ['kit-identity.vue'],
  kapabilitas: ['kit-capabilities.vue'],
}

export const KIT_ANCHOR_TAB: Record<string, KitTab> = {
  'aksi': 'kontrol',
  'input': 'kontrol',
  'pemilih': 'kontrol',
  'ikon-beranimasi': 'kontrol',
  'navigasi': 'navigasi',
  'overlay': 'navigasi',
  'menu': 'navigasi',
  'umpan-balik': 'navigasi',
  'warna-kategori': 'data',
  'status-semantik': 'data',
  'freshness': 'data',
  'brand-token': 'data',
  'tabel': 'data',
  'visual': 'data',
  'grafik': 'data',
  'dokumen': 'erp',
  'persetujuan': 'erp',
  'stok': 'erp',
  'jurnal': 'erp',
  'status': 'erp',
  'perusahaan': 'identitas',
  'mfa': 'identitas',
  'sesi': 'identitas',
  'tanpa-akses': 'identitas',
  'kapabilitas': 'kapabilitas',
}
