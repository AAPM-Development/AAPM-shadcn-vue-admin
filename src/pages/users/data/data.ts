import { AwardIcon, BadgeDollarSignIcon, HandshakeIcon, ShieldIcon } from '@lucide/vue'

import type { FacetedFilterOption } from '@/components/data-table'

import { toneOf } from '@/components/aapm/tone/tones'

import type { UserRole, UserStatus } from './schema'

export const callTypes: FacetedFilterOption<UserStatus>[] = ([
  {
    label: 'Active',
    value: 'active',
  },
  {
    label: 'Inactive',
    value: 'inactive',
  },
  {
    label: 'Invited',
    value: 'invited',
  },
  {
    label: 'Suspended',
    value: 'suspended',
  },
] satisfies FacetedFilterOption<UserStatus>[]).map(o => ({ ...o, tone: toneOf('user', o.value) }))

export const userTypes: FacetedFilterOption<UserRole>[] = ([
  {
    label: 'Superadmin',
    value: 'superadmin',
    icon: BadgeDollarSignIcon,
  },
  {
    label: 'Admin',
    value: 'admin',
    icon: HandshakeIcon,
  },
  {
    label: 'Manager',
    value: 'manager',
    icon: AwardIcon,
  },
  {
    label: 'Cashier',
    value: 'cashier',
    icon: ShieldIcon,
  },
] satisfies FacetedFilterOption<UserRole>[]).map(o => ({ ...o, tone: toneOf('role', o.value) }))
