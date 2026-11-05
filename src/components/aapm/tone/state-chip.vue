<script setup lang="ts">
import type { SemanticState } from '@/design-system/states'

import { isSemanticState, stateMeta } from '@/design-system/states'

import ToneChip from './tone-chip.vue'

/**
 * A semantic state as a chip: tone, icon and id-ID label all come from the vocabulary
 * (src/design-system/states.ts). A state outside the vocabulary — API drift — renders as a
 * neutral chip with its raw text (or "Tidak diketahui" when empty) — never blank, never a guessed colour.
 */
const props = withDefaults(defineProps<{
  state: SemanticState
  size?: 'sm' | 'md'
  variant?: 'soft' | 'outline' | 'solid'
}>(), { size: 'sm', variant: 'soft' })

const meta = computed(() => (isSemanticState(props.state) ? stateMeta(props.state) : null))
</script>

<template>
  <ToneChip :data-semantic-state="state" :tone="meta?.tone ?? 'neutral'" :icon="meta?.icon" :size="size" :variant="variant">
    {{ meta?.label ?? (state || 'Tidak diketahui') }}
  </ToneChip>
</template>
