<script setup lang="ts">
import { useElementBounding, useWindowSize } from '@vueuse/core'

const props = defineProps<{
  /** Anchor point in px, relative to the nearest positioned ancestor. */
  x: number
  y: number
  visible: boolean
}>()

const tip = useTemplateRef<HTMLElement>('tip')
const { width, height } = useElementBounding(tip)
const { width: viewportWidth } = useWindowSize()
const placement = computed(() => {
  const parent = tip.value?.offsetParent?.getBoundingClientRect()
  const half = width.value / 2
  const left = Math.min(viewportWidth.value - 8 - (parent?.left ?? 0) - half, Math.max(8 - (parent?.left ?? 0) + half, props.x))
  const below = (parent?.top ?? 0) + props.y - height.value - 10 < 8
  return { left: `${left}px`, top: `${props.y + (below ? 14 : -10)}px`, translate: `-50% ${below ? '0' : '-100%'}` }
})
</script>

<template>
  <Transition
    enter-active-class="transition-[opacity,transform] duration-150 ease-aapm"
    leave-active-class="transition-opacity duration-100 ease-aapm"
    enter-from-class="opacity-0 translate-y-1"
    leave-to-class="opacity-0"
  >
    <div
      v-if="visible"
      ref="tip"
      role="status"
      data-aapm-chart-tooltip
      class="pointer-events-none absolute z-10 w-max min-w-28 max-w-[min(15rem,calc(100vw-1rem))] rounded-lg border bg-(--chart-tooltip-bg) px-2.5 py-1.5 text-xs text-popover-foreground shadow-pop wrap-anywhere"
      :style="placement"
    >
      <slot />
    </div>
  </Transition>
</template>
