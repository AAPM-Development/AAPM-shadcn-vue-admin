export interface LegendItem {
  label: string
  color: string
  /** `line` for series lines, `dash` for targets/standards, `dot` for fills. */
  shape?: 'line' | 'dash' | 'dot'
}

export interface DonutItem {
  label: string
  value: number
  color: string
}

export interface BarListItem {
  label: string
  value: number
  meta?: string
  /** Short text flag for a bar that needs attention, e.g. "Di bawah standar". */
  flag?: string
}
