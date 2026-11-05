import { describe, expect, it } from 'vitest'

import { formatCompact, formatNumber, formatPercent, formatRelativeId, formatRupiah, formatSigned } from '../format-id'

describe('formatNumber', () => {
  it('uses period thousands separators', () => {
    expect(formatNumber(12450)).toBe('12.450')
  })

  it('formats negative decimals with a comma', () => {
    expect(formatNumber(-1234.5, 1)).toBe('-1.234,5')
  })
})

describe('formatPercent', () => {
  it('treats input as percent units', () => {
    expect(formatPercent(92.4)).toBe('92,4%')
  })

  it('respects the digits argument', () => {
    expect(formatPercent(7, 0)).toBe('7%')
  })
})

describe('formatRupiah', () => {
  it('formats full Rupiah with a plain space', () => {
    expect(formatRupiah(482650000)).toBe('Rp 482.650.000')
  })

  it('compacts billions to M', () => {
    expect(formatRupiah(1_200_000_000, { compact: true })).toBe('Rp 1,2 M')
  })

  it('compacts millions to jt', () => {
    expect(formatRupiah(482_650_000, { compact: true })).toBe('Rp 482,7 jt')
  })
})

describe('formatCompact', () => {
  it('leaves small values whole', () => {
    expect(formatCompact(950)).toBe('950')
  })

  it('uses rb for thousands', () => {
    expect(formatCompact(12_450)).toBe('12,5 rb')
  })

  it('uses jt for millions', () => {
    expect(formatCompact(1_250_000)).toBe('1,3 jt')
  })

  it('uses M for billions', () => {
    expect(formatCompact(1_200_000_000)).toBe('1,2 M')
  })
})

describe('formatSigned', () => {
  it('prefixes positive values with +', () => {
    expect(formatSigned(3.2)).toBe('+3,2%')
  })

  it('uses a true minus sign for negatives', () => {
    expect(formatSigned(-1.25)).toBe('−1,3%')
  })

  it('shows zero without a sign', () => {
    expect(formatSigned(0)).toBe('0,0%')
  })

  it('accepts a custom suffix', () => {
    expect(formatSigned(-0.04, 2, ' pt')).toBe('−0,04 pt')
  })
})

describe('formatRelativeId', () => {
  const now = new Date('2026-11-05T10:00:00+07:00')
  it('relative time never reads as the future', () => {
    expect(formatRelativeId(new Date(now.getTime() - 12 * 60_000), now)).toBe('12 menit yang lalu')
    expect(formatRelativeId(new Date(now.getTime() - 3 * 3_600_000), now)).toBe('3 jam yang lalu')
    expect(formatRelativeId(new Date(now.getTime() - 86_400_000), now)).toBe('kemarin')
    expect(formatRelativeId(new Date(now.getTime() + 120_000), now)).toBe('baru saja')
    expect(formatRelativeId(new Date(now.getTime() - 20_000), now)).toBe('baru saja')
    expect(formatRelativeId(undefined, now)).toBe('baru saja')
    expect(formatRelativeId(Number.NaN, now)).toBe('baru saja')
  })
})

describe('formatRelativeId · calendar days', () => {
  const now = new Date('2026-11-05T08:00:00+07:00')
  it('counts days by calendar date, not by 24-hour blocks', () => {
    expect(formatRelativeId(new Date('2026-11-04T20:00:00+07:00'), now)).toBe('12 jam yang lalu')
    expect(formatRelativeId(new Date('2026-11-04T07:00:00+07:00'), now)).toBe('kemarin')
    expect(formatRelativeId(new Date('2026-11-03T09:00:00+07:00'), now)).toBe('kemarin dulu')
  })
  it('reads a year once it is about a year', () => {
    expect(formatRelativeId(new Date(now.getTime() - 362 * 86_400_000), now)).toBe('tahun lalu')
    expect(formatRelativeId(new Date(now.getTime() - 3 * 365 * 86_400_000), now)).toBe('3 tahun yang lalu')
  })
})
