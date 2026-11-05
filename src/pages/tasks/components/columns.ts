import { h } from 'vue'

import type { DataTableColumnDef } from '@/components/data-table'

import ToneChip from '@/components/aapm/tone/tone-chip.vue'
import { toneOf } from '@/components/aapm/tone/tones'
import { createSelectColumn, DataTableColumnHeader } from '@/components/data-table'

import type { Task } from '../data/schema'

import { labels, priorities, statuses } from '../data/data'
import DataTableRowActions from './data-table-row-actions.vue'

export const columns: DataTableColumnDef<Task>[] = [
  createSelectColumn<Task>(),
  {
    accessorKey: 'id',
    header: ({ column }) => h(DataTableColumnHeader<Task>, { column, title: 'Task' }),
    cell: ({ row }) => h('div', { class: 'w-20' }, row.getValue('id')),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => h(DataTableColumnHeader<Task>, { column, title: 'Title' }),

    cell: ({ row }) => {
      const label = labels.find(label => label.value === row.original.label)

      return h('div', { class: 'flex space-x-2' }, [
        label ? h(ToneChip, { tone: toneOf('label', label.value), variant: 'outline', dot: true }, () => label.label) : null,
        h('span', { class: 'max-w-[500px] truncate font-medium' }, row.getValue('title')),
      ])
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => h(DataTableColumnHeader<Task>, { column, title: 'Status' }),

    cell: ({ row }) => {
      const status = statuses.find(
        status => status.value === row.getValue('status'),
      )

      if (!status)
        return null

      return h(ToneChip, { tone: toneOf('task', status.value), icon: status.icon }, () => status.label)
    },
    filterFn: 'arrHas',
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => h(DataTableColumnHeader<Task>, { column, title: 'Priority' }),
    cell: ({ row }) => {
      const priority = priorities.find(
        priority => priority.value === row.getValue('priority'),
      )

      if (!priority)
        return null

      return h(ToneChip, { tone: toneOf('priority', priority.value), icon: priority.icon, variant: 'outline' }, () => priority.label)
    },
    filterFn: 'arrHas',
  },
  {
    id: 'actions',
    cell: ({ row }) => h(DataTableRowActions, { row }),
  },
]
