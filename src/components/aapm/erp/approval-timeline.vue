<script setup lang="ts">
import type { ActivityEntry } from '@/design-system/contracts'

import ActivityFeed from '@/components/aapm/work/ActivityFeed.vue'

import type { TimelineEvent } from './types'

/** ERP ApprovalTimeline (UX-06): a compact preset over ActivityFeed, with the same props and rendered text. */
const props = defineProps<{ events: TimelineEvent[], terminal?: string }>()
const entries = computed<ActivityEntry[]>(() => props.events.map(({ action, ...e }) => ({ ...e, kind: action })))
</script>

<template>
  <ActivityFeed :entries="entries" :terminal="terminal" label="Riwayat persetujuan" :show-state="false" />
</template>
