/**
 * SAMPLE DATA for the AAPM farm overview — synthetic, deterministic (seeded) so screenshots
 * are stable. It is labelled "Data contoh" in the UI (ERP UX-02/UX-12: no live-looking
 * fabricated metrics). Formulas (HD%, FCR, mortality) still need a signed-off domain
 * definition before they are shown as authoritative. Replace with server aggregates.
 */

export const REPORT_DATE = new Date('2026-11-04T00:00:00+07:00')
export const COMPANY_NAME = 'PT Agung Abadi Putra Mandiri'
export const SITE_NAME = 'Farm Payakumbuh'
export const UPDATED_AT = '05/11/2026 06.00 WIB'
export const PERIOD_LABEL = '4 November 2026'
export const IS_SAMPLE_DATA = true

function seeded(seed: number) {
  let t = seed
  return () => {
    t += 0x6D2B79F5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}
const rand = seeded(20261104)
const jitter = (spread: number) => (rand() - 0.5) * 2 * spread
const round = (v: number, d = 1) => Math.round(v * 10 ** d) / 10 ** d

export interface ProductionPoint {
  date: Date
  /** Hen-day production, % */
  hdp: number
  /** Breed standard for the flock's age, % */
  standard: number
  /** Saleable eggs, kg */
  eggsKg: number
  /** Eggs, pieces */
  eggs: number
}

const DAYS = 90
export const productionSeries: ProductionPoint[] = Array.from({ length: DAYS }, (_, i) => {
  const date = new Date(REPORT_DATE)
  date.setDate(date.getDate() - (DAYS - 1 - i))
  const standard = round(93.6 - (i / DAYS) * 1.1, 2)
  // A short heat-stress dip around day 55–61, then recovery.
  const dip = i >= 55 && i <= 61 ? -2.6 * Math.sin(((i - 55) / 6) * Math.PI) : 0
  const hdp = round(standard - 0.7 + dip + jitter(0.55), 1)
  const population = 119_820 - Math.round(i * 15.1)
  const eggs = Math.round(population * (hdp / 100))
  const eggsKg = Math.round((eggs * (61.8 + (i / DAYS) * 0.6)) / 1000)
  return { date, hdp, standard, eggsKg, eggs }
})

const today = productionSeries.at(-1)!
const yesterday = productionSeries.at(-2)!

export type DataState = 'ok' | 'stale' | 'unavailable'

export interface Kpi {
  key: 'eggs' | 'hdp' | 'fcr' | 'population' | 'sales'
  label: string
  /** Where the number comes from (UX-09 provenance). */
  source: string
  /** Panel id on this page that holds the detail (UX-12 drilldown). */
  drilldown?: string
  state?: DataState
  stateNote?: string
  value: number
  unit: string
  /** Change vs comparison period, percent units (or points when `deltaSuffix` is " pt"). */
  delta: number
  deltaSuffix?: string
  goodWhen: 'up' | 'down'
  period: string
  trend: number[]
  note?: string
}

export const heroKpi: Kpi = {
  key: 'eggs',
  label: 'Produksi telur',
  source: 'Catatan harian kandang',
  drilldown: 'produksi',
  value: today.eggsKg,
  unit: 'kg',
  delta: round(((today.eggsKg - yesterday.eggsKg) / yesterday.eggsKg) * 100, 1),
  goodWhen: 'up',
  period: 'vs kemarin',
  trend: productionSeries.slice(-30).map(p => p.eggsKg),
  note: `${today.eggs.toLocaleString('id-ID')} butir dari 8 kandang`,
}

export const kpis: Kpi[] = [
  {
    key: 'hdp',
    label: 'Hen-day (HD)',
    source: 'Catatan harian · standar breed',
    drilldown: 'produksi',
    value: today.hdp,
    unit: '%',
    delta: round(today.hdp - today.standard, 1),
    deltaSuffix: ' pt',
    goodWhen: 'up',
    period: `vs standar ${today.standard.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%`,
    trend: productionSeries.slice(-14).map(p => p.hdp),
  },
  {
    key: 'fcr',
    label: 'FCR mingguan',
    source: 'Pemakaian pakan ÷ massa telur',
    drilldown: 'pakan',
    state: 'stale',
    stateNote: 'Timbangan pakan terakhir 03/11 18.00',
    value: 2.08,
    unit: '',
    delta: -1.4,
    goodWhen: 'down',
    period: 'vs minggu lalu',
    trend: [2.14, 2.13, 2.15, 2.12, 2.11, 2.12, 2.1, 2.11, 2.09, 2.1, 2.09, 2.08, 2.09, 2.08],
  },
  {
    key: 'population',
    label: 'Populasi aktif',
    source: 'Mutasi populasi kandang',
    drilldown: 'mortalitas',
    value: 118_460,
    unit: 'ekor',
    delta: 0.09,
    deltaSuffix: '%',
    goodWhen: 'down',
    period: 'deplesi minggu ini',
    trend: [119_640, 119_560, 119_470, 119_380, 119_290, 119_210, 119_120, 119_030, 118_940, 118_850, 118_760, 118_660, 118_560, 118_460],
  },
  {
    key: 'sales',
    label: 'Penjualan November',
    source: 'Faktur penjualan terposting',
    drilldown: 'penjualan',
    value: 482_650_000,
    unit: 'Rp',
    delta: 6.1,
    goodWhen: 'up',
    period: 'vs periode sama Oktober',
    trend: [28, 31, 30, 34, 33, 36, 35, 38, 37, 40, 41, 39, 43, 45].map(v => v * 1_000_000),
  },
]

export interface GradeSlice {
  label: string
  value: number
  color: string
}

/** Today's grading output, kg. Colors follow categorical slot order. */
export const gradeMix: GradeSlice[] = [
  { label: 'Grade A — besar (≥ 60 g)', value: 3_968, color: 'var(--chart-1)' },
  { label: 'Grade B — sedang (55–59 g)', value: 1_847, color: 'var(--chart-2)' },
  { label: 'Kecil (< 55 g)', value: 616, color: 'var(--chart-4)' },
  { label: 'Retak', value: 274, color: 'var(--chart-3)' },
  { label: 'Kotor', value: 137, color: 'var(--chart-5)' },
]

export const HOUSES = ['Kandang A1', 'Kandang A2', 'Kandang A3', 'Kandang A4', 'Kandang B1', 'Kandang B2', 'Kandang B3', 'Kandang B4']
export const WEEKS = Array.from({ length: 12 }, (_, i) => `W${34 + i}`)

/** Weekly mortality, % of house population. values[house][week] */
export const mortalityGrid: number[][] = HOUSES.map((house, h) => WEEKS.map((_, w) => {
  const base = 0.045 + h * 0.004 + jitter(0.018)
  const heat = w >= 7 && w <= 8 ? 0.035 : 0
  const b3 = house === 'Kandang B3' && w >= 9 ? 0.047 * (w - 8) : 0
  return round(Math.max(0.01, base + heat + b3), 3)
}))
export const MORTALITY_THRESHOLDS = [0.04, 0.06, 0.08, 0.11, 0.15]

export type ExceptionTone = 'danger' | 'warning' | 'info'
export interface FarmException {
  id: string
  tone: ExceptionTone
  icon: 'mortality' | 'feed' | 'vaccine' | 'temperature' | 'production'
  title: string
  detail: string
  /** Person or role responsible for the next action (UX-09). */
  owner: string
  time: string
  action: string
}

export const exceptions: FarmException[] = [
  { id: 'ex-1', tone: 'danger', icon: 'mortality', title: 'Mortalitas Kandang B3 naik', detail: '0,21% minggu ini, tiga kali rata-rata farm. Periksa ventilasi dan catatan nekropsi.', owner: 'Andi Saputra · Kepala kandang B', time: '07.15', action: 'Buka kandang' },
  { id: 'ex-2', tone: 'warning', icon: 'feed', title: 'Jagung giling tersisa 3 hari', detail: '6,2 ton dari kebutuhan minimum 14 ton. PO pemasok belum terkonfirmasi.', owner: 'Yulia Fitri · Gudang pakan', time: '06.40', action: 'Buat PO' },
  { id: 'ex-3', tone: 'warning', icon: 'temperature', title: 'Suhu Kandang B1 33,8 °C', detail: 'Tercatat pukul 13.40 kemarin, di atas batas 32 °C selama 2 jam.', owner: 'Andi Saputra · Kepala kandang B', time: 'Kemarin', action: 'Lihat sensor' },
  { id: 'ex-4', tone: 'info', icon: 'vaccine', title: 'Vaksinasi ND-IB Kandang A2', detail: 'Jadwal ulang besok pagi, 14.820 ekor. Pastikan stok vaksin dan tim tersedia.', owner: 'drh. Rina Marlina · Kesehatan hewan', time: 'Besok', action: 'Lihat jadwal' },
  { id: 'ex-5', tone: 'warning', icon: 'production', title: 'HDP Kandang A4 di bawah standar', detail: '89,7% selama 2 hari, 3,1 pt di bawah standar umur 46 minggu.', owner: 'Doni Pratama · Kepala kandang A', time: '2 hari', action: 'Analisis' },
]

export interface FeedStock {
  label: string
  actual: number
  target: number
  max: number
  unit: string
  meta: string
}

export const feedStock: FeedStock[] = [
  { label: 'Pakan layer complete', actual: 18.4, target: 21, max: 28, unit: 'ton', meta: '≈ 6,1 hari pemakaian' },
  { label: 'Jagung giling', actual: 6.2, target: 14, max: 18, unit: 'ton', meta: '≈ 3 hari pemakaian' },
  { label: 'Konsentrat', actual: 9.8, target: 10, max: 14, unit: 'ton', meta: '≈ 9,4 hari pemakaian' },
  { label: 'Dedak padi', actual: 4.1, target: 6, max: 8, unit: 'ton', meta: '≈ 5,2 hari pemakaian' },
]

export interface HouseOutput {
  label: string
  value: number
  meta: string
  flag?: string
}

export const houseOutput: HouseOutput[] = [
  { label: 'Kandang B2', value: 948, meta: 'umur 38 mgg · HDP 94,1%' },
  { label: 'Kandang A1', value: 921, meta: 'umur 41 mgg · HDP 93,6%' },
  { label: 'Kandang B4', value: 904, meta: 'umur 40 mgg · HDP 93,2%' },
  { label: 'Kandang A3', value: 879, meta: 'umur 44 mgg · HDP 92,5%' },
  { label: 'Kandang A2', value: 862, meta: 'umur 45 mgg · HDP 92,0%' },
  { label: 'Kandang B1', value: 851, meta: 'umur 47 mgg · HDP 91,4%' },
  { label: 'Kandang B3', value: 817, meta: 'umur 49 mgg · HDP 90,6%' },
  { label: 'Kandang A4', value: 660, meta: 'umur 46 mgg · HDP 89,7%', flag: 'Di bawah standar' },
]

export type OrderStatus = 'paid' | 'shipped' | 'due' | 'draft'
export interface RecentOrder {
  id: string
  customer: string
  city: string
  qtyKg: number
  amount: number
  status: OrderStatus
  date: string
}

export const recentOrders: RecentOrder[] = [
  { id: 'SO-2611-0142', customer: 'Indogrosir Pekanbaru', city: 'Pekanbaru', qtyKg: 2_400, amount: 64_800_000, status: 'shipped', date: '04/11/2026' },
  { id: 'SO-2611-0141', customer: 'CV Minang Pangan', city: 'Padang', qtyKg: 1_350, amount: 36_045_000, status: 'paid', date: '04/11/2026' },
  { id: 'SO-2611-0139', customer: 'Agen Telur Rahmah', city: 'Solok', qtyKg: 780, amount: 21_138_000, status: 'due', date: '03/11/2026' },
  { id: 'SO-2611-0137', customer: 'Toko Sinar Harapan', city: 'Bukittinggi', qtyKg: 420, amount: 11_466_000, status: 'paid', date: '03/11/2026' },
  { id: 'SO-2611-0136', customer: 'Koperasi Peternak Lima Puluh Kota', city: 'Payakumbuh', qtyKg: 1_120, amount: 29_904_000, status: 'shipped', date: '02/11/2026' },
  { id: 'SO-2611-0134', customer: 'UD Makmur Jaya', city: 'Batusangkar', qtyKg: 560, amount: 15_008_000, status: 'draft', date: '02/11/2026' },
]
