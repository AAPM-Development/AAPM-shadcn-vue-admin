<script setup lang="ts">
import type { IconName } from '@/components/aapm/icon/registry'

import ToneChip from '@/components/aapm/tone/tone-chip.vue'
import { toneOf } from '@/components/aapm/tone/tones'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatNumber, formatRupiah } from '@/lib/format-id'

import type { OrderStatus } from '../data/farm-overview'

import { recentOrders } from '../data/farm-overview'
import PanelHeader from './panel-header.vue'

/** Domain vocabulary: draft ≠ dikirim ≠ lunas ≠ jatuh tempo (UX-02). */
const STATUS: Record<OrderStatus, { label: string, icon: IconName }> = {
  draft: { label: 'Draft', icon: 'edit' },
  shipped: { label: 'Dikirim', icon: 'truck' },
  paid: { label: 'Lunas', icon: 'success' },
  due: { label: 'Jatuh tempo', icon: 'warning' },
}
</script>

<template>
  <Card id="penjualan" class="scroll-mt-20">
    <PanelHeader
      overline="Penjualan"
      title="Sales order terbaru"
      description="6 dari 142 sales order November. Nilai sudah termasuk PPN."
    >
      <template #action>
        <Button variant="outline" size="sm">
          <AapmIcon name="view" :size="16" />
          Lihat semua
        </Button>
      </template>
    </PanelHeader>
    <CardContent class="px-0 sm:px-0">
      <Table>
        <TableHeader>
          <TableRow class="hover:bg-transparent">
            <TableHead class="pl-6">
              No. SO
            </TableHead>
            <TableHead>Pelanggan</TableHead>
            <TableHead class="hidden text-right md:table-cell">
              Qty (kg)
            </TableHead>
            <TableHead class="text-right">
              Nilai (Rp)
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="hidden pr-6 lg:table-cell">
              Tanggal
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="order in recentOrders" :key="order.id">
            <TableCell class="pl-6 font-mono text-xs text-muted-foreground">
              {{ order.id }}
            </TableCell>
            <TableCell class="max-w-[16rem]">
              <p class="truncate font-medium" :title="order.customer">
                {{ order.customer }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ order.city }}<span class="md:hidden"> · {{ formatNumber(order.qtyKg) }} kg</span>
              </p>
            </TableCell>
            <TableCell class="hidden text-right numeric md:table-cell">
              {{ formatNumber(order.qtyKg) }}
            </TableCell>
            <TableCell class="text-right font-semibold numeric">
              {{ formatRupiah(order.amount).replace('Rp ', '') }}
            </TableCell>
            <TableCell>
              <ToneChip :tone="toneOf('order', order.status)" :icon="STATUS[order.status].icon">
                {{ STATUS[order.status].label }}
              </ToneChip>
            </TableCell>
            <TableCell class="hidden pr-6 text-muted-foreground numeric lg:table-cell">
              {{ order.date }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</template>
