import type { Component } from 'vue'

export type NavIcon = Component

interface BaseNavItem {
  title: string
  icon?: NavIcon
}

export type NavItem
  = | BaseNavItem & {
    items: NavSubItem[]
    url?: never
    isActive?: boolean
  } | BaseNavItem & {
    url: string
    items?: never
  }

/**
 * A navigation entry as exposed by `useSidebarNavigation()`.
 * Covers top-level items and nested sub-items (whose `url` is optional).
 */
export type NavSubItem = BaseNavItem & {
  url?: string
  items?: NavSubItem[]
  isActive?: boolean
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

export interface User {
  name: string
  avatar: string
  email: string
}

export interface Team {
  name: string
  plan: string
  /** Optional override; the official AAPM mark is used when omitted. */
  logo?: NavIcon
}

export interface SidebarData {
  user: User
  teams: Team[]
  navMain: NavGroup[]
}
