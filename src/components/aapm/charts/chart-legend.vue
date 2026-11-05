<script setup lang="ts">
import type { LegendItem } from './types'

const props = defineProps<{
  items: LegendItem[]
  /** When true, each key is a toggle button that hides/shows its series. */
  toggleable?: boolean
}>()

/** Labels of hidden series (v-model:hidden). */
const hidden = defineModel<string[]>('hidden', { default: () => [] })

function toggle(label: string) {
  if (!props.toggleable)
    return
  const isLastVisible = !hidden.value.includes(label) && hidden.value.length === props.items.length - 1
  if (isLastVisible)
    return
  hidden.value = hidden.value.includes(label)
    ? hidden.value.filter(l => l !== label)
    : [...hidden.value, label]
}
</script>

<template>
  <ul class="flex flex-wrap items-center gap-x-1 gap-y-1 text-xs text-muted-foreground" :aria-label="toggleable ? 'Legenda — klik untuk menampilkan atau menyembunyikan seri' : 'Legenda'">
    <li v-for="item in items" :key="item.label">
      <component
        :is="toggleable ? 'button' : 'span'"
        :type="toggleable ? 'button' : undefined"
        :aria-pressed="toggleable ? !hidden.includes(item.label) : undefined"
        class="flex items-center gap-2 rounded-md px-2 py-1 outline-none transition-[opacity,background-color] duration-150 ease-aapm focus-visible:ring-2 focus-visible:ring-ring pointer-coarse:min-h-11"
        :class="[
          toggleable ? 'hover:bg-muted' : '',
          hidden.includes(item.label) ? 'opacity-45' : '',
        ]"
        @click="toggle(item.label)"
      >
        <svg v-if="item.shape === 'line' || item.shape === 'dash'" width="16" height="8" aria-hidden="true">
          <line
            x1="1" y1="4" x2="15" y2="4"
            :stroke="item.color" stroke-width="2" stroke-linecap="round"
            :stroke-dasharray="item.shape === 'dash' ? '3 3' : undefined"
          />
        </svg>
        <span v-else class="size-2.5 rounded-[3px]" :style="{ background: item.color }" aria-hidden="true" />
        <span class="text-foreground/80" :class="hidden.includes(item.label) ? 'line-through' : ''">{{ item.label }}</span>
      </component>
    </li>
  </ul>
</template>
