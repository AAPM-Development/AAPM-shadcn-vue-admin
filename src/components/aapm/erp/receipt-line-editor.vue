<script setup lang="ts">
import AapmIcon from '@/components/aapm/icon/AapmIcon.vue'
import { focusFirstInvalid, shake } from '@/components/aapm/motion/motion-blur'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatNumber } from '@/lib/format-id'

import ImpactPreview from './impact-preview.vue'

/**
 * TransactionForm pilot (ERP: Inventory Receipt). Stable row identity, add/remove with FLIP,
 * row-specific errors, explicit units, live totals, before → after impact, dirty state, and
 * separate "Simpan draft" vs "Ajukan". A blocked submit shakes and focuses the first error.
 */
interface Line {
  id: number
  item: string
  lot: string
  qty: string
  unit: string
}

let seq = 3
const lines = ref<Line[]>([
  { id: 1, item: 'Jagung giling', lot: 'JG-2611-04', qty: '6.000', unit: 'kg' },
  { id: 2, item: 'Konsentrat layer', lot: '', qty: '1.250,5', unit: 'kg' },
])
const dirty = shallowRef(false)
const errors = ref<Record<number, string>>({})
const root = useTemplateRef<HTMLElement>('root')
const saved = shallowRef('')

/** id-ID decimal input: "1.250,5" → 1250.5. Ambiguous input returns NaN (UX-05: reject, never guess). */
function parseQty(raw: string) {
  const v = raw.trim()
  if (!/^\d{1,3}(?:\.\d{3})*(?:,\d+)?$|^\d+(?:,\d+)?$/.test(v))
    return Number.NaN
  return Number(v.replace(/\./g, '').replace(',', '.'))
}

const total = computed(() => lines.value.reduce((s, l) => s + (Number.isFinite(parseQty(l.qty)) ? parseQty(l.qty) : 0), 0))
const impacts = computed(() => [{ label: 'Stok bahan pakan · Gudang Pakan', unit: 'kg', before: 9_800, change: Math.round(total.value) }])

function addLine() {
  lines.value.push({ id: ++seq, item: '', lot: '', qty: '', unit: 'kg' })
  dirty.value = true
  nextTick(() => root.value?.querySelector<HTMLInputElement>(`[data-line="${seq}"] input`)?.focus())
}
function removeLine(id: number) {
  lines.value = lines.value.filter(l => l.id !== id)
  delete errors.value[id]
  dirty.value = true
}
function validate() {
  const next: Record<number, string> = {}
  for (const l of lines.value) {
    if (!l.item.trim())
      next[l.id] = 'Pilih bahan.'
    else if (!l.lot.trim())
      next[l.id] = 'Lot wajib diisi untuk bahan pakan.'
    else if (!Number.isFinite(parseQty(l.qty)) || parseQty(l.qty) <= 0)
      next[l.id] = 'Jumlah tidak valid — gunakan format 1.250,5.'
  }
  errors.value = next
  return Object.keys(next).length === 0
}
async function submit(kind: 'draft' | 'submit') {
  if (kind === 'submit' && !validate()) {
    await nextTick()
    focusFirstInvalid(root.value)
    await shake(root.value)
    return
  }
  saved.value = kind === 'draft' ? 'Draft tersimpan di server · 10.47' : 'Diajukan · GRN-2611-0087 menunggu verifikasi'
  dirty.value = false
}
</script>

<template>
  <div ref="root" class="grid gap-4">
    <div class="overflow-x-auto rounded-lg border" role="region" aria-label="Baris penerimaan" tabindex="0">
      <div class="grid min-w-[640px] grid-cols-[2rem_minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_3.5rem_2.5rem] items-center gap-x-3 border-b bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">
        <span>#</span><span>Bahan</span><span>Lot</span><span class="text-right">Jumlah</span><span>Satuan</span><span class="sr-only">Aksi</span>
      </div>
      <ol v-auto-animate="{ duration: 220, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }" class="min-w-[640px]">
        <li v-for="(l, i) in lines" :key="l.id" :data-line="l.id" class="border-b px-3 py-2 last:border-0">
          <div class="grid grid-cols-[2rem_minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_3.5rem_2.5rem] items-center gap-x-3">
            <span class="text-xs text-muted-foreground numeric">{{ i + 1 }}</span>
            <Input v-model="l.item" placeholder="Nama bahan" :aria-invalid="errors[l.id] && !l.item ? 'true' : undefined" :aria-label="`Bahan baris ${i + 1}`" @input="dirty = true" />
            <Input v-model="l.lot" placeholder="Lot" class="font-mono" :aria-invalid="errors[l.id] && l.item && !l.lot ? 'true' : undefined" :aria-label="`Lot baris ${i + 1}`" @input="dirty = true" />
            <Input v-model="l.qty" inputmode="decimal" placeholder="0" class="text-right numeric" :aria-invalid="errors[l.id] && l.item && l.lot ? 'true' : undefined" :aria-label="`Jumlah baris ${i + 1}, kg`" @input="dirty = true" />
            <span class="text-sm text-muted-foreground">{{ l.unit }}</span>
            <Button variant="ghost" size="icon-sm" :aria-label="`Hapus baris ${i + 1}`" @click="removeLine(l.id)">
              <AapmIcon name="delete" :size="16" />
            </Button>
          </div>
          <p v-if="errors[l.id]" data-slot="field-error" class="mt-1.5 pl-[2.75rem] text-xs text-destructive">
            {{ errors[l.id] }}
          </p>
        </li>
      </ol>
      <div class="flex min-w-[640px] items-center justify-between border-t bg-muted/30 px-3 py-2 text-sm">
        <Button variant="ghost" size="sm" @click="addLine">
          <AapmIcon name="add" :size="16" />
          Tambah baris
        </Button>
        <span>Total <span class="font-semibold numeric">{{ formatNumber(total, total % 1 ? 1 : 0) }}</span> kg · {{ lines.length }} baris</span>
      </div>
    </div>

    <ImpactPreview :impacts="impacts" />

    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-xs" :class="dirty ? 'text-warning' : 'text-muted-foreground'" role="status">
        <template v-if="dirty">
          Ada perubahan yang belum disimpan
        </template>
        <template v-else>
          {{ saved || 'Semua perubahan tersimpan' }}
        </template>
      </p>
      <div class="flex gap-2">
        <Button variant="outline" @click="submit('draft')">
          <AapmIcon name="save" :size="16" />
          Simpan draft
        </Button>
        <Button @click="submit('submit')">
          <AapmIcon name="submit" :size="16" />
          Ajukan
        </Button>
      </div>
    </div>
  </div>
</template>
