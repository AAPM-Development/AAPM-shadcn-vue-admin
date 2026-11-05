<script setup lang="ts">
import type { IconName } from './registry'

import { isActionName } from './animated/actions'
import AnimatedIcon from './animated/animated-icon.vue'
import { ICONS } from './registry'

const props = withDefaults(defineProps<{
  name: IconName
  /** Pixels when numeric; any CSS length when a string. Defaults to 1em via the glyph. */
  size?: number | string
  /** Accessible name. Omit for decorative icons next to visible text. */
  label?: string
  /** Animate by meaning when `name` is an action icon (see animated/actions.ts); otherwise ignored. */
  animate?: boolean
  /** With `animate`: plays on turning true (refresh loops, chevron stays open while true). */
  play?: boolean
}>(), {
  size: undefined,
  label: undefined,
  animate: false,
  play: false,
})

const component = computed(() => ICONS[props.name] ?? ICONS.info)
const dimension = computed(() => props.size === undefined ? undefined : String(props.size))
const actionName = computed(() => props.animate && isActionName(props.name) ? props.name : undefined)
</script>

<template>
  <AnimatedIcon
    v-if="actionName"
    :name="actionName"
    :play="play"
    :size="size"
    :label="label"
  />
  <component
    :is="component"
    v-else
    :width="dimension"
    :height="dimension"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
    focusable="false"
  />
</template>
