<script setup lang="ts">
import AapmIcon from '@/components/aapm/icon/AapmIcon.vue'
import { formatSigned } from '@/lib/format-id'

const props = withDefaults(defineProps<{
  /** Change in percent units (3.2 = +3,2%). */
  value: number
  /** Whether a rise is good news (production) or bad news (mortality, FCR). */
  goodWhen?: 'up' | 'down'
  suffix?: string
  digits?: number
  period?: string
}>(), {
  goodWhen: 'up',
  suffix: '%',
  digits: 1,
  period: undefined,
})

const direction = computed(() => props.value > 0 ? 'up' : props.value < 0 ? 'down' : 'flat')
const tone = computed(() => {
  if (direction.value === 'flat')
    return 'neutral'
  return direction.value === props.goodWhen ? 'good' : 'bad'
})
const text = computed(() => formatSigned(props.value, props.digits, props.suffix))
</script>

<template>
  <span class="inline-flex items-center gap-1.5 text-xs">
    <span
      class="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold numeric"
      :class="{
        'bg-success-soft text-success': tone === 'good',
        'bg-danger-soft text-danger': tone === 'bad',
        'bg-muted text-muted-foreground': tone === 'neutral',
      }"
    >
      <AapmIcon v-if="direction !== 'flat'" :name="direction === 'up' ? 'arrowUp' : 'arrowDown'" :size="12" />
      {{ text }}
      <span class="sr-only">{{ tone === 'good' ? '(membaik)' : tone === 'bad' ? '(memburuk)' : '(stabil)' }}</span>
    </span>
    <span v-if="period" class="text-muted-foreground">{{ period }}</span>
  </span>
</template>
