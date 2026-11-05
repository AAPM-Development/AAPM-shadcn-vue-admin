import { describe, expect, it } from 'vitest'

import type { NavItem, NavSubItem } from '@/components/app-sidebar/types'

import { ICONS } from '@/components/aapm/icon/registry'

import { navData, settingsNavItems } from '../sidebar-data'

function flatten(items: (NavItem | NavSubItem)[]): (NavItem | NavSubItem)[] {
  return items.flatMap(item => [item, ...flatten(item.items ?? [])])
}

const registered = new Set(Object.values(ICONS))

describe('sidebar navigation', () => {
  const items = flatten(navData.flatMap(group => group.items))

  it('uses only AAPM registry icons', () => {
    for (const item of [...items, ...settingsNavItems]) {
      if (item.icon)
        expect(registered.has(item.icon), item.title).toBe(true)
    }
  })

  it('gives every top-level item an icon for the collapsed rail', () => {
    for (const group of navData) {
      for (const item of group.items)
        expect(item.icon, item.title).toBeTruthy()
    }
  })

  it('links the brand kit page', () => {
    expect(items.some(item => 'url' in item && item.url === '/brand')).toBe(true)
  })
})
