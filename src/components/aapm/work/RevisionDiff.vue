<script setup lang="ts">
import type { Revision } from '@/design-system/contracts'

import AapmIcon from '@/components/aapm/icon/AapmIcon.vue'
import StateChip from '@/components/aapm/tone/state-chip.vue'
import { formatRelativeId } from '@/lib/format-id'

/**
 * Revision / change summary (Ecosystem revision minimum contract): field, before → after, reason,
 * actor, time, evidence, optional state change. Read-only: corrections are made elsewhere.
 * `compact` hides the per-change actor/time when the surrounding view already shows them.
 */
withDefaults(defineProps<{ revisions: Revision[], compact?: boolean }>(), { compact: false })
const absolute = (at: Date | number) => `${new Date(at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'short' })} WIB`
</script>

<template>
  <ul class="grid gap-2" aria-label="Perubahan">
    <li v-for="(r, i) in revisions" :key="`${r.field}-${i}`" class="grid min-w-0 gap-1.5 rounded-lg border p-3 text-sm">
      <span class="text-xs text-muted-foreground wrap-anywhere">{{ r.field }}</span>
      <span class="flex flex-wrap items-center gap-2">
        <del class="rounded bg-danger-soft px-1.5 text-danger decoration-danger/50 numeric">{{ r.before }}</del>
        <AapmIcon name="chevronRight" :size="14" class="text-muted-foreground" />
        <ins class="rounded bg-success-soft px-1.5 text-success no-underline numeric">{{ r.after }}</ins>
      </span>
      <span v-if="r.stateBefore && r.stateAfter" class="flex flex-wrap items-center gap-1.5">
        <StateChip :state="r.stateBefore" />
        <AapmIcon name="chevronRight" :size="12" class="text-muted-foreground" />
        <StateChip :state="r.stateAfter" />
      </span>
      <p v-if="r.reason" class="text-pretty">
        <span class="text-muted-foreground">Alasan:</span> {{ r.reason }}
      </p>
      <p v-if="!compact" class="text-xs text-muted-foreground">
        {{ r.actor }} · <time :datetime="new Date(r.at).toISOString()" :title="absolute(r.at)">{{ formatRelativeId(r.at) }}</time>
      </p>
      <ul v-if="r.evidence?.length" class="flex flex-wrap gap-2 text-xs">
        <li v-for="e in r.evidence" :key="e.label">
          <a v-if="e.href" :href="e.href" class="inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline"><AapmIcon name="attach" :size="12" />{{ e.label }}</a>
          <span v-else class="inline-flex items-center gap-1"><AapmIcon name="attach" :size="12" />{{ e.label }}</span>
        </li>
      </ul>
    </li>
  </ul>
</template>
