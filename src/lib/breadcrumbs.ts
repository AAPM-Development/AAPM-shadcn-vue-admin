import type { NavGroup, NavItem, NavSubItem } from '@/components/app-sidebar/types'

export interface Crumb {
  title: string
  /** Present only on the current page crumb; groups and parent menus are not links. */
  url?: string
}

const normalize = (path: string) => (path.length > 1 ? path.replace(/\/+$/, '') : path) || '/'
const isInternal = (url?: string): url is string => !!url && url.startsWith('/')

/**
 * Breadcrumb trail from the sidebar model (ERP UX-03): group → parent menu → page.
 * Detail routes fall back to the closest declared parent path; external links never match.
 */
export function resolveBreadcrumbs(path: string, groups: NavGroup[]): Crumb[] {
  const target = normalize(path)
  let best: { trail: Crumb[], length: number } | null = null

  function visit(items: (NavItem | NavSubItem)[], trail: Crumb[]) {
    for (const item of items) {
      if (item.items?.length) {
        visit(item.items, [...trail, { title: item.title }])
        continue
      }
      if (!isInternal(item.url))
        continue
      const candidate = normalize(item.url)
      const matches = target === candidate || target.startsWith(`${candidate === '/' ? '' : candidate}/`)
      if (matches && (!best || candidate.length > best.length))
        best = { trail: [...trail, { title: item.title, url: item.url }], length: candidate.length }
    }
  }

  for (const group of groups)
    visit(group.items, [{ title: group.title }])

  return best ? (best as { trail: Crumb[] }).trail : []
}
