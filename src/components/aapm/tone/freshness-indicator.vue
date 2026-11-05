<script setup lang="ts">
import type { IconName } from '@/components/aapm/icon/registry'
import type { Tone } from '@/components/aapm/tone/tones'

import AapmIcon from '@/components/aapm/icon/AapmIcon.vue'
import { Button } from '@/components/ui/button'
import { isSemanticState, stateMeta } from '@/design-system/states'
import { formatRelativeId } from '@/lib/format-id'

import ToneChip from './tone-chip.vue'

/**
 * Freshness / connectivity of a data region (Ecosystem §17): state chip + "Terakhir diperbarui <relative>".
 * - The relative time ticks every 30 s while mounted (unless a `now` is injected), and is left out
 *   when `since` is unknown — the component never claims a freshness nobody knows.
 * - Only the state is a live region; the ticking time and the retry button are not announced.
 * - Syncing spins its icon (stopped under reduced motion); a failed sync offers "Coba lagi",
 *   described by the state so several retries on one page stay distinguishable.
 * - A state outside the vocabulary renders neutral with its raw text, never blank.
 */
const props = defineProps<{
  state: 'current' | 'stale' | 'offline' | 'syncing' | 'sync_failed'
  since?: Date | number
  /** Injected clock for tests and snapshots; when absent the component keeps its own. */
  now?: Date | number
}>()
const emit = defineEmits<{ retry: [] }>()

const meta = computed<{ tone: Tone, icon: IconName, label: string }>(() => {
  const key = `freshness.${props.state}`
  return isSemanticState(key) ? stateMeta(key) : { tone: 'neutral', icon: 'info', label: props.state || 'Tidak diketahui' }
})

const clock = shallowRef(Date.now())
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  if (props.now === undefined)
    timer = setInterval(() => (clock.value = Date.now()), 30_000)
})
onBeforeUnmount(() => clearInterval(timer))
const relative = computed(() => (props.since === undefined ? null : formatRelativeId(props.since, props.now ?? clock.value)))

const labelId = useId()
const StateIcon = () => h(AapmIcon, { 'name': meta.value.icon, 'size': 13, 'data-loading': props.state === 'syncing' ? 'true' : undefined })
</script>

<template>
  <span data-slot="freshness" :data-freshness="state" class="inline-flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs">
    <span role="status">
      <ToneChip :id="labelId" :tone="meta.tone" :icon="StateIcon">{{ meta.label }}</ToneChip>
    </span>
    <span v-if="relative" class="text-muted-foreground">Terakhir diperbarui {{ relative }}</span>
    <Button v-if="state === 'sync_failed'" size="xs" variant="outline" :aria-describedby="labelId" @click="emit('retry')">Coba lagi</Button>
  </span>
</template>
