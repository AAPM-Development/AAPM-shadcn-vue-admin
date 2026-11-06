<script setup lang="ts">
import type { ActionAvailability, DecisionContext } from '@/design-system/contracts'

import ImpactPreview from '@/components/aapm/erp/impact-preview.vue'
import AapmIcon from '@/components/aapm/icon/AapmIcon.vue'
import { useBlockedFeedback } from '@/components/aapm/motion/use-blocked-feedback'
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'

import ReasonedAction from './ReasonedAction.vue'
import { wrapButtonClass } from './wrap'

/**
 * Consequential decision (Ecosystem UI-FRM-007, ERP UX-06): options as radio cards, reason required
 * per option, evidence and impact shown before deciding, a confirmation that names the document,
 * company and effect. The consumer's `submit` is awaited:
 * - no double submit;
 * - a failure or timeout means the outcome is unknown: offer "Cek status" or a retry of the
 *   *same* decision, never a blind duplicate entry.
 */
const props = defineProps<{
  context: DecisionContext
  submit: (decision: { value: string, reason: string }) => Promise<void>
}>()
const emit = defineEmits<{ checkStatus: [] }>()

const value = shallowRef<string>()
const reason = shallowRef('')
const error = shallowRef('')
const confirming = shallowRef(false)
const pending = shallowRef(false)
const outcome = shallowRef<'idle' | 'saved' | 'unknown'>('idle')
let lastPayload: { value: string, reason: string } | null = null

const option = computed(() => props.context.options.find(o => o.value === value.value))
const root = useTemplateRef<HTMLElement>('root')
const reasonField = useTemplateRef<{ $el: HTMLTextAreaElement }>('reasonField')
const { onBlocked } = useBlockedFeedback(root)
const reasonId = useId()
const errorId = useId()

watch([value, reason], () => (error.value = ''))

/**
 * After an unknown outcome only "Cek status" or "Coba lagi" (the same decision) may act, and the
 * choice is locked so the screen never disagrees with what a retry sends; a saved decision is done.
 */
const locked = computed(() => pending.value || outcome.value !== 'idle')
const nextAvailability = computed<ActionAvailability>(() => {
  if (pending.value)
    return { state: 'loading' }
  if (outcome.value === 'unknown')
    return { state: 'disabled', reason: 'Cek status dulu — hasil sebelumnya belum pasti' }
  if (outcome.value === 'saved')
    return { state: 'done' }
  return option.value ? { state: 'available' } : { state: 'disabled', reason: 'Pilih keputusan dulu' }
})

async function proceed() {
  if (!option.value)
    return
  if (option.value.reasonRequired && !reason.value.trim()) {
    error.value = `Alasan wajib diisi untuk "${option.value.label}".`
    await nextTick()
    const el = reasonField.value?.$el
    el?.focus()
    onBlocked()
    return
  }
  outcome.value = 'idle'
  confirming.value = true
}

async function send(payload: { value: string, reason: string }) {
  if (pending.value)
    return
  pending.value = true
  lastPayload = payload
  try {
    await props.submit(payload)
    outcome.value = 'saved'
  }
  catch {
    outcome.value = 'unknown'
  }
  finally {
    pending.value = false
    confirming.value = false
  }
}
function confirm() {
  if (option.value)
    void send({ value: option.value.value, reason: reason.value.trim() })
}
function retry() {
  if (lastPayload)
    void send(lastPayload)
}
</script>

<template>
  <div ref="root" class="grid min-w-0 gap-4">
    <RadioGroup v-model="value" :disabled="locked" data-aapm-radio-cards class="grid gap-2 sm:grid-cols-[repeat(auto-fit,minmax(min(100%,12rem),1fr))]" aria-label="Pilih keputusan">
      <label v-for="o in context.options" :key="o.value" :for="`${reasonId}-${o.value}`" class="flex cursor-pointer items-start gap-3 rounded-lg border p-3">
        <RadioGroupItem :id="`${reasonId}-${o.value}`" :value="o.value" class="mt-0.5" />
        <span class="grid min-w-0 gap-0.5">
          <span class="text-sm font-semibold">{{ o.label }}</span>
          <span class="text-xs text-muted-foreground wrap-anywhere">{{ o.effect }}</span>
        </span>
      </label>
    </RadioGroup>

    <div class="grid gap-1.5">
      <Label :for="reasonId">Alasan <span v-if="option?.reasonRequired" class="text-destructive">*</span><span v-else class="font-normal text-muted-foreground">(opsional)</span></Label>
      <Textarea :id="reasonId" ref="reasonField" v-model="reason" :disabled="locked" rows="3" :aria-invalid="error ? 'true' : undefined" :aria-describedby="error ? errorId : undefined" />
      <p v-if="error" :id="errorId" data-slot="field-error" role="alert" class="text-sm text-destructive">
        {{ error }}
      </p>
    </div>

    <ImpactPreview v-if="context.impacts?.length" :impacts="context.impacts" />
    <ul v-if="context.evidence?.length" class="flex flex-wrap gap-3 text-sm" aria-label="Bukti">
      <li v-for="e in context.evidence" :key="e.label">
        <a :href="e.href" class="inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline"><AapmIcon name="attach" :size="14" />{{ e.label }}</a>
      </li>
    </ul>

    <div class="flex flex-wrap items-center gap-3">
      <ReasonedAction :availability="nextAvailability" @activate="proceed">
        Lanjutkan
      </ReasonedAction>
      <p v-if="outcome === 'saved'" role="status" class="inline-flex items-center gap-1.5 text-sm text-success">
        <AapmIcon name="success" :size="16" /> Keputusan tersimpan.
      </p>
    </div>

    <div v-if="outcome === 'unknown'" role="alert" class="grid gap-2 rounded-lg border border-warning/40 bg-warning-soft p-3 text-sm">
      <p class="font-semibold text-warning">
        Hasil belum pasti
      </p>
      <p class="text-muted-foreground">
        Server tidak memberi jawaban. Keputusan mungkin sudah tersimpan — cek statusnya sebelum mencoba lagi.
      </p>
      <div class="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" :class="wrapButtonClass('sm')" @click="emit('checkStatus')">
          Cek status
        </Button>
        <Button size="sm" :class="wrapButtonClass('sm')" :disabled="pending" @click="retry">
          Coba lagi
        </Button>
      </div>
    </div>

    <AlertDialog :open="confirming" @update:open="(open) => { if (!open && !pending) confirming = false }">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ option?.label }} — {{ context.document }}</AlertDialogTitle>
          <AlertDialogDescription>
            {{ context.company }}. {{ option?.effect }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <p v-if="reason.trim()" class="rounded-md bg-muted px-3 py-2 text-sm">
          “{{ reason.trim() }}”
        </p>
        <AlertDialogFooter>
          <AlertDialogCancel :disabled="pending">
            Batal
          </AlertDialogCancel>
          <Button :class="wrapButtonClass()" :disabled="pending" :variant="option?.tone === 'reject' ? 'destructive' : 'default'" @click="confirm">
            Konfirmasi
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
