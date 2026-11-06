<script setup lang="ts">
import type { ActionAvailability, CorrectionField, Revision } from '@/design-system/contracts'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { canonicalNumberId, parseNumberId } from '@/lib/format-id'

import ReasonedAction from './ReasonedAction.vue'
import RevisionDiff from './RevisionDiff.vue'

/**
 * Correction form (Ecosystem UI-FRM-011, ERP UX-05/UX-06): the original value stays visible next
 * to the corrected one; only changed fields become revisions; a reason is required. Numbers follow
 * id-ID and ambiguous input is rejected, never reinterpreted. The consumer submits the revisions.
 */
const props = withDefaults(defineProps<{ fields: CorrectionField[], actor?: string, reasonRequired?: boolean }>(), { actor: 'Anda', reasonRequired: true })
const emit = defineEmits<{
  preview: [revisions: Revision[]]
  submit: [payload: { revisions: Revision[], reason: string }]
}>()

const values = reactive<Record<string, string>>(Object.fromEntries(props.fields.map(f => [f.key, f.original])))
const reason = shallowRef('')
const reasonId = useId()

const withUnit = (value: string, unit?: string) => (unit ? `${value} ${unit}` : value)
const errors = computed(() => Object.fromEntries(props.fields
  .filter(f => f.kind === 'number' && parseNumberId(values[f.key] ?? '') === null)
  .map(f => [f.key, 'Format angka tidak jelas — tulis seperti 1.250,5'])))

const revisions = computed<Revision[]>(() => props.fields.flatMap((f) => {
  const current = values[f.key] ?? ''
  if (f.kind === 'number') {
    // Compare and display the canonical typed text, never a float round-trip (#2, final review).
    const next = canonicalNumberId(current)
    if (next === null || next === (canonicalNumberId(f.original) ?? f.original.trim()))
      return []
    return [{ field: f.label, before: withUnit(f.original, f.unit), after: withUnit(next, f.unit), actor: props.actor, at: Date.now(), reason: reason.value.trim() || undefined }]
  }
  if (current.trim() === f.original.trim())
    return []
  return [{ field: f.label, before: withUnit(f.original, f.unit), after: withUnit(current.trim(), f.unit), actor: props.actor, at: Date.now(), reason: reason.value.trim() || undefined }]
}))
watch(revisions, list => emit('preview', list), { immediate: true })

const availability = computed<ActionAvailability>(() => {
  if (Object.keys(errors.value).length)
    return { state: 'disabled', reason: 'Perbaiki format angka dulu' }
  if (!revisions.value.length)
    return { state: 'disabled', reason: 'Ubah minimal satu nilai' }
  if (props.reasonRequired && !reason.value.trim())
    return { state: 'disabled', reason: 'Isi alasan koreksi' }
  return { state: 'available' }
})
/** One path only: the native form submit (button click or Enter), guarded by availability. */
function submit() {
  if (availability.value.state !== 'available')
    return
  emit('submit', { revisions: revisions.value, reason: reason.value.trim() })
}
</script>

<template>
  <form class="grid min-w-0 gap-4" @submit.prevent="submit">
    <div v-for="f in fields" :key="f.key" class="grid min-w-0 gap-1.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-end sm:gap-3">
      <div class="grid min-w-0 gap-1">
        <span class="text-xs text-muted-foreground">{{ f.label }} · semula</span>
        <span class="rounded-md border border-dashed px-3 py-2 text-sm numeric wrap-anywhere">{{ withUnit(f.original, f.unit) }}</span>
      </div>
      <div class="grid min-w-0 gap-1">
        <Label :for="`${reasonId}-${f.key}`">{{ f.label }} · koreksi<span v-if="f.unit" class="font-normal text-muted-foreground"> ({{ f.unit }})</span></Label>
        <Input
          :id="`${reasonId}-${f.key}`" v-model="values[f.key]" :name="f.key" :inputmode="f.kind === 'number' ? 'decimal' : undefined" autocomplete="off"
          :aria-invalid="errors[f.key] ? 'true' : undefined" :aria-describedby="errors[f.key] ? `${reasonId}-${f.key}-err` : undefined"
        />
        <p v-if="errors[f.key]" :id="`${reasonId}-${f.key}-err`" data-slot="field-error" class="text-sm text-destructive">
          {{ errors[f.key] }}
        </p>
      </div>
    </div>

    <div class="grid gap-1.5">
      <Label :for="reasonId">Alasan koreksi <span v-if="reasonRequired" class="text-destructive">*</span></Label>
      <Textarea :id="reasonId" v-model="reason" rows="2" />
    </div>

    <div v-if="revisions.length" class="grid gap-1.5">
      <p class="text-xs font-medium text-muted-foreground">
        Pratinjau perubahan
      </p>
      <RevisionDiff :revisions="revisions" compact />
    </div>

    <div>
      <ReasonedAction :availability="availability">
        Ajukan koreksi
      </ReasonedAction>
    </div>
  </form>
</template>
