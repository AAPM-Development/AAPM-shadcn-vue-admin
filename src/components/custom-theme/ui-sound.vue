<script setup lang="ts">
import { computed, ref } from 'vue'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { isSoundEnabled, setSoundEnabled, sound } from '@/lib/sound'

/** UI sound on/off (persisted under `aapm-ui-sound`); turning it on plays a short preview. */
const on = ref(isSoundEnabled())

const enabled = computed({
  get: () => on.value,
  set: (value: boolean) => {
    on.value = value
    setSoundEnabled(value)
    if (value)
      sound.play('success')
  },
})
</script>

<template>
  <div class="space-y-1.5 pt-6">
    <div class="flex items-center justify-between gap-3">
      <Label for="ui-sound" class="text-xs">
        Suara antarmuka
      </Label>
      <Switch id="ui-sound" v-model="enabled" aria-describedby="ui-sound-hint" />
    </div>
    <p id="ui-sound-hint" class="text-xs text-muted-foreground">
      Bunyi singkat saat aksi berhasil, gagal, atau diblokir.
    </p>
  </div>
</template>
