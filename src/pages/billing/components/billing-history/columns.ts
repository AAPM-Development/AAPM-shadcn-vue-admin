import type { DataTableColumnDef } from '@/components/data-table'

import ToneChip from '@/components/aapm/tone/tone-chip.vue'
import { toneOf } from '@/components/aapm/tone/tones'
import { DataTableColumnHeader } from '@/components/data-table'

import type { Billing } from './data/schema'

import DataTableRowActions from './data-table-row-actions.vue'
import { statuses } from './data/data'

export const columns: DataTableColumnDef<Billing>[] = [

  {
    accessorKey: 'id',
    header: ({ column }) => h(DataTableColumnHeader<Billing>, { column, title: 'ID' }),
    cell: ({ row }) => h('div', { }, row.getValue('id')),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => h(DataTableColumnHeader<Billing>, { column, title: 'amount' }),
    cell: ({ row }) => h('div', { }, row.getValue('amount')),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'date',
    header: ({ column }) => h(DataTableColumnHeader<Billing>, { column, title: 'billing date' }),
    cell: ({ row }) => h('div', { }, row.getValue('date')),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'plan',
    header: ({ column }) => h(DataTableColumnHeader<Billing>, { column, title: 'billing plan' }),
    cell: ({ row }) => h(ToneChip, { tone: toneOf('plan', row.getValue('plan')), variant: 'outline', dot: true }, () => row.getValue('plan')),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => h(DataTableColumnHeader<Billing>, { column, title: 'status' }),
    cell: ({ row }) => {
      const status = statuses.find(status => status.value === row.getValue('status'))
      if (!status)
        return h('div', { }, row.getValue('status'))

      return h(ToneChip, { tone: toneOf('billing', status.value), icon: status.icon }, () => status.label)
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'orderId',
    header: ({ column }) => h(DataTableColumnHeader<Billing>, { column, title: 'Order ID' }),
    cell: ({ row }) => h('div', { }, row.getValue('orderId') || 'N/A'),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'actions',
    cell: ({ row }) => h(DataTableRowActions, { row }),
  },
]
