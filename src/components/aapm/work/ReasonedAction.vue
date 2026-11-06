<script setup lang="ts">
import type { ButtonVariants } from '@/components/ui/button'
import type { ActionAvailability } from '@/design-system/contracts'

import AapmIcon from '@/components/aapm/icon/AapmIcon.vue'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { wrapButtonClass } from './wrap'

/**
 * An action that can say why it is unavailable (Ecosystem action availability contract, ERP UX-06).
 * - disabled: stays focusable (aria-disabled, never the `disabled` attribute) so keyboard and
 *   screen-reader users reach the reason — shown in a tooltip on hover/focus and linked through
 *   aria-describedby. Activation is blocked.
 * - loading: spinner, keeps its width, blocked. done: check + note, blocked.
 * Business rules never live here: the consumer passes the availability it computed.
 */
const props = defineProps<{
  availability: ActionAvailability
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
}>()
const emit = defineEmits<{ activate: [] }>()

const state = computed(() => props.availability.state)
const reason = computed(() => (props.availability.state === 'disabled' ? props.availability.reason : ''))
const note = computed(() => (props.availability.state === 'done' ? props.availability.note : undefined))
const blocked = computed(() => state.value !== 'available')

const reasonId = useId()
const showReason = shallowRef(false)

const button = useTemplateRef<{ $el: HTMLElement }>('button')
const minWidth = shallowRef<string>()
// Measure before the DOM swaps to the spinner, so the loading button keeps its width.
watch(state, (next) => {
  minWidth.value = next === 'loading' ? `${button.value?.$el?.offsetWidth ?? 0}px` : undefined
}, { flush: 'pre' })

function activate(event: Event) {
  if (blocked.value) {
    event.preventDefault()
    event.stopImmediatePropagation()
    return
  }
  emit('activate')
}
function onKeydown(event: KeyboardEvent) {
  if (blocked.value && (event.key === 'Enter' || event.key === ' '))
    event.preventDefault()
}
</script>

<template>
  <TooltipProvider :delay-duration="150">
    <Tooltip :open="state === 'disabled' && showReason">
      <TooltipTrigger as-child>
        <Button
          ref="button"
          :variant="variant"
          :size="size"
          :data-availability="state"
          :aria-disabled="blocked ? 'true' : undefined"
          :aria-busy="state === 'loading' ? 'true' : undefined"
          :aria-describedby="state === 'disabled' ? reasonId : undefined"
          :style="minWidth ? { minWidth } : undefined"
          :class="[wrapButtonClass(size), blocked && 'cursor-not-allowed opacity-60']"
          @click="activate"
          @keydown="onKeydown"
          @focus="showReason = true"
          @blur="showReason = false"
          @mouseenter="showReason = true"
          @mouseleave="showReason = false"
        >
          <Spinner v-if="state === 'loading'" class="size-4" />
          <AapmIcon v-else-if="state === 'done'" name="success" :size="16" />
          <slot />
          <span v-if="note" class="text-muted-foreground">· {{ note }}</span>
          <span v-if="state === 'disabled'" :id="reasonId" class="sr-only">{{ reason }}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent v-if="state === 'disabled'" class="max-w-64 text-pretty">
        {{ reason }}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
