<script setup lang="ts">
import { animate } from 'motion-v'

import { AAPM_EASE, prefersReducedMotion } from './easing'

/**
 * Animates its own height whenever the slotted content grows or shrinks, so content below
 * shifts smoothly instead of jumping. At rest the height is `auto`; `overflow: hidden` is only
 * set while a resize animates, so focus rings and shadows are not clipped otherwise.
 * A width change (viewport / layout resize) snaps instead of animating. Reduced motion: no-op.
 */
const props = withDefaults(defineProps<{
  /** Animation length in milliseconds. */
  duration?: number
}>(), {
  duration: 320,
})

const root = useTemplateRef<HTMLElement>('root')
const content = useTemplateRef<HTMLElement>('content')

let lastHeight = 0
let lastWidth = 0
let run: ReturnType<typeof animate> | undefined
let observer: ResizeObserver | undefined

function settle() {
  run = undefined
  const el = root.value
  if (!el)
    return
  el.style.height = ''
  el.style.overflow = ''
}

function stop() {
  const current = run
  run = undefined
  current?.stop()
}

function onResize() {
  const el = root.value
  const inner = content.value
  if (!el || !inner)
    return

  const height = inner.offsetHeight
  const width = inner.offsetWidth
  // Mid-animation the root carries an inline height: start from what is on screen now.
  const from = run ? el.offsetHeight : lastHeight
  const widthChanged = width !== lastWidth
  lastHeight = height
  lastWidth = width

  if (from === height && !run)
    return

  stop()
  if (widthChanged || from === height || prefersReducedMotion()) {
    settle()
    return
  }

  // Pin the old height synchronously: the ResizeObserver callback runs before paint, so the
  // new height never flashes for a frame before the animation takes over.
  el.style.height = `${from}px`
  el.style.overflow = 'hidden'
  const controls = animate(el, { height: [`${from}px`, `${height}px`] }, {
    duration: props.duration / 1000,
    ease: AAPM_EASE.emphasis,
  })
  run = controls
  controls.then(() => {
    // A newer resize may have replaced this run; only the latest one returns to auto.
    if (run === controls)
      settle()
  })
}

onMounted(() => {
  const inner = content.value
  if (!inner || typeof ResizeObserver === 'undefined')
    return
  lastHeight = inner.offsetHeight
  lastWidth = inner.offsetWidth
  observer = new ResizeObserver(onResize)
  observer.observe(inner)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  stop()
})
</script>

<template>
  <div ref="root" data-slot="auto-height">
    <div ref="content" class="flow-root">
      <slot />
    </div>
  </div>
</template>
