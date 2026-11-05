import { navData } from '@/constants/sidebar-data'

import type { SidebarData, Team, User } from '../types'

const user: User = {
  name: 'Rahmat Hidayat',
  email: 'rahmat.hidayat@aapm.co.id',
  avatar: '',
}

/** Company + active site. UX-03: the active company and branch stay visible at all times. */
const teams: Team[] = [
  { name: 'PT Agung Abadi Putra Mandiri', plan: 'Farm Payakumbuh' },
  { name: 'PT AAPM — Unit Pakan', plan: 'Mixing & gudang pakan' },
  { name: 'AAPM Academy', plan: 'Pelatihan' },
]

export const sidebarData: SidebarData = {
  user,
  teams,
  navMain: navData,
}
