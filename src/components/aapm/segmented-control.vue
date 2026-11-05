<script setup lang="ts" generic="T extends string">
defineProps<{
  options: { value: T, label: string }[]
  label: string
}>()

const model = defineModel<T>({ required: true })
</script>

<template>
  <div role="radiogroup" :aria-label="label" class="inline-flex items-center gap-0.5 rounded-[calc(var(--radius-control)-2px)] bg-muted p-0.5">
    <button
      v-for="option in options" :key="option.value"
      type="button" role="radio" :aria-checked="model === option.value"
      class="h-7 rounded-[calc(var(--radius-control)-4px)] px-2.5 text-xs font-semibold text-muted-foreground outline-none transition-[color,background-color,box-shadow] duration-150 ease-aapm hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring aria-checked:bg-card aria-checked:text-foreground aria-checked:shadow-[0_1px_2px_rgb(16_25_26/0.08),var(--edge-highlight)]"
      @click="model = option.value"
    >
      {{ option.label }}
    </button>
  </div>
</template>
