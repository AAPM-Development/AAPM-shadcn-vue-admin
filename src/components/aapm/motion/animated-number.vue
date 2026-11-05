<script setup lang="ts">
import { animate, useInView } from 'motion-v'

import { AAPM_EASE, prefersReducedMotion } from './easing'
import { blurDecay } from './motion-blur'

/**
 * Counts up to `value` once when it first scrolls into view (900ms, emphasis curve).
 * Screen readers get the final value only; reduced motion shows it immediately.
 */
const props = withDefaults(defineProps<{
  value: number
  format: (n: number) => string
  duration?: number
}>(), {
  duration: 0.9,
})

const root = useTemplateRef<HTMLElement>('root')
const inView = useInView(root, { once: true })
const shown = shallowRef(prefersReducedMotion() ? props.value : 0)
let controls: { stop: () => void } | undefined

function run(from: number, to: number) {
  controls?.stop()
  if (prefersReducedMotion()) {
    shown.value = to
    return
  }
  // Digits roll upward: a faint vertical motion blur, stepped down as the count slows.
  const cancelBlur = root.value ? blurDecay(root.value, 'y', 2, props.duration * 1000) : undefined
  controls = animate(from, to, {
    duration: props.duration,
    ease: AAPM_EASE.emphasis,
    onUpdate: v => (shown.value = v),
    onComplete: () => cancelBlur?.(),
  })
}

watch(inView, (visible) => {
  if (visible)
    run(shown.value, props.value)
})
watch(() => props.value, (next, prev) => {
  if (inView.value)
    run(prev ?? 0, next)
})
onBeforeUnmount(() => controls?.stop())
</script>

<template>
  <span ref="root" class="numeric">
    <span aria-hidden="true">{{ format(shown) }}</span>
    <span class="sr-only">{{ format(value) }}</span>
  </span>
</template>
