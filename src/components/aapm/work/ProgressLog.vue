<script setup lang="ts">
import type { ActivityEntry } from '@/design-system/contracts'

import AapmIcon from '@/components/aapm/icon/AapmIcon.vue'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatRelativeId } from '@/lib/format-id'

import { wrapButtonClass } from './wrap'

/**
 * Append-only progress / realization log (Ecosystem UI-FRM-010). Earlier entries are never edited:
 * a mistake is corrected by appending a new entry that points at the earlier one ("Koreksi atas …").
 */
const props = defineProps<{ entries: ActivityEntry[] }>()
const emit = defineEmits<{ append: [entry: { note: string, value?: string, corrects?: string }] }>()

const note = shallowRef('')
const correcting = shallowRef<ActivityEntry | null>(null)
const noteId = useId()
const byId = computed(() => new Map(props.entries.map(e => [e.id, e])))
const when = (at: ActivityEntry['at']) => (typeof at === 'string' ? at : formatRelativeId(at))

function append() {
  const text = note.value.trim()
  if (!text)
    return
  emit('append', { note: text, corrects: correcting.value?.id })
  note.value = ''
  correcting.value = null
}
</script>

<template>
  <div class="grid min-w-0 gap-4">
    <ol v-if="entries.length" class="grid gap-2" aria-label="Catatan progres">
      <li v-for="e in entries" :key="e.id" data-activity class="grid min-w-0 gap-1 rounded-lg border p-3 text-sm">
        <p class="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
          <AapmIcon :name="e.corrects ? 'corrected' : 'inProgress'" :size="13" />
          <span class="font-semibold text-foreground">{{ e.actor }}</span> · <span>{{ when(e.at) }}</span>
        </p>
        <p v-if="e.corrects" class="text-xs text-muted-foreground wrap-anywhere">
          Koreksi atas “{{ byId.get(e.corrects)?.reason ?? e.corrects }}”
        </p>
        <p class="wrap-anywhere">
          {{ e.reason }}
        </p>
        <div>
          <Button size="xs" variant="ghost" class="text-muted-foreground" :class="[wrapButtonClass('xs')]" @click="correcting = e">
            Koreksi entri ini
          </Button>
        </div>
      </li>
    </ol>
    <p v-else class="text-sm text-muted-foreground">
      Belum ada catatan progres.
    </p>

    <form class="grid gap-2" @submit.prevent="append">
      <Label :for="noteId">{{ correcting ? 'Catatan koreksi' : 'Catatan baru' }}</Label>
      <p v-if="correcting" class="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        Mengoreksi: “{{ correcting.reason }}”
        <Button type="button" size="xs" variant="ghost" :class="wrapButtonClass('xs')" @click="correcting = null">
          Batal
        </Button>
      </p>
      <Textarea :id="noteId" v-model="note" rows="2" placeholder="Mis. Vaksin ND kandang A2 selesai, 4.180 ekor" />
      <div>
        <Button type="submit" size="sm" :class="wrapButtonClass('sm')" :disabled="!note.trim()">
          Tambahkan
        </Button>
      </div>
    </form>
  </div>
</template>
