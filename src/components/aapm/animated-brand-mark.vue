<script setup lang="ts">
import { useColorMode, useDocumentVisibility, useElementVisibility, useMediaQuery } from '@vueuse/core'

import type { Pose, Track } from './brand/hatch-timeline'
import type { LockupVariant } from './brand/logo-geometry'

import horizontalWhite from '../../../public/brand/aapm-cloud-erp-horizontal-white.svg?raw'
import horizontal from '../../../public/brand/aapm-cloud-erp-horizontal.svg?raw'
import stackedWhite from '../../../public/brand/aapm-cloud-erp-stacked-white.svg?raw'
import stacked from '../../../public/brand/aapm-cloud-erp-stacked.svg?raw'
import { buildLockupMarkup } from './brand/brand-markup'
import { hatchTimeline } from './brand/hatch-timeline'

/**
 * The official AAPM Cloud ERP lockup, animated with the "Menetas" choreography
 * (brand/hatch-timeline.ts). Each track becomes one infinite Web Animation on the part it
 * names, so every part shares a single 24s clock. Reduced motion, `paused`, a hidden tab
 * or an off-screen logo stop the clock; the static render is always the master artwork.
 */
const props = withDefaults(defineProps<{
  variant?: LockupVariant
  onDark?: boolean
  label?: string
  paused?: boolean
}>(), { variant: 'erp', onDark: false, label: 'AAPM Cloud ERP', paused: false })

const mode = useColorMode()
const root = useTemplateRef<HTMLElement>('root')
const visible = useElementVisibility(root)
const documentVisibility = useDocumentVisibility()
const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
const prefix = `aapm-logo-${useId().replace(/[^a-z0-9]/gi, '')}`
const white = computed(() => props.onDark || mode.value === 'dark')
const path = computed(() => `/brand/aapm-cloud-erp-${props.variant === 'erp' ? 'horizontal' : 'stacked'}${white.value ? '-white' : ''}.svg`)
const markup = computed(() => {
  const master = props.variant === 'erp' ? (white.value ? horizontalWhite : horizontal) : (white.value ? stackedWhite : stacked)
  return buildLockupMarkup(master, props.variant, prefix)
})

const SELECTOR: Record<Track['kind'], (i?: number) => string> = {
  'travel-x': () => '[data-logo-travel-x]',
  'travel-y': () => '[data-logo-travel-y]',
  'breath': () => '[data-logo-breath]',
  'sweep': () => '[data-logo-sweep]',
  'head': () => '[data-logo-head]',
  'nod': () => '[data-logo-nod]',
  'letter': i => `[data-logo-letter="${i}"]`,
  'glyph': i => `[data-logo-glyph="${i}"]`,
  'light': () => '[data-brand-light]',
}

function keyframes(track: Track, cycle: number): Keyframe[] {
  const keys = new Set(track.frames.flatMap(f => Object.keys(f.pose))) as Set<keyof Pose>
  const moves = ['x', 'y', 'scale', 'rotate'].some(k => keys.has(k as keyof Pose))
  return track.frames.map(({ at, pose, ease }) => {
    const frame: Keyframe = { offset: at / cycle, easing: ease ?? 'linear' }
    if (moves)
      frame.transform = `translate(${pose.x ?? 0}${track.unit}, ${pose.y ?? 0}${track.unit}) rotate(${pose.rotate ?? 0}deg) scale(${pose.scale ?? 1})`
    if (keys.has('opacity'))
      frame.opacity = pose.opacity ?? 1
    if (keys.has('dash'))
      frame.strokeDashoffset = String(pose.dash ?? 0)
    return frame
  })
}

let animations: Animation[] = []
function stop() {
  animations.forEach(a => a.cancel())
  animations = []
}
function sync() {
  const run = !props.paused && documentVisibility.value !== 'hidden' && visible.value
  animations.forEach(a => (run ? a.play() : a.pause()))
}
async function compose() {
  stop()
  await nextTick()
  const host = root.value
  if (!host || reduced.value)
    return
  const timeline = hatchTimeline(props.variant)
  for (const track of timeline.tracks) {
    const target = host.querySelector<Element>(SELECTOR[track.kind](track.index))
    if (!target || typeof target.animate !== 'function')
      continue
    animations.push(target.animate(keyframes(track, timeline.cycle), { duration: timeline.cycle, iterations: Infinity, fill: 'both' }))
  }
  sync()
}

onMounted(compose)
watch([markup, reduced], compose, { flush: 'post' })
watch(() => [props.paused, documentVisibility.value, visible.value], sync)
onBeforeUnmount(stop)
</script>

<template>
  <span
    ref="root" data-aapm-animated-brand role="img" :aria-label="label" :data-on-dark="white || undefined"
    class="aapm-animated-brand relative inline-grid shrink-0"
    :style="{ '--brand-aspect': variant === 'erp' ? '114.13 / 40.2' : '70.14 / 28.76', '--brand-mask': `url('${path}')` }"
  >
    <!-- Trusted, versioned master SVG; brand-markup.ts only tags and wraps its paths. -->
    <span class="aapm-brand-vector block h-full w-full" v-html="markup" />
    <span class="aapm-brand-gloss pointer-events-none absolute inset-0" aria-hidden="true"><span data-brand-light class="absolute inset-[-25%]" /></span>
  </span>
</template>

<style scoped>
.aapm-animated-brand {
  aspect-ratio: var(--brand-aspect);
}
.aapm-brand-vector :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}
.aapm-brand-gloss {
  mask: var(--brand-mask) center / contain no-repeat;
  overflow: hidden;
}
[data-brand-light] {
  opacity: 0;
  background: linear-gradient(110deg, transparent 35%, rgb(255 255 255 / 75%) 48%, transparent 60%);
}
/* White artwork: a white pass would vanish, so the glint takes the brand lime instead. */
[data-on-dark] [data-brand-light] {
  background: linear-gradient(
    110deg,
    transparent 38%,
    color-mix(in oklab, var(--highlight) 80%, transparent) 50%,
    transparent 62%
  );
}
</style>
