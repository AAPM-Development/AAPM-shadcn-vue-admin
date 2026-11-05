<script setup lang="ts">
import { toast } from 'vue-sonner'

import AapmIcon from '@/components/aapm/icon/AapmIcon.vue'
import ToneChip from '@/components/aapm/tone/tone-chip.vue'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

/**
 * Identity extension (ERP UI_UX_REQUIREMENTS "Identity and session UI"): sessions are not
 * devices; show current, last activity, expiry and owned-session revoke with confirmation.
 */
const sessions = ref([
  { id: 's1', client: 'Chrome · Windows', place: 'Payakumbuh', company: 'PT Agung Abadi Putra Mandiri', last: 'Aktif sekarang', expires: 'Berakhir 05/11/2026 18.00', current: true },
  { id: 's2', client: 'Aplikasi Farm · Android', place: 'Kandang B', company: 'PT Agung Abadi Putra Mandiri', last: '12 menit lalu', expires: 'Berakhir 06/11/2026 06.00', current: false },
  { id: 's3', client: 'Edge · Windows', place: 'Bukittinggi', company: 'PT AAPM — Unit Pakan', last: 'Kemarin 16.20', expires: 'Berakhir 05/11/2026 16.20', current: false },
])

function revoke(id: string) {
  const s = sessions.value.find(x => x.id === id)
  sessions.value = sessions.value.filter(x => x.id !== id)
  toast.success('Sesi dicabut', { description: `${s?.client} harus masuk ulang.` })
}
</script>

<template>
  <ul v-auto-animate="{ duration: 220, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }" class="grid gap-2" aria-label="Sesi aktif">
    <li v-for="s in sessions" :key="s.id" class="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-lg border p-3 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
      <AapmIcon :name="s.client.includes('Android') ? 'qr' : 'display'" :size="20" class="text-muted-foreground" />
      <div class="min-w-0">
        <p class="flex flex-wrap items-center gap-2 text-sm font-medium">
          {{ s.client }}
          <ToneChip v-if="s.current" tone="green" dot>
            Sesi ini
          </ToneChip>
        </p>
        <p class="text-xs text-muted-foreground wrap-anywhere">
          {{ s.company }} · {{ s.place }} · {{ s.last }} · {{ s.expires }}
        </p>
      </div>
      <AlertDialog v-if="!s.current">
        <AlertDialogTrigger as-child>
          <Button variant="outline" size="sm" class="col-start-2 justify-self-start sm:col-auto">
            Cabut
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cabut sesi {{ s.client }}?</AlertDialogTitle>
            <AlertDialogDescription>
              Sesi untuk {{ s.company }} akan berakhir sekarang. Draft yang sudah tersimpan di server tidak terhapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction @click="revoke(s.id)">
              Cabut sesi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  </ul>
</template>
