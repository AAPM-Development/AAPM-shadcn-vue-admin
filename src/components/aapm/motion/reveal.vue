<script setup lang="ts">
import { useInView } from 'motion-v'

import { enterWithMotionBlur, hideForEnter } from './motion-blur'

/**
 * Scroll-entry: 14px rise + fade, once, when the block enters the viewport (no blur —
 * content entrance stays crisp). Transform/opacity only; reduced motion shows content at rest.
 */
const props = withDefaults(defineProps<{
  as?: string
  /** Position in a sequence — staggers by 60ms per step. */
  index?: number
  distance?: number
}>(), {
  as: 'div',
  index: 0,
  distance: 14,
})

const el = useTemplateRef<HTMLElement>('el')
const inView = useInView(el, { once: true, margin: '0px 0px -6% 0px' })

onMounted(() => {
  if (el.value)
    hideForEnter(el.value, props.distance)
})

watch(inView, (visible) => {
  if (visible && el.value)
    enterWithMotionBlur(el.value, { distance: props.distance, blur: 0, delay: props.index * 0.06 })
})
</script>

<template>
  <component :is="as" ref="el">
    <slot />
  </component>
</template>
