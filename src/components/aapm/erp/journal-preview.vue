<script setup lang="ts">
import AapmIcon from '@/components/aapm/icon/AapmIcon.vue'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatNumber } from '@/lib/format-id'

import type { JournalLine } from './types'

/** ERP JournalPreview: debit/credit lines, document link, must balance before posting. */

const props = defineProps<{ lines: JournalLine[] }>()
const debit = computed(() => props.lines.reduce((s, l) => s + l.debit, 0))
const credit = computed(() => props.lines.reduce((s, l) => s + l.credit, 0))
const balanced = computed(() => debit.value === credit.value)
const rp = (n: number) => (n ? formatNumber(n) : '—')
</script>

<template>
  <div class="grid gap-2">
    <div class="overflow-x-auto rounded-lg border" role="region" aria-label="Pratinjau jurnal" tabindex="0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Akun</TableHead>
            <TableHead class="text-right">
              Debit (Rp)
            </TableHead>
            <TableHead class="text-right">
              Kredit (Rp)
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="l in lines" :key="l.account">
            <TableCell>
              <span class="font-mono text-xs text-muted-foreground">{{ l.account }}</span>
              <span class="ml-2">{{ l.name }}</span>
            </TableCell>
            <TableCell class="text-right numeric">
              {{ rp(l.debit) }}
            </TableCell>
            <TableCell class="text-right numeric">
              {{ rp(l.credit) }}
            </TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell class="font-semibold">
              Total
            </TableCell>
            <TableCell class="text-right font-semibold numeric">
              {{ formatNumber(debit) }}
            </TableCell>
            <TableCell class="text-right font-semibold numeric">
              {{ formatNumber(credit) }}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
    <p class="inline-flex items-center gap-1.5 text-xs font-semibold" :class="balanced ? 'text-success' : 'text-danger'" role="status">
      <AapmIcon :name="balanced ? 'success' : 'danger'" :size="14" />
      {{ balanced ? 'Seimbang — siap diposting' : `Tidak seimbang: selisih Rp ${formatNumber(Math.abs(debit - credit))}` }}
    </p>
  </div>
</template>
