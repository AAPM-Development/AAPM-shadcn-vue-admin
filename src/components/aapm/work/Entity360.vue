<script setup lang="ts">
import type { SemanticState } from '@/design-system/states'

import StateChip from '@/components/aapm/tone/state-chip.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

/** Entity 360 (Ecosystem UI-DAT-012): header + summary, then activity, related and documents. */
defineProps<{ title: string, subtitle?: string, state?: SemanticState }>()
const TABS = [
  { value: 'aktivitas', label: 'Aktivitas', empty: 'Belum ada aktivitas.' },
  { value: 'terkait', label: 'Terkait', empty: 'Belum ada dokumen terkait.' },
  { value: 'dokumen', label: 'Dokumen', empty: 'Belum ada dokumen.' },
] as const
const SLOT = { aktivitas: 'activity', terkait: 'related', dokumen: 'documents' } as const
</script>

<template>
  <section class="grid min-w-0 gap-4" :aria-label="title">
    <header class="flex min-w-0 flex-wrap items-start justify-between gap-2">
      <div class="grid min-w-0 gap-0.5 wrap-anywhere">
        <h3 class="text-base font-semibold">
          {{ title }}
        </h3>
        <p v-if="subtitle" class="text-sm text-muted-foreground">
          {{ subtitle }}
        </p>
      </div>
      <StateChip v-if="state" :state="state" size="md" />
    </header>
    <slot name="summary" />
    <Tabs default-value="aktivitas" class="min-w-0">
      <TabsList class="max-w-full justify-start overflow-x-auto">
        <TabsTrigger v-for="t in TABS" :key="t.value" :value="t.value">
          {{ t.label }}
        </TabsTrigger>
      </TabsList>
      <TabsContent v-for="t in TABS" :key="t.value" :value="t.value" class="pt-3">
        <slot :name="SLOT[t.value]">
          <p class="text-sm text-muted-foreground">
            {{ t.empty }}
          </p>
        </slot>
      </TabsContent>
    </Tabs>
  </section>
</template>
