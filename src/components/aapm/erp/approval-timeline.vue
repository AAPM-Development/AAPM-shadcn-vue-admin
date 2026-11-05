<script setup lang="ts">
import type { IconName } from '@/components/aapm/icon/registry'

import AapmIcon from '@/components/aapm/icon/AapmIcon.vue'

import type { TimelineEvent } from './types'

/** ERP ApprovalTimeline: actor, action, reason, correctly-labelled time, terminal state (UX-06). */

defineProps<{ events: TimelineEvent[], terminal?: string }>()

const META: Record<TimelineEvent['action'], { label: string, icon: IconName, dot: string }> = {
  created: { label: 'Membuat draft', icon: 'add', dot: 'bg-muted-foreground' },
  submitted: { label: 'Mengajukan', icon: 'submit', dot: 'bg-info-fill' },
  returned: { label: 'Mengembalikan untuk revisi', icon: 'reopen', dot: 'bg-warning-fill' },
  approved: { label: 'Menyetujui', icon: 'approve', dot: 'bg-success-fill' },
  rejected: { label: 'Menolak', icon: 'reject', dot: 'bg-danger-fill' },
  posted: { label: 'Memposting', icon: 'success', dot: 'bg-success-fill' },
  reversed: { label: 'Membalik dokumen', icon: 'reverse', dot: 'bg-muted-foreground' },
  commented: { label: 'Memberi catatan', icon: 'comment', dot: 'bg-muted-foreground' },
}
</script>

<template>
  <ol class="relative grid gap-5 pl-6" aria-label="Riwayat persetujuan">
    <span class="absolute inset-y-1 left-[7px] w-px bg-border" aria-hidden="true" />
    <li v-for="e in events" :key="e.id" class="relative grid gap-1">
      <span class="absolute -left-6 top-1 flex size-[15px] items-center justify-center rounded-full bg-background ring-2 ring-background">
        <span class="size-2.5 rounded-full" :class="META[e.action].dot" />
      </span>
      <p class="flex flex-wrap items-center gap-x-1.5 text-sm">
        <AapmIcon :name="META[e.action].icon" :size="14" class="text-muted-foreground" />
        <span class="font-semibold">{{ e.actor }}</span>
        <span class="text-muted-foreground">· {{ e.role }}</span>
        <span>{{ META[e.action].label.toLowerCase() }}</span>
      </p>
      <p class="text-xs text-muted-foreground numeric">
        {{ e.at }}<template v-if="e.attachments">
          · {{ e.attachments }} lampiran
        </template>
      </p>
      <p v-if="e.reason" class="rounded-md bg-muted px-2.5 py-1.5 text-sm text-pretty">
        “{{ e.reason }}”
      </p>
    </li>
    <li v-if="terminal" class="relative text-xs font-semibold text-success">
      <span class="absolute -left-6 top-0.5 flex size-[15px] items-center justify-center rounded-full bg-success-soft">
        <AapmIcon name="locked" :size="10" />
      </span>
      {{ terminal }}
    </li>
  </ol>
</template>
