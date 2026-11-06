/**
 * Indonesian (id-ID) number formatting for AAPM screens.
 * Period thousands, comma decimals: `12.450 kg`, `92,4%`, `Rp 482.650.000`, `Rp 1,2 M`.
 */

const formatters = new Map<string, Intl.NumberFormat>()

function getFormatter(minDigits: number, maxDigits: number) {
  const key = `${minDigits}-${maxDigits}`
  let formatter = formatters.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: minDigits,
      maximumFractionDigits: maxDigits,
    })
    formatters.set(key, formatter)
  }
  return formatter
}

/** Intl emits non-breaking spaces and, in some engines, U+2212 — normalize both. */
function normalize(value: string) {
  return value.replace(/[\xA0\u202F]/g, ' ').replace(/−/g, '-')
}

export function formatNumber(n: number, digits = 0): string {
  return normalize(getFormatter(digits, digits).format(n))
}

/** `n` is already in percent units: `formatPercent(92.4)` → `92,4%`. */
export function formatPercent(n: number, digits = 1): string {
  return `${formatNumber(n, digits)}%`
}

const COMPACT_UNITS = [
  { size: 1e12, suffix: 'T' },
  { size: 1e9, suffix: 'M' },
  { size: 1e6, suffix: 'jt' },
  { size: 1e3, suffix: 'rb' },
] as const

/** Compact Indonesian magnitude: `12,5 rb`, `1,3 jt`, `1,2 M`. One decimal, trailing zero dropped. */
export function formatCompact(n: number): string {
  const abs = Math.abs(n)
  const unit = COMPACT_UNITS.find(u => abs >= u.size)
  if (!unit)
    return formatNumber(Math.round(n))
  // Divide by a tenth of the unit first so integer inputs round exactly (12450 → 124.5 → 125).
  const tenths = Math.sign(n) * Math.round(abs / (unit.size / 10))
  return `${normalize(getFormatter(0, 1).format(tenths / 10))} ${unit.suffix}`
}

export function formatRupiah(n: number, opts: { compact?: boolean } = {}): string {
  const sign = n < 0 ? '-' : ''
  const abs = Math.abs(n)
  const body = opts.compact ? formatCompact(abs) : formatNumber(Math.round(abs))
  return `${sign}Rp ${body}`
}

/** Signed delta with a true minus sign: `+3,2%`, `−1,3%`, `0,0%`. */
export function formatSigned(n: number, digits = 1, suffix = '%'): string {
  const body = formatNumber(Math.abs(n), digits)
  const isZero = /^[0.,]+$/.test(body)
  const sign = isZero ? '' : n > 0 ? '+' : '−'
  return `${sign}${body}${suffix}`
}

const RELATIVE_ID = new Intl.RelativeTimeFormat('id-ID', { numeric: 'auto' })

/**
 * "12 menit yang lalu", "3 jam yang lalu", "kemarin", "kemarin dulu". Anything under a minute
 * old, in the future (clock skew between device and server) or unknown reads "baru saja": a
 * freshness label must never claim data from the future. From 24 hours on, days count by
 * calendar date (47 hours ago at 08:00 is "kemarin dulu", not "kemarin"), and about a year reads
 * as a year rather than "12 bulan".
 */
export function formatRelativeId(since: Date | number | undefined, now: Date | number = Date.now()): string {
  const then = since instanceof Date ? since.getTime() : since
  const at = now instanceof Date ? now.getTime() : now
  const diff = at - (then ?? Number.NaN)
  if (!Number.isFinite(diff) || diff < 60_000)
    return 'baru saja'
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 60)
    return RELATIVE_ID.format(-minutes, 'minute')
  const hours = Math.floor(minutes / 60)
  if (hours < 24)
    return RELATIVE_ID.format(-hours, 'hour')
  const midnight = (t: number) => new Date(t).setHours(0, 0, 0, 0)
  const days = Math.max(1, Math.round((midnight(at) - midnight(then!)) / 86_400_000))
  if (days < 30)
    return RELATIVE_ID.format(-days, 'day')
  if (days < 360)
    return RELATIVE_ID.format(-Math.floor(days / 30), 'month')
  return RELATIVE_ID.format(-Math.max(1, Math.round(days / 365)), 'year')
}

/**
 * Parse an Indonesian-formatted number: "." groups thousands (exactly three digits per group),
 * "," marks decimals. "1.250" → 1250, "1.250,5" → 1250.5, "1250,5" → 1250.5. Anything ambiguous
 * ("1.2.3", "1,250.5", "1.25") returns null — never silently change the magnitude (ERP UX-05).
 */
export function parseNumberId(input: string): number | null {
  const s = input.trim()
  if (!/^-?(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d+)?$/.test(s))
    return null
  return Number(s.replaceAll('.', '').replace(',', '.'))
}

/**
 * The id-ID canonical text of a number `parseNumberId` accepts, built from the typed digits and
 * never from the float, so no value changes magnitude or loses digits: integer regrouped with `.`,
 * leading zeros and trailing decimal zeros trimmed, `-0` read as `0`. Null when not accepted.
 */
export function canonicalNumberId(input: string): string | null {
  const s = input.trim()
  if (parseNumberId(s) === null)
    return null
  const negative = s.startsWith('-')
  const [intRaw = '', decRaw = ''] = s.replace(/^-/, '').replaceAll('.', '').split(',')
  const int = intRaw.replace(/^0+(?=\d)/, '').replace(/\B(?=(?:\d{3})+(?!\d))/g, '.')
  const dec = decRaw.replace(/0+$/, '')
  const body = dec ? `${int},${dec}` : int
  return negative && body !== '0' ? `-${body}` : body
}
