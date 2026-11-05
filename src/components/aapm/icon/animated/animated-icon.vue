<script setup lang="ts">
import { useCurrentElement, useEventListener } from '@vueuse/core'

import { prefersReducedMotion } from '@/components/aapm/motion/easing'

import type { ActionName } from './actions'

import { ICONS } from '../registry'
import { ANIMATED_ACTIONS, COPY_CHECK_MS, COPY_SWAP_MS } from './actions'

/**
 * Action icon whose Lucide parts animate by meaning (motion in assets/motion/icons.css).
 * The root is the Lucide <svg> itself, so class / style / size behave exactly like AapmIcon.
 * Plays on `play` turning true, or from the nearest button: pointerdown or keyboard click
 * (press), pointerenter / pointerleave (hover pose). Reduced motion: nothing moves, but copy
 * still swaps to its check and an open chevron still points up.
 */
const props = withDefaults(defineProps<{
  name: ActionName
  /** Plays on turning true. `refresh` keeps spinning while it stays true; `chevronDown` stays open. */
  play?: boolean
  /** Pixels when numeric; any CSS length when a string. */
  size?: number | string
  /** Accessible name. Omit for decorative icons next to visible text. */
  label?: string
}>(), {
  play: false,
  size: undefined,
  label: undefined,
})

/** Safety net when an animation never reports its end (hidden element, interrupted style). */
const FALLBACK_MS = 1000

const action = computed(() => ANIMATED_ACTIONS[props.name])
const playing = shallowRef(false)
const looping = shallowRef(false)
const hovered = shallowRef(false)
/** Copy only: the glyph is temporarily the approve check. */
const swapped = shallowRef(false)

const icon = computed(() => ICONS[swapped.value ? 'approve' : action.value.icon])
const dimension = computed(() => props.size === undefined ? undefined : String(props.size))
/** Delete tear: two copies of the bin, each clipped to one half by its own nested viewport. */
const tearing = computed(() => props.name === 'delete' && playing.value)

let fallbackTimer: ReturnType<typeof setTimeout> | undefined
let swapTimer: ReturnType<typeof setTimeout> | undefined
let revertTimer: ReturnType<typeof setTimeout> | undefined

function stop() {
  clearTimeout(fallbackTimer)
  playing.value = false
  looping.value = false
}

function armRevert() {
  clearTimeout(revertTimer)
  revertTimer = setTimeout(() => {
    swapped.value = false
  }, COPY_CHECK_MS)
}

function showCheck() {
  swapTimer = undefined
  // The copy glyph is replaced, so its animationend never arrives.
  stop()
  swapped.value = true
  armRevert()
}

/** Returns false when the check is already showing: it is extended instead of replaying the slide. */
function queueCheck(reduce: boolean) {
  if (swapped.value) {
    armRevert()
    return false
  }
  if (swapTimer === undefined)
    swapTimer = setTimeout(showCheck, reduce ? 0 : COPY_SWAP_MS)
  return true
}

function start() {
  const reduce = prefersReducedMotion()
  if (props.name === 'copy' && !queueCheck(reduce))
    return
  if (reduce)
    return
  const loop = Boolean(action.value.loop && props.play)
  if (playing.value) {
    // A press spin becomes the loading loop when `play` turns true mid-turn.
    if (loop) {
      clearTimeout(fallbackTimer)
      looping.value = true
    }
    return
  }
  playing.value = true
  looping.value = loop
  if (!loop)
    fallbackTimer = setTimeout(stop, FALLBACK_MS)
}

function onEnd(event: AnimationEvent) {
  if (event.animationName === action.value.keyframes)
    stop()
}

function onIteration(event: AnimationEvent) {
  // A loop only stops on a full turn, so it never snaps back mid-rotation.
  if (event.animationName === action.value.keyframes && !props.play)
    stop()
}

watch(() => props.play, (on) => {
  if (on)
    start()
  else if (props.name === 'chevronDown')
    stop()
})

onMounted(() => {
  // A loading refresh mounted mid-load spins straight away; one-shots never play on mount.
  if (props.play && action.value.loop)
    start()
})

onBeforeUnmount(() => {
  clearTimeout(fallbackTimer)
  clearTimeout(swapTimer)
  clearTimeout(revertTimer)
})

const el = useCurrentElement()
const host = computed(() => {
  const node = el.value
  if (!(node instanceof Element))
    return undefined
  return node.closest<HTMLElement>('button, [role="button"]') ?? node
})

function disabled() {
  return host.value?.matches(':disabled, [aria-disabled="true"], [data-disabled]') ?? false
}

function press() {
  if (action.value.trigger === 'press' && !disabled())
    start()
}

useEventListener(host, 'pointerdown', (event: PointerEvent) => {
  if (event.button === 0)
    press()
})
// Keyboard activation (Enter / Space) clicks without a pointerdown; detail is 0 for those.
useEventListener(host, 'click', (event: MouseEvent) => {
  if (event.detail === 0)
    press()
})
useEventListener(host, 'pointerenter', () => {
  if (action.value.trigger === 'hover')
    hovered.value = true
})
useEventListener(host, 'pointerleave', () => {
  hovered.value = false
})
</script>

<template>
  <component
    :is="icon"
    :data-action="name"
    :data-playing="String(playing)"
    :data-loop="looping ? 'true' : undefined"
    :data-hover="hovered ? 'true' : undefined"
    :data-open="name === 'chevronDown' ? String(play) : undefined"
    :data-swapped="swapped ? 'true' : undefined"
    :width="dimension"
    :height="dimension"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
    focusable="false"
    @animationend="onEnd"
    @animationcancel="onEnd"
    @animationiteration="onIteration"
  >
    <template v-if="tearing">
      <g data-part="tear-left">
        <component :is="icon" x="0" y="0" width="12" height="24" viewBox="0 0 12 24" aria-hidden="true" />
      </g>
      <g data-part="tear-right">
        <component :is="icon" x="12" y="0" width="12" height="24" viewBox="12 0 12 24" aria-hidden="true" />
      </g>
    </template>
  </component>
</template>
