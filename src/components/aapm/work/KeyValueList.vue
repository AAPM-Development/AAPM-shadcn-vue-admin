<script setup lang="ts">
/** Record summary / key-value facts (Ecosystem UI-DAT-007). Units stay with values; empty reads "—". */
export interface KeyValueItem { key: string, value: string, unit?: string, hint?: string }
withDefaults(defineProps<{ items: KeyValueItem[], columns?: 1 | 2 | 3 }>(), { columns: 2 })
const COLS = { 1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 lg:grid-cols-3' } as const
</script>

<template>
  <dl v-if="items.length" class="grid grid-cols-[minmax(0,1fr)] gap-x-6 gap-y-3" :class="COLS[columns]">
    <div v-for="item in items" :key="item.key" class="grid min-w-0 gap-0.5">
      <dt class="text-xs text-muted-foreground">
        {{ item.key }}
      </dt>
      <dd class="text-sm font-medium numeric wrap-anywhere">
        {{ item.value ? (item.unit ? `${item.value} ${item.unit}` : item.value) : '—' }}
        <span v-if="item.hint" class="block text-xs font-normal text-muted-foreground">{{ item.hint }}</span>
      </dd>
    </div>
  </dl>
  <p v-else class="text-sm text-muted-foreground">
    Belum ada data.
  </p>
</template>
