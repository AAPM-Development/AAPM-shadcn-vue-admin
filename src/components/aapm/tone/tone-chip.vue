<script setup lang="ts">
import type { Component } from 'vue'

import type { IconName } from '@/components/aapm/icon/registry'

import AapmIcon from '@/components/aapm/icon/AapmIcon.vue'

import type { Tone } from './tones'

/**
 * Categorical chip: icon or dot + text on a tone wash (assets/tokens/tones.css). Never colour alone.
 * `icon` takes a registry name or a component (page data often carries Lucide components).
 */
const props = withDefaults(defineProps<{
  tone?: Tone
  icon?: IconName | Component
  /** Show a dot instead of (or when there is no) icon. */
  dot?: boolean
  variant?: 'soft' | 'outline' | 'solid'
  size?: 'sm' | 'md'
}>(), {
  tone: 'neutral',
  icon: undefined,
  dot: false,
  variant: 'soft',
  size: 'sm',
})

const showDot = computed(() => props.dot || !props.icon)
const iconSize = computed(() => (props.size === 'sm' ? 13 : 15))
</script>

<template>
  <span
    data-slot="tone-chip"
    :data-tone="tone"
    :data-variant="variant"
    :data-size="size"
    class="aapm-tone-chip"
  >
    <span v-if="showDot" class="aapm-tone-chip__dot" aria-hidden="true" />
    <template v-else-if="icon">
      <AapmIcon v-if="typeof icon === 'string'" :name="icon as IconName" :size="iconSize" />
      <component :is="icon" v-else :width="iconSize" :height="iconSize" aria-hidden="true" />
    </template>
    <span class="min-w-0 truncate"><slot /></span>
  </span>
</template>

<style>
/* Unscoped on purpose: tables render chips through h() and the dot also appears in filter options. */
.aapm-tone-chip {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  gap: 0.3125rem;
  white-space: nowrap;
  border: 1px solid var(--tone-border);
  border-radius: calc(var(--radius) - 2px);
  background: var(--tone-bg);
  color: var(--tone-fg);
  font-weight: 600;
  line-height: 1.2;
}
.aapm-tone-chip[data-size='sm'] {
  min-height: 1.375rem;
  padding: 0.125rem 0.4375rem;
  font-size: 0.75rem;
}
.aapm-tone-chip[data-size='md'] {
  min-height: 1.75rem;
  padding: 0.25rem 0.625rem;
  font-size: 0.8125rem;
}
.aapm-tone-chip[data-variant='outline'] {
  background: transparent;
  color: var(--foreground);
}
.aapm-tone-chip[data-variant='outline'] > svg {
  color: var(--tone-dot);
}
/* Solid = the verified pair reversed (wash text on fg fill), so it keeps ≥ 4.5:1 in both themes */
.aapm-tone-chip[data-variant='solid'] {
  border-color: transparent;
  background: var(--tone-fg);
  color: var(--tone-bg);
}
.aapm-tone-chip__dot,
.aapm-tone-dot {
  width: 0.4375rem;
  height: 0.4375rem;
  flex: none;
  border-radius: 9999px;
  background: var(--tone-dot);
}
.aapm-tone-chip[data-variant='solid'] .aapm-tone-chip__dot {
  background: currentColor;
}
@media (forced-colors: active) {
  .aapm-tone-chip {
    border-color: CanvasText;
  }
  .aapm-tone-chip__dot,
  .aapm-tone-dot {
    background: CanvasText;
  }
}
</style>
