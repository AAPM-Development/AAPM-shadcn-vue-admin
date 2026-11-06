<script setup lang="ts">
import type { IconName } from '@/components/aapm/icon/registry'
import type { ActivityEntry, ActivityKind } from '@/design-system/contracts'

import AapmIcon from '@/components/aapm/icon/AapmIcon.vue'
import StateChip from '@/components/aapm/tone/state-chip.vue'
import { ACTIVITY_LABEL, ACTIVITY_STATE } from '@/design-system/contracts'
import { formatRelativeId } from '@/lib/format-id'

import RevisionDiff from './RevisionDiff.vue'

/**
 * Immutable activity / audit narrative (Ecosystem UI-DAT-017, ERP UX-06, PC11 lineage): actor, action,
 * reason, correctly-labelled time, state, evidence, inline revisions, source and correlation ID.
 * Read-only by construction: there are no edit or delete controls.
 */
const props = withDefaults(defineProps<{
  entries: ActivityEntry[]
  terminal?: string
  filter?: ActivityKind[]
  label?: string
  /** Show the semantic state chip per entry (off for the compact ApprovalTimeline preset). */
  showState?: boolean
}>(), { terminal: undefined, filter: undefined, label: 'Riwayat aktivitas', showState: true })

const META: Record<ActivityKind, { icon: IconName, dot: string }> = {
  created: { icon: 'add', dot: 'bg-muted-foreground' },
  submitted: { icon: 'submit', dot: 'bg-info-fill' },
  returned: { icon: 'reopen', dot: 'bg-warning-fill' },
  approved: { icon: 'approve', dot: 'bg-success-fill' },
  rejected: { icon: 'reject', dot: 'bg-danger-fill' },
  posted: { icon: 'success', dot: 'bg-success-fill' },
  reversed: { icon: 'reverse', dot: 'bg-muted-foreground' },
  commented: { icon: 'comment', dot: 'bg-muted-foreground' },
  corrected: { icon: 'corrected', dot: 'bg-info-fill' },
  reopened: { icon: 'reopen', dot: 'bg-warning-fill' },
  delegated: { icon: 'userCheck', dot: 'bg-info-fill' },
  progress: { icon: 'inProgress', dot: 'bg-info-fill' },
}
const shown = computed(() => (props.filter ? props.entries.filter(e => props.filter!.includes(e.kind)) : props.entries))
const stateOf = (e: ActivityEntry) => e.state ?? ACTIVITY_STATE[e.kind]
const when = (at: ActivityEntry['at']) => (typeof at === 'string' ? at : formatRelativeId(at))
const absolute = (at: ActivityEntry['at']) => (typeof at === 'string' ? undefined : `${new Date(at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'short' })} WIB`)
</script>

<template>
  <ol v-if="shown.length || terminal" class="relative grid gap-5 pl-6" :aria-label="label">
    <span class="absolute inset-y-1 left-[7px] w-px bg-border" aria-hidden="true" />
    <li v-for="e in shown" :key="e.id" data-activity class="relative grid min-w-0 gap-1">
      <span class="absolute -left-6 top-1 flex size-[15px] items-center justify-center rounded-full bg-background ring-2 ring-background">
        <span class="size-2.5 rounded-full" :class="META[e.kind].dot" />
      </span>
      <p class="flex flex-wrap items-center gap-x-1.5 text-sm">
        <AapmIcon :name="META[e.kind].icon" :size="14" class="text-muted-foreground" />
        <span class="font-semibold">{{ e.actor }}</span>
        <span v-if="e.role" class="text-muted-foreground">· {{ e.role }}</span>
        <span>{{ ACTIVITY_LABEL[e.kind].toLowerCase() }}</span>
        <StateChip v-if="showState && stateOf(e)" :state="stateOf(e)!" class="ms-1" />
      </p>
      <p class="text-xs text-muted-foreground numeric">
        <time :title="absolute(e.at)">{{ when(e.at) }}</time><template v-if="e.attachments">
          · {{ e.attachments }} lampiran
        </template>
      </p>
      <p v-if="e.reason" class="rounded-md bg-muted px-2.5 py-1.5 text-sm text-pretty">
        “{{ e.reason }}”
      </p>
      <RevisionDiff v-if="e.revisions?.length" :revisions="e.revisions" compact class="mt-1" />
      <p v-if="e.source || e.correlationId" class="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
        <span v-if="e.source">{{ e.source.label }}: <span class="font-mono">{{ e.source.ref }}</span></span>
        <span v-if="e.correlationId">Korelasi: <span class="font-mono">{{ e.correlationId }}</span></span>
      </p>
    </li>
    <li v-if="terminal" class="relative text-xs font-semibold text-success">
      <span class="absolute -left-6 top-0.5 flex size-[15px] items-center justify-center rounded-full bg-success-soft">
        <AapmIcon name="locked" :size="10" />
      </span>
      {{ terminal }}
    </li>
  </ol>
  <p v-else class="text-sm text-muted-foreground">
    Belum ada aktivitas.
  </p>
</template>
