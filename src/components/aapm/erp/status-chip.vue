<script setup lang="ts">
import type { IconName } from '@/components/aapm/icon/registry'

import ToneChip from '@/components/aapm/tone/tone-chip.vue'
import { toneOf } from '@/components/aapm/tone/tones'

import type { DocStatus } from './types'

/**
 * Document lifecycle chip — text + icon, never colour alone (UX-02). Vocabulary is
 * deliberately distinct: draft ≠ submitted ≠ verified ≠ posted ≠ paid.
 */

const props = defineProps<{ status: DocStatus }>()

const MAP: Record<DocStatus, { label: string, icon: IconName }> = {
  draft: { label: 'Draft', icon: 'edit' },
  submitted: { label: 'Diajukan', icon: 'submit' },
  review: { label: 'Dalam review', icon: 'pending' },
  verified: { label: 'Terverifikasi', icon: 'verified' },
  posted: { label: 'Terposting', icon: 'success' },
  paid: { label: 'Lunas', icon: 'cash' },
  rejected: { label: 'Ditolak', icon: 'danger' },
  reversed: { label: 'Dibalik', icon: 'reverse' },
  locked: { label: 'Periode dikunci', icon: 'locked' },
}
const s = computed(() => MAP[props.status])
</script>

<template>
  <ToneChip :tone="toneOf('doc', status)" :icon="s.icon">
    {{ s.label }}
  </ToneChip>
</template>
