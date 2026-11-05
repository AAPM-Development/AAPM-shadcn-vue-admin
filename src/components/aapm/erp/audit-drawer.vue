<script setup lang="ts">
import AapmIcon from '@/components/aapm/icon/AapmIcon.vue'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

/** ERP AuditDrawer: read-only before/after diff, actor, time, request ID (permission-gated server-side). */
const changes = [
  { field: 'Jumlah baris 2', before: '1.200 kg', after: '1.250,5 kg' },
  { field: 'Lot baris 2', before: '—', after: 'KL-2611-11' },
  { field: 'Status', before: 'Draft', after: 'Diajukan' },
]
</script>

<template>
  <Sheet>
    <SheetTrigger as-child>
      <Button variant="outline">
        <AapmIcon name="history" :size="16" />
        Riwayat audit
      </Button>
    </SheetTrigger>
    <SheetContent side="right" class="w-full sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Riwayat audit · GRN-2611-0087</SheetTitle>
        <SheetDescription>Hanya-baca. Perubahan dicatat server, bukan diedit di sini.</SheetDescription>
      </SheetHeader>
      <div class="grid gap-4 px-4 pb-6">
        <dl class="grid grid-cols-2 gap-3 rounded-lg border p-3 text-sm">
          <div>
            <dt class="text-xs text-muted-foreground">
              Pelaku
            </dt><dd class="font-medium">
              Yulia Fitri · Gudang pakan
            </dd>
          </div>
          <div>
            <dt class="text-xs text-muted-foreground">
              Waktu
            </dt><dd class="font-medium numeric">
              05/11/2026 10.42 WIB
            </dd>
          </div>
          <div class="col-span-2">
            <dt class="text-xs text-muted-foreground">
              Request ID
            </dt><dd class="font-mono text-xs">
              req_01JC9X7Q4N2V8T
            </dd>
          </div>
        </dl>
        <ul class="grid gap-2">
          <li v-for="c in changes" :key="c.field" class="grid gap-1 rounded-lg border p-3 text-sm">
            <span class="text-xs text-muted-foreground">{{ c.field }}</span>
            <span class="flex flex-wrap items-center gap-2">
              <del class="rounded bg-danger-soft px-1.5 text-danger decoration-danger/50">{{ c.before }}</del>
              <AapmIcon name="chevronRight" :size="14" class="text-muted-foreground" />
              <ins class="rounded bg-success-soft px-1.5 text-success no-underline">{{ c.after }}</ins>
            </span>
          </li>
        </ul>
      </div>
    </SheetContent>
  </Sheet>
</template>
