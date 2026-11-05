<script setup lang="ts" generic="T extends RowData">
import type { PaginationState, RowData, Updater } from '@tanstack/vue-table'
import type { CSSProperties } from 'vue'

import { FolderOpenIcon } from '@lucide/vue'
import { FlexRender } from '@tanstack/vue-table'
import { toRef } from 'vue'

import AutoHeight from '@/components/aapm/motion/auto-height.vue'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Table, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useStagedList } from '@/composables/use-staged-list'
import { DEFAULT_PAGE_SIZE } from '@/constants/app'

import type { DataTableColumn, DataTableInstance, DataTableProps } from './table'

import { useDataTable } from './table'
import DataTableLoading from './table-loading.vue'
import DataTablePagination from './table-pagination.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps<DataTableProps<T>>()

defineSlots<{
  'bulk-actions': (props: { table: DataTableInstance<T> }) => any
  'empty': (props: { table: DataTableInstance<T> }) => any
  'toolbar': (props: { table: DataTableInstance<T> }) => any
}>()

const clientPagination = shallowRef<PaginationState>({
  pageIndex: 0,
  pageSize: DEFAULT_PAGE_SIZE,
})

const serverPaginationOptions = {
  manualPagination: computed(() => Boolean(props.serverPagination)),
  rowCount: computed(() => props.serverPagination?.rowCount),
  state: computed(() => ({
    pagination: props.serverPagination?.state ?? clientPagination.value,
  })),
  onPaginationChange: (updater: Updater<PaginationState>) => {
    if (props.serverPagination) {
      props.serverPagination.onChange(updater)
      return
    }

    clientPagination.value = typeof updater === 'function'
      ? updater(clientPagination.value)
      : updater
  },
}

const table = useDataTable<T>({
  columns: toRef(props, 'columns'),
  data: toRef(props, 'data'),
  ...serverPaginationOptions,
})

// Rows that leave on a sort / filter / page change stay rendered for the exit phase.
const { items: rows, leaving } = useStagedList(
  computed(() => table.getRowModel().rows),
  row => row.id,
)

function getCommonPinningStyles(column: DataTableColumn<T>): CSSProperties {
  const isPinned = column.getIsPinned()
  return {
    left: isPinned === 'start' ? `${column.getStart('start')}px` : undefined,
    right: isPinned === 'end' ? `${column.getAfter('end')}px` : undefined,
    position: isPinned ? 'sticky' : 'relative',
    width: `${column.getSize()}px`,
    zIndex: isPinned ? 1 : 0,
  }
}
</script>

<template>
  <div>
    <div class="space-y-4">
      <slot v-if="$slots.toolbar" name="toolbar" :table="table" />

      <!-- Height follows the row count smoothly so the pagination below never jumps. -->
      <AutoHeight>
        <div class="border rounded-md">
          <Table v-bind="$attrs" :aria-busy="loading || undefined">
            <TableHeader>
              <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
                <TableHead
                  v-for="header in headerGroup.headers"
                  :key="header.id"
                  :style="getCommonPinningStyles(header.column)"
                  :class="{ 'bg-background': header.column.getIsPinned() }"
                >
                  <FlexRender v-if="!header.isPlaceholder" :header="header" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <!--
              Data change (sort / filter / page), staged by useStagedList: rows that leave fade and
              compress in place (160ms, still in the layout so columns never jump), then rows that
              stay glide to their new position (FLIP transform, 420ms) and new rows fade in.
              assets/motion/table.css · tr[data-leaving] / .aapm-row-*
            -->
            <TransitionGroup
              v-if="!loading"
              tag="tbody"
              data-slot="table-body"
              data-aapm-staged
              class="[&_tr:last-child]:border-0"
              move-class="aapm-row-move"
              enter-active-class="aapm-row-enter-active"
              enter-from-class="aapm-row-enter-from"
              leave-active-class="aapm-row-leave-active"
            >
              <template v-if="rows.length">
                <TableRow
                  v-for="row in rows"
                  :key="row.id"
                  :data-state="row.getIsSelected() && 'selected'"
                  :data-leaving="leaving.has(row.id) || undefined"
                >
                  <TableCell
                    v-for="cell in row.getVisibleCells()"
                    :key="cell.id"
                    :style="getCommonPinningStyles(cell.column)"
                    :class="{ 'bg-background': cell.column.getIsPinned() }"
                  >
                    <FlexRender :cell="cell" />
                  </TableCell>
                </TableRow>
              </template>

              <TableRow
                v-else
                key="__empty"
              >
                <TableCell
                  :colspan="table.getVisibleLeafColumns().length"
                  class="h-24 text-center"
                >
                  <Empty>
                    <slot name="empty" :table="table">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <FolderOpenIcon />
                        </EmptyMedia>
                        <EmptyTitle>No result found.</EmptyTitle>
                        <EmptyDescription>
                          Please try a different search term or check the spelling.
                        </EmptyDescription>
                      </EmptyHeader>
                    </slot>
                  </Empty>
                </TableCell>
              </TableRow>
            </TransitionGroup>
          </Table>
          <DataTableLoading v-if="loading" />
        </div>
      </AutoHeight>

      <DataTablePagination v-if="!loading && table.getRowCount()" :table="table" />
    </div>

    <slot v-if="$slots['bulk-actions']" name="bulk-actions" :table="table" />
  </div>
</template>
