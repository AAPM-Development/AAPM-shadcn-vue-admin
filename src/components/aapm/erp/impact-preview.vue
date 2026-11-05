<script setup lang="ts">
import AapmIcon from '@/components/aapm/icon/AapmIcon.vue'
import { formatNumber } from '@/lib/format-id'

import type { Impact } from './types'

/** Before → change → after for stock, population or balances (UX-05). Labelled as a preview. */

defineProps<{ impacts: Impact[] }>()
</script>

<template>
  <div class="grid gap-2">
    <p class="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <AapmIcon name="info" :size="13" />
      Pratinjau — dihitung ulang server saat diposting.
    </p>
    <ul class="grid gap-2">
      <li v-for="i in impacts" :key="i.label" class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border px-3 py-2.5 sm:grid-cols-[minmax(0,1fr)_repeat(3,auto)]">
        <span class="text-sm font-medium">{{ i.label }}</span>
        <span class="hidden text-sm text-muted-foreground numeric sm:inline">{{ formatNumber(i.before) }}</span>
        <span class="hidden text-sm font-semibold numeric sm:inline" :class="i.change < 0 ? 'text-danger' : 'text-success'">
          {{ i.change > 0 ? '+' : '−' }}{{ formatNumber(Math.abs(i.change)) }}
        </span>
        <span class="text-right text-sm font-semibold numeric">
          <span class="sm:hidden text-muted-foreground">{{ formatNumber(i.before) }} → </span>{{ formatNumber(i.before + i.change) }} <span class="text-xs font-normal text-muted-foreground">{{ i.unit }}</span>
        </span>
      </li>
    </ul>
  </div>
</template>
