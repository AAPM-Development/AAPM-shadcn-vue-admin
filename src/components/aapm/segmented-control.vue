<script setup lang="ts" generic="T extends string">
import { Motion } from 'motion-v'

import type { IconName } from './icon/registry'

import AapmIcon from './icon/AapmIcon.vue'
import { AAPM_EASE } from './motion/easing'

/**
 * Segmented control (v2): a pill track with one sliding card indicator. Options may carry an
 * icon; `iconOnly` keeps the label for screen readers and the tooltip, so two controls fit one row
 * on a phone. `block` stretches the segments to equal widths across the container.
 */
withDefaults(defineProps<{
  options: { value: T, label: string, icon?: IconName }[]
  label: string
  iconOnly?: boolean
  block?: boolean
}>(), {
  iconOnly: false,
  block: false,
})

const model = defineModel<T>({ required: true })
/** Unique per instance so two controls on one page never share the sliding pill. */
const pillId = `segment-${useId()}`
</script>

<template>
  <div
    role="radiogroup" :aria-label="label" data-slot="segmented-control"
    class="items-center gap-0.5 rounded-full bg-muted p-1 shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--foreground)_6%,transparent)]"
    :class="block ? 'grid auto-cols-fr grid-flow-col' : 'inline-flex'"
  >
    <button
      v-for="option in options" :key="option.value"
      type="button" role="radio" :aria-checked="model === option.value"
      :title="iconOnly ? option.label : undefined"
      class="relative inline-flex min-h-8 items-center justify-center gap-1.5 rounded-full text-xs font-semibold text-muted-foreground outline-none transition-colors duration-150 ease-aapm hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring aria-checked:text-foreground pointer-coarse:min-h-10"
      :class="iconOnly ? 'min-w-8 px-2' : 'px-3'"
      @click="model = option.value"
    >
      <Motion
        v-if="model === option.value"
        :layout-id="pillId"
        class="absolute inset-0 rounded-full bg-card shadow-[0_1px_2px_rgb(0_0_0/0.08),0_0_0_1px_color-mix(in_oklab,var(--foreground)_8%,transparent)]"
        :transition="{ duration: 0.32, ease: AAPM_EASE.emphasis }"
        aria-hidden="true"
      />
      <AapmIcon v-if="option.icon" :name="option.icon" :size="15" class="relative" />
      <span :class="iconOnly ? 'sr-only' : 'relative'">{{ option.label }}</span>
    </button>
  </div>
</template>
