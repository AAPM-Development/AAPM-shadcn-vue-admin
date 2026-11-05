import { describe, expect, it } from 'vitest'

import type { NavGroup } from '@/components/app-sidebar/types'

import { resolveBreadcrumbs } from '../breadcrumbs'

const nav: NavGroup[] = [
  { title: 'Operasional', items: [{ title: 'Ringkasan farm', url: '/dashboard' }] },
  {
    title: 'Sistem',
    items: [
      { title: 'Pengaturan', items: [{ title: 'Profil', url: '/settings/' }, { title: 'Akun', url: '/settings/account' }] },
      { title: 'Repositori sumber', url: 'https://github.com/example/repo' },
    ],
  },
]

describe('resolveBreadcrumbs', () => {
  it('returns group then page for a top-level item', () => {
    expect(resolveBreadcrumbs('/dashboard', nav)).toEqual([
      { title: 'Operasional' },
      { title: 'Ringkasan farm', url: '/dashboard' },
    ])
  })

  it('includes the parent menu for nested items and ignores a trailing slash', () => {
    expect(resolveBreadcrumbs('/settings/account/', nav)).toEqual([
      { title: 'Sistem' },
      { title: 'Pengaturan' },
      { title: 'Akun', url: '/settings/account' },
    ])
  })

  it('matches /settings to the item declared as /settings/', () => {
    expect(resolveBreadcrumbs('/settings', nav).at(-1)).toEqual({ title: 'Profil', url: '/settings/' })
  })

  it('falls back to the closest parent path for detail routes', () => {
    expect(resolveBreadcrumbs('/dashboard/kandang/b3', nav).map(c => c.title)).toEqual(['Operasional', 'Ringkasan farm'])
  })

  it('never matches external links and returns an empty trail for unknown routes', () => {
    expect(resolveBreadcrumbs('/github.com/example/repo', nav)).toEqual([])
    expect(resolveBreadcrumbs('/unknown', nav)).toEqual([])
  })
})
