<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import type { DateRange } from 'reka-ui'
import type { Ref } from 'vue'

import { DateFormatter, getLocalTimeZone, today } from '@internationalized/date'

import type { IconName } from '@/components/aapm/icon/registry'

import AapmIcon from '@/components/aapm/icon/AapmIcon.vue'
import SegmentedControl from '@/components/aapm/segmented-control.vue'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { Combobox, ComboboxAnchor, ComboboxEmpty, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxItemIndicator, ComboboxList, ComboboxTrigger, ComboboxViewport } from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumberField, NumberFieldContent, NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput } from '@/components/ui/number-field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { RangeCalendar } from '@/components/ui/range-calendar'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { TagsInput, TagsInputInput, TagsInputItem, TagsInputItemDelete, TagsInputItemText } from '@/components/ui/tags-input'
import { Textarea } from '@/components/ui/textarea'
import { Toggle } from '@/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatNumber } from '@/lib/format-id'

import KitSection from './kit-section.vue'

const saving = shallowRef(false)
function simulateSave() {
  saving.value = true
  setTimeout(() => (saving.value = false), 1400)
}

const pinned = shallowRef(false)
const view = shallowRef('harian')
const range = shallowRef<'7' | '30' | '90'>('30')
const house = shallowRef('B2')
const grade = shallowRef('A')
const notify = shallowRef(true)
const autoPost = shallowRef(false)
const target = ref([93])
const checks = reactive({ pakan: true, air: true, suhu: false })

/* ── Pemilih ──────────────────────────────────────────────────────────── */
const timeZone = getLocalTimeZone()
const dateLabel = new DateFormatter('id-ID', { dateStyle: 'long' })
const receiptDate = shallowRef<DateValue>(today(timeZone))
const period = ref({ start: today(timeZone).subtract({ days: 6 }), end: today(timeZone) }) as Ref<DateRange>
const periodLabel = computed(() => {
  const { start, end } = period.value
  if (!start)
    return 'Pilih tanggal awal.'
  if (!end)
    return `${dateLabel.format(start.toDate(timeZone))} — pilih tanggal akhir.`
  const days = end.compare(start) + 1
  return `${dateLabel.format(start.toDate(timeZone))} – ${dateLabel.format(end.toDate(timeZone))} · ${days} hari`
})
const HOUSES = [
  { value: 'A1', label: 'Kandang A1 · 12.400 ekor' },
  { value: 'A2', label: 'Kandang A2 · 12.180 ekor' },
  { value: 'B2', label: 'Kandang B2 · 14.020 ekor' },
  { value: 'B3', label: 'Kandang B3 · 14.210 ekor' },
  { value: 'C1', label: 'Kandang C1 · 9.860 ekor (pullet)' },
]
const comboHouse = ref<(typeof HOUSES)[number]>()
const comboHouses = ref<(typeof HOUSES)[number][] | undefined>([HOUSES[2]!])
const lots = ref(['JG-2611-04', 'KL-2611-11'])
const eggCount = ref(120)

/* ── Ikon beranimasi ──────────────────────────────────────────────────── */
const ICON_GALLERY: { title: string, items: { name: IconName, label: string }[] }[] = [
  {
    title: 'Aksi',
    items: [
      { name: 'add', label: 'Tambah' },
      { name: 'edit', label: 'Ubah' },
      { name: 'save', label: 'Simpan' },
      { name: 'delete', label: 'Hapus' },
      { name: 'view', label: 'Lihat' },
      { name: 'search', label: 'Cari' },
      { name: 'filter', label: 'Filter' },
      { name: 'sort', label: 'Urutkan' },
      { name: 'more', label: 'Lainnya' },
      { name: 'upload', label: 'Unggah' },
      { name: 'download', label: 'Unduh' },
      { name: 'export', label: 'Ekspor' },
      { name: 'print', label: 'Cetak' },
      { name: 'attach', label: 'Lampirkan' },
      { name: 'comment', label: 'Komentar' },
      { name: 'history', label: 'Riwayat' },
      { name: 'submit', label: 'Ajukan' },
      { name: 'approve', label: 'Setujui' },
      { name: 'reject', label: 'Tolak' },
      { name: 'reverse', label: 'Balik' },
      { name: 'reopen', label: 'Buka ulang' },
      { name: 'archive', label: 'Arsipkan' },
      { name: 'share', label: 'Bagikan' },
      { name: 'like', label: 'Suka' },
      { name: 'calendar', label: 'Jadwal' },
      { name: 'locked', label: 'Terkunci' },
      { name: 'notification', label: 'Notifikasi' },
      { name: 'logout', label: 'Keluar' },
    ],
  },
  {
    title: 'Navigasi & sidebar',
    items: [
      { name: 'dashboard', label: 'Dasbor' },
      { name: 'tasks', label: 'Tugas' },
      { name: 'users', label: 'Pengguna' },
      { name: 'ai', label: 'Asisten AI' },
      { name: 'verified', label: 'Terverifikasi' },
      { name: 'settings', label: 'Pengaturan' },
      { name: 'help', label: 'Bantuan' },
      { name: 'external', label: 'Tautan luar' },
      { name: 'location', label: 'Lokasi' },
      { name: 'composition', label: 'Komposisi' },
      { name: 'transfer', label: 'Transfer' },
      { name: 'truck', label: 'Pengiriman' },
      { name: 'warehouse', label: 'Gudang' },
    ],
  },
  {
    title: 'Peternakan',
    items: [
      { name: 'chicken', label: 'Ayam' },
      { name: 'hen', label: 'Induk' },
      { name: 'chick', label: 'DOC' },
      { name: 'hatching', label: 'Penetasan' },
      { name: 'egg', label: 'Telur' },
      { name: 'barn', label: 'Farm' },
      { name: 'eggTray', label: 'Tray telur' },
      { name: 'coop', label: 'Kandang' },
      { name: 'vaccine', label: 'Vaksinasi' },
      { name: 'growth', label: 'Pertumbuhan' },
    ],
  },
  {
    title: 'Umum (sistem)',
    items: [
      { name: 'importData', label: 'Impor' },
      { name: 'duplicate', label: 'Duplikat' },
      { name: 'scan', label: 'Pindai' },
      { name: 'barcode', label: 'Barcode' },
      { name: 'qrScan', label: 'Pindai QR' },
      { name: 'link', label: 'Tautan' },
      { name: 'unlink', label: 'Lepas tautan' },
      { name: 'mail', label: 'Email' },
      { name: 'phone', label: 'Telepon' },
      { name: 'map', label: 'Peta' },
      { name: 'route', label: 'Rute' },
      { name: 'clock', label: 'Jam' },
      { name: 'timer', label: 'Timer' },
      { name: 'alarm', label: 'Alarm' },
      { name: 'camera', label: 'Kamera' },
      { name: 'image', label: 'Gambar' },
      { name: 'folder', label: 'Folder' },
      { name: 'folderOpen', label: 'Folder terbuka' },
      { name: 'cloudUpload', label: 'Unggah ke cloud' },
      { name: 'star', label: 'Favorit' },
      { name: 'flag', label: 'Tandai' },
      { name: 'tag', label: 'Label' },
      { name: 'bookmark', label: 'Simpan' },
      { name: 'pin', label: 'Sematkan' },
      { name: 'columns', label: 'Kolom' },
      { name: 'maximize', label: 'Perbesar' },
      { name: 'minimize', label: 'Perkecil' },
      { name: 'zoomIn', label: 'Zoom' },
      { name: 'keyboard', label: 'Pintasan' },
      { name: 'globe', label: 'Bahasa' },
      { name: 'fuel', label: 'BBM' },
      { name: 'weightScale', label: 'Timbangan' },
      { name: 'signature', label: 'Tanda tangan' },
      { name: 'stamp', label: 'Stempel' },
      { name: 'receipt', label: 'Kuitansi' },
      { name: 'creditCard', label: 'Pembayaran' },
      { name: 'sigma', label: 'Total' },
      { name: 'checklist', label: 'Checklist' },
      { name: 'clipboardList', label: 'Daftar periksa' },
      { name: 'messageCircle', label: 'Pesan' },
      { name: 'inbox', label: 'Kotak masuk' },
      { name: 'bellRing', label: 'Pengingat' },
      { name: 'userPlus', label: 'Tambah pengguna' },
      { name: 'userCheck', label: 'Verifikasi pengguna' },
      { name: 'shield', label: 'Keamanan' },
      { name: 'key', label: 'Kunci akses' },
      { name: 'unlocked', label: 'Buka kunci' },
      { name: 'hide', label: 'Sembunyikan' },
      { name: 'ban', label: 'Blokir' },
      { name: 'power', label: 'Daya' },
      { name: 'grip', label: 'Geser urutan' },
      { name: 'move', label: 'Pindahkan' },
      { name: 'restore', label: 'Pulihkan' },
      { name: 'send2', label: 'Kirim' },
      { name: 'heart', label: 'Suka' },
    ],
  },
  {
    title: 'Modul ERP',
    items: [
      { name: 'erpDashboards', label: 'Dashboards' },
      { name: 'erpCompanies', label: 'Companies' },
      { name: 'erpFarmMonitoring', label: 'Farm Monitoring' },
      { name: 'erpItems', label: 'Items' },
      { name: 'erpCompanyItems', label: 'Company Items' },
      { name: 'erpContact', label: 'Contact' },
      { name: 'erpCustomerBenefit', label: 'Customer Benefit' },
      { name: 'erpProject', label: 'Project' },
      { name: 'erpProjectType', label: 'Project Type' },
      { name: 'erpEmployees', label: 'Employees' },
      { name: 'erpPurchase', label: 'Purchase' },
      { name: 'erpSales', label: 'Sales' },
      { name: 'erpLogistic', label: 'Logistic' },
      { name: 'erpProduction', label: 'Production' },
      { name: 'erpMixing', label: 'Mixing' },
      { name: 'erpPayroll', label: 'Payroll' },
      { name: 'erpInventoryJournal', label: 'Inventory Journal' },
      { name: 'erpInventoryAdjustment', label: 'Inventory Adjustment' },
      { name: 'erpInventoryAdjustmentVerification', label: 'Adjustment Verification' },
      { name: 'erpManureBagging', label: 'Manure Bagging' },
      { name: 'erpManureBaggingVerification', label: 'Manure Bagging Verification' },
      { name: 'erpCash', label: 'Cash' },
      { name: 'erpAccounting', label: 'Accounting' },
      { name: 'erpCornDrying', label: 'Corn Drying' },
      { name: 'erpDeposit', label: 'Deposit' },
      { name: 'erpWarehouses', label: 'Warehouses' },
      { name: 'erpScmPlanning', label: 'SCM Planning' },
      { name: 'erpReport', label: 'Report' },
      { name: 'erpAdminTools', label: 'Admin Tools' },
    ],
  },
]
const refreshing = shallowRef(false)
function simulateRefresh() {
  refreshing.value = true
  setTimeout(() => (refreshing.value = false), 1800)
}

/* The shadcn Slider does not forward a name to its thumb; label the thumb (#289). */
const sliderWrap = useTemplateRef<HTMLElement>('sliderWrap')
onMounted(() => sliderWrap.value?.querySelectorAll('[role="slider"]').forEach(t => t.setAttribute('aria-label', 'Target HD (%)')))
</script>

<template>
  <KitSection id="aksi" eyebrow="Aksi" title="Tombol dan toggle" description="Setiap tombol mengecil 3% saat ditekan; warna dan ring fokus bertransisi. Tombol loading mempertahankan ukurannya.">
    <div class="flex flex-wrap items-center gap-2">
      <Button>
        <AapmIcon name="save" :size="16" />
        Simpan draft
      </Button>
      <Button variant="secondary">
        Sekunder
      </Button>
      <Button variant="outline">
        <AapmIcon name="export" :size="16" />
        Ekspor
      </Button>
      <Button variant="ghost">
        Ghost
      </Button>
      <Button variant="destructive">
        <AapmIcon name="delete" :size="16" />
        Hapus
      </Button>
      <Button variant="link">
        Tautan
      </Button>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <Button :disabled="saving" :aria-busy="saving" class="min-w-36" @click="simulateSave">
        <AapmIcon v-if="saving" name="loading" :size="16" class="animate-spin" />
        <AapmIcon v-else name="submit" :size="16" />
        {{ saving ? 'Menyimpan…' : 'Ajukan' }}
      </Button>
      <Tooltip>
        <TooltipTrigger as-child>
          <Button variant="outline" size="icon" aria-label="Muat ulang data">
            <AapmIcon name="refresh" :size="16" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Muat ulang data</TooltipContent>
      </Tooltip>
      <Toggle v-model="pinned" variant="outline" aria-label="Sematkan laporan">
        <AapmIcon name="target" :size="16" />
        {{ pinned ? 'Tersemat' : 'Sematkan' }}
      </Toggle>
      <ToggleGroup v-model="view" type="single" variant="outline" aria-label="Periode">
        <ToggleGroupItem value="harian">
          Harian
        </ToggleGroupItem>
        <ToggleGroupItem value="mingguan">
          Mingguan
        </ToggleGroupItem>
        <ToggleGroupItem value="bulanan">
          Bulanan
        </ToggleGroupItem>
      </ToggleGroup>
      <SegmentedControl v-model="range" label="Rentang" :options="[{ value: '7', label: '7 hari' }, { value: '30', label: '30 hari' }, { value: '90', label: '90 hari' }]" />
    </div>
  </KitSection>

  <KitSection id="input" eyebrow="Input" title="Field dan pilihan" description="Ring fokus tumbuh halus; titik radio meletup ke opsi baru; centang menggambar dirinya; thumb switch memantul dan memipih saat ditekan; menu select naik dengan motion blur.">
    <div class="grid gap-5 md:grid-cols-2">
      <div class="grid gap-2">
        <Label for="kit-qty">Jumlah telur diterima (kg)</Label>
        <Input id="kit-qty" inputmode="decimal" placeholder="Contoh: 1.250,5" />
      </div>
      <div class="grid gap-2">
        <Label for="kit-house">Kandang</Label>
        <Select v-model="house">
          <SelectTrigger id="kit-house" class="w-full">
            <SelectValue placeholder="Pilih kandang" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Blok A</SelectLabel>
              <SelectItem v-for="k in ['A1', 'A2', 'A3', 'A4']" :key="k" :value="k">
                Kandang {{ k }}
              </SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Blok B</SelectLabel>
              <SelectItem v-for="k in ['B1', 'B2', 'B3', 'B4']" :key="k" :value="k">
                Kandang {{ k }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div class="grid gap-2 md:col-span-2">
        <Label for="kit-note">Catatan pengamatan</Label>
        <Textarea id="kit-note" placeholder="Tulis gejala yang terlihat, misalnya nafsu makan turun di sisi timur kandang." />
      </div>
      <fieldset class="grid gap-3">
        <legend class="mb-1 text-sm font-medium">
          Grade telur
        </legend>
        <RadioGroup v-model="grade" class="grid gap-2.5">
          <div v-for="g in [{ v: 'A', l: 'Grade A — besar (≥ 60 g)' }, { v: 'B', l: 'Grade B — sedang' }, { v: 'C', l: 'Kecil (< 55 g)' }]" :key="g.v" class="flex items-center gap-2.5">
            <RadioGroupItem :id="`grade-${g.v}`" :value="g.v" />
            <Label :for="`grade-${g.v}`" class="font-normal">{{ g.l }}</Label>
          </div>
        </RadioGroup>
      </fieldset>
      <fieldset class="grid gap-3">
        <legend class="mb-1 text-sm font-medium">
          Checklist harian
        </legend>
        <div v-for="(label, key) in { pakan: 'Pakan diberikan sesuai jadwal', air: 'Air minum lancar', suhu: 'Suhu di bawah 32 °C' }" :key="key" class="flex items-center gap-2.5">
          <Checkbox :id="`chk-${key}`" v-model="checks[key]" />
          <Label :for="`chk-${key}`" class="font-normal">{{ label }}</Label>
        </div>
      </fieldset>
      <div class="flex items-center justify-between gap-4 rounded-lg border p-3">
        <Label for="kit-notify" class="grid gap-0.5 font-normal">
          <span class="font-medium">Notifikasi mortalitas</span>
          <span class="text-xs text-muted-foreground">Kirim ke kepala kandang bila melewati ambang.</span>
        </Label>
        <Switch id="kit-notify" v-model="notify" />
      </div>
      <div class="flex items-center justify-between gap-4 rounded-lg border p-3">
        <Label for="kit-auto" class="grid gap-0.5 font-normal">
          <span class="font-medium">Posting otomatis</span>
          <span class="text-xs text-muted-foreground">Nonaktif sampai periode dibuka.</span>
        </Label>
        <Switch id="kit-auto" v-model="autoPost" />
      </div>
      <div class="grid gap-3 md:col-span-2">
        <div class="flex items-baseline justify-between">
          <Label>Target HD</Label>
          <span class="text-sm font-semibold numeric">{{ formatNumber(target[0] ?? 0, 1) }}%</span>
        </div>
        <div ref="sliderWrap">
          <Slider v-model="target" :min="85" :max="97" :step="0.1" />
        </div>
      </div>
    </div>
  </KitSection>

  <KitSection id="pemilih" eyebrow="Input" title="Pemilih" description="Ganti bulan menggeser kalender ke arah perjalanan; tanggal terpilih meletup; rentang tersapu dari awal ke akhir; hari ini bercincin dan bertitik. Chip tag meletup masuk dan mengempis keluar; angka bergulir naik atau turun.">
    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
      <div class="grid content-start gap-5">
        <div class="grid gap-1.5">
          <Label for="kit-date">Tanggal penerimaan</Label>
          <Popover>
            <PopoverTrigger as-child>
              <Button id="kit-date" variant="outline" class="justify-start font-normal" :class="!receiptDate && 'text-muted-foreground'">
                <AapmIcon name="calendar" :size="16" />
                {{ receiptDate ? dateLabel.format(receiptDate.toDate(timeZone)) : 'Pilih tanggal' }}
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0" align="start">
              <Calendar v-model="receiptDate" locale="id-ID" initial-focus />
            </PopoverContent>
          </Popover>
        </div>

        <div class="grid gap-1.5">
          <Label>Kandang</Label>
          <Combobox v-model="comboHouse" by="value">
            <ComboboxAnchor as-child>
              <ComboboxTrigger as-child>
                <Button variant="outline" class="w-full justify-between font-normal">
                  {{ comboHouse?.label ?? 'Pilih kandang' }}
                  <AapmIcon name="chevronDown" :size="16" class="opacity-60" />
                </Button>
              </ComboboxTrigger>
            </ComboboxAnchor>
            <ComboboxList class="w-(--reka-combobox-trigger-width)">
              <ComboboxInput placeholder="Cari kandang…" />
              <ComboboxEmpty>Tidak ada kandang.</ComboboxEmpty>
              <ComboboxViewport class="p-1">
                <ComboboxGroup>
                  <ComboboxItem v-for="h in HOUSES" :key="h.value" :value="h">
                    {{ h.label }}
                    <ComboboxItemIndicator class="ml-auto">
                      <AapmIcon name="approve" :size="16" />
                    </ComboboxItemIndicator>
                  </ComboboxItem>
                </ComboboxGroup>
              </ComboboxViewport>
            </ComboboxList>
          </Combobox>
        </div>

        <div class="grid gap-1.5">
          <Label>Kandang tujuan vaksinasi</Label>
          <Combobox v-model="comboHouses" by="value" multiple>
            <ComboboxAnchor as-child>
              <ComboboxTrigger as-child>
                <Button variant="outline" class="w-full justify-between font-normal">
                  {{ comboHouses?.length ? `${comboHouses.length} kandang dipilih` : 'Pilih satu atau lebih' }}
                  <AapmIcon name="chevronDown" :size="16" class="opacity-60" />
                </Button>
              </ComboboxTrigger>
            </ComboboxAnchor>
            <ComboboxList class="w-(--reka-combobox-trigger-width)">
              <ComboboxInput placeholder="Cari kandang…" />
              <ComboboxEmpty>Tidak ada kandang.</ComboboxEmpty>
              <ComboboxViewport class="p-1">
                <ComboboxItem v-for="h in HOUSES" :key="h.value" :value="h">
                  {{ h.label }}
                  <ComboboxItemIndicator class="ml-auto">
                    <AapmIcon name="approve" :size="16" />
                  </ComboboxItemIndicator>
                </ComboboxItem>
              </ComboboxViewport>
            </ComboboxList>
          </Combobox>
        </div>

        <div class="grid gap-1.5">
          <Label for="kit-lots">Lot pakan</Label>
          <TagsInput v-model="lots" class="min-h-9">
            <TagsInputItem v-for="lot in lots" :key="lot" :value="lot">
              <TagsInputItemText class="px-2 font-mono text-xs" />
              <TagsInputItemDelete />
            </TagsInputItem>
            <TagsInputInput id="kit-lots" placeholder="Ketik lot lalu Enter" class="min-w-32 flex-1 bg-transparent text-sm outline-none" />
          </TagsInput>
        </div>

        <NumberField v-model="eggCount" :min="0" :step="30" :format-options="{ maximumFractionDigits: 0 }" locale="id-ID">
          <Label for="kit-eggs">Telur pecah (butir) · langkah 30</Label>
          <NumberFieldContent>
            <NumberFieldDecrement />
            <NumberFieldInput id="kit-eggs" />
            <NumberFieldIncrement />
          </NumberFieldContent>
        </NumberField>
      </div>

      <div class="grid min-w-0 content-start gap-1.5">
        <Label>Periode laporan</Label>
        <div class="overflow-x-auto rounded-lg border">
          <RangeCalendar v-model="period" locale="id-ID" :number-of-months="2" class="w-fit" />
        </div>
        <p class="text-sm text-muted-foreground">
          {{ periodLabel }}
        </p>
      </div>
    </div>
  </KitSection>

  <KitSection id="ikon-beranimasi" eyebrow="Ikon" title="Ikon beranimasi" description="Setiap ikon di tombol, tautan, dan menu bergerak sesuai maknanya saat disorot (atau ditekan di layar sentuh): tutup tempat sampah terangkat lalu menutup, pensil mencoret, ayam mematuk, telur bergoyang. Ikon status dan dekoratif tetap diam. Dengan reduced motion, tidak ada yang bergerak.">
    <div v-for="group in ICON_GALLERY" :key="group.title" class="grid gap-2">
      <p class="eyebrow text-muted-foreground">
        {{ group.title }}
      </p>
      <div class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,8.5rem),1fr))] gap-2">
        <Button v-for="item in group.items" :key="item.name" variant="outline" class="h-auto min-h-9 justify-start whitespace-normal text-left">
          <AapmIcon :name="item.name" :size="18" />
          {{ item.label }}
        </Button>
      </div>
    </div>
    <div class="grid gap-2">
      <p class="eyebrow text-muted-foreground">
        Dengan status (AnimatedIcon)
      </p>
      <div class="flex flex-wrap gap-2">
        <Button variant="outline">
          <AapmIcon name="copy" animate :size="18" />
          Salin nomor GRN
        </Button>
        <Button variant="outline" :disabled="refreshing" @click="simulateRefresh">
          <AapmIcon name="refresh" animate :play="refreshing" :size="18" />
          {{ refreshing ? 'Memuat ulang…' : 'Muat ulang data' }}
        </Button>
      </div>
    </div>
  </KitSection>
</template>
