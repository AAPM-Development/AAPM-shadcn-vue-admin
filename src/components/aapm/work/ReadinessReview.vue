<script setup lang="ts">
import type { ActionAvailability, ActionRef, Readiness } from '@/design-system/contracts'

import AapmIcon from '@/components/aapm/icon/AapmIcon.vue'
import StateChip from '@/components/aapm/tone/state-chip.vue'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { READINESS_LABEL, READINESS_STATE } from '@/design-system/contracts'
import { formatRelativeId } from '@/lib/format-id'

import BlockerList from './BlockerList.vue'
import ReasonedAction from './ReasonedAction.vue'

/**
 * Readiness / eligibility / blocker review (Ecosystem UI-WRK-READINESS). The result and blockers are
 * computed by the consumer/server; this explains them and offers the resolution path. The next
 * action is available only when the result is `ready`; otherwise it says what blocks it.
 */
const props = defineProps<{ readiness: Readiness }>()
const emit = defineEmits<{ open: [source: ActionRef], next: [action: ActionRef] }>()

const label = computed(() => {
  const { result, blockers } = props.readiness
  return result === 'blocked' && blockers.length ? `${READINESS_LABEL.blocked} (${blockers.length})` : READINESS_LABEL[result]
})
const nextAvailability = computed<ActionAvailability>(() => {
  const { result, blockers } = props.readiness
  if (result === 'ready')
    return { state: 'available' }
  return { state: 'disabled', reason: blockers[0]?.title ?? `Status kesiapan: ${READINESS_LABEL[result]}` }
})
const evaluated = computed(() => (props.readiness.evaluatedAt === undefined ? null : formatRelativeId(props.readiness.evaluatedAt)))
</script>

<template>
  <section class="grid min-w-0 gap-3" :aria-label="`Kesiapan: ${readiness.subject}`">
    <header class="flex min-w-0 flex-wrap items-center justify-between gap-2">
      <div class="grid min-w-0 gap-0.5 wrap-anywhere">
        <p class="text-sm font-semibold">
          {{ readiness.subject }}
        </p>
        <p v-if="evaluated" class="text-xs text-muted-foreground">
          Dievaluasi {{ evaluated }}
        </p>
      </div>
      <span role="status" class="flex min-w-0 flex-wrap items-center gap-2">
        <StateChip :state="READINESS_STATE[readiness.result]" size="md" />
        <span class="min-w-0 text-sm font-medium wrap-anywhere">{{ label }}</span>
      </span>
    </header>

    <BlockerList :blockers="readiness.blockers" @open="emit('open', $event)" />

    <Collapsible v-if="readiness.satisfied?.length">
      <CollapsibleTrigger class="inline-flex max-w-full items-center gap-1.5 rounded-md text-left wrap-anywhere text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
        <AapmIcon name="success" :size="14" />
        Syarat terpenuhi ({{ readiness.satisfied.length }})
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul class="mt-2 grid gap-1 ps-5 text-sm text-muted-foreground">
          <li v-for="s in readiness.satisfied" :key="s" class="list-disc wrap-anywhere">
            {{ s }}
          </li>
        </ul>
      </CollapsibleContent>
    </Collapsible>

    <div v-if="readiness.next">
      <ReasonedAction :availability="nextAvailability" @activate="emit('next', readiness.next)">
        {{ readiness.next.label }}
      </ReasonedAction>
    </div>
  </section>
</template>
