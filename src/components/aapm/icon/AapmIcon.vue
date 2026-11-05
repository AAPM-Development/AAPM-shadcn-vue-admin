<script setup lang="ts">
import type { IconName } from './registry'

import { ICONS } from './registry'

const props = withDefaults(defineProps<{
  name: IconName
  /** Pixels when numeric; any CSS length when a string. Defaults to 1em via the glyph. */
  size?: number | string
  /** Accessible name. Omit for decorative icons next to visible text. */
  label?: string
}>(), {
  size: undefined,
  label: undefined,
})

const component = computed(() => ICONS[props.name] ?? ICONS.info)
const dimension = computed(() => props.size === undefined ? undefined : String(props.size))
</script>

<template>
  <component
    :is="component"
    :width="dimension"
    :height="dimension"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
    focusable="false"
  />
</template>
