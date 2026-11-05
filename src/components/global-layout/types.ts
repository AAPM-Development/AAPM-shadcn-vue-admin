import type { Component } from 'vue'

export interface LayoutHeaderProps {
  title: string
  description?: string
  /** Uppercase micro label above the title, e.g. the module or site name. */
  overline?: string
  sticky?: boolean
}

export interface TwoColAsideNavItem {
  title: string
  url: string
  icon?: Component
}
