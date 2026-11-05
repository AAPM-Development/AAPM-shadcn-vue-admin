<script setup lang="ts">
defineProps<{
  /** Anchor point in px, relative to the nearest positioned ancestor. */
  x: number
  y: number
  visible: boolean
}>()
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
      role="status"
      class="pointer-events-none absolute z-10 min-w-28 -translate-x-1/2 -translate-y-full rounded-lg border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-pop"
      :style="{ left: `${x}px`, top: `${y - 10}px` }"
    >
      <slot />
    </div>
  </Transition>
</template>
