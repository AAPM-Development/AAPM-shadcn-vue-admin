<script setup lang="ts">
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatNumber } from '@/lib/format-id'

import type { Movement } from './types'

/** ERP StockMovementViewer: item/warehouse/lot, signed quantities, running balance. */

const props = defineProps<{ item: string, warehouse: string, unit: string, opening: number, movements: Movement[] }>()

const rows = computed(() => {
  let balance = props.opening
  return props.movements.map((m) => {
    balance += m.qty
    return { ...m, balance }
  })
})
const negative = computed(() => rows.value.some(r => r.balance < 0))
</script>

<template>
  <div class="grid gap-2">
    <p class="text-sm">
      <span class="font-semibold">{{ item }}</span>
      <span class="text-muted-foreground"> · {{ warehouse }} · saldo awal {{ formatNumber(opening) }} {{ unit }}</span>
    </p>
    <div class="overflow-x-auto rounded-lg border" role="region" aria-label="Kartu stok" tabindex="0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Dokumen</TableHead>
            <TableHead>Jenis</TableHead>
            <TableHead>Lot</TableHead>
            <TableHead class="text-right">
              Mutasi ({{ unit }})
            </TableHead>
            <TableHead class="text-right">
              Saldo ({{ unit }})
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="r in rows" :key="r.id">
            <TableCell class="numeric">
              {{ r.date }}
            </TableCell>
            <TableCell class="font-mono text-xs">
              {{ r.doc }}
            </TableCell>
            <TableCell>{{ r.type }}</TableCell>
            <TableCell class="font-mono text-xs text-muted-foreground">
              {{ r.lot }}
            </TableCell>
            <TableCell class="text-right font-semibold numeric" :class="r.qty < 0 ? 'text-danger' : 'text-success'">
              {{ r.qty > 0 ? '+' : r.qty < 0 ? '−' : '' }}{{ formatNumber(Math.abs(r.qty)) }}
            </TableCell>
            <TableCell class="text-right numeric" :class="r.balance < 0 ? 'font-semibold text-danger' : ''">
              {{ formatNumber(r.balance) }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    <p v-if="negative" role="alert" class="text-xs font-semibold text-danger">
      Saldo negatif terdeteksi — posting diblokir sampai mutasi dikoreksi.
    </p>
  </div>
</template>
