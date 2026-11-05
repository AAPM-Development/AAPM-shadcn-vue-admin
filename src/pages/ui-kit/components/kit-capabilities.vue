<script setup lang="ts">
import type { Tone } from '@/components/aapm/tone/tones'
import type { CapabilitySource, CapabilityStatus, Subproject } from '@/design-system/capabilities'

import ToneChip from '@/components/aapm/tone/tone-chip.vue'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { CAPABILITIES } from '@/design-system/capabilities'
import { sortCapabilities, SOURCE_LABEL, STATUS_LABEL, STATUSES, SUBPROJECTS } from '@/design-system/capability-doc'

import KitSection from './kit-section.vue'

/** The capability matrix (src/design-system/capabilities.ts), filterable. Same data as docs/design-system/CAPABILITY_MATRIX.md. */
const STATUS_TONE: Record<CapabilityStatus, Tone> = { 'ada': 'green', 'sebagian': 'amber', 'belum': 'neutral', 'milik-produk': 'violet' }
const SOURCES = Object.keys(SOURCE_LABEL) as CapabilitySource[]

const status = shallowRef<CapabilityStatus | 'semua'>('semua')
const subproject = shallowRef<Subproject | 'semua'>('semua')
const source = shallowRef<CapabilitySource | 'semua'>('semua')

const rows = computed(() => sortCapabilities(CAPABILITIES).filter(c =>
  (status.value === 'semua' || c.status === status.value)
  && (subproject.value === 'semua' || c.subproject === subproject.value)
  && (source.value === 'semua' || c.source === source.value)))
const counts = computed(() => STATUSES.map(s => ({ status: s, n: CAPABILITIES.filter(c => c.status === s).length })))
</script>

<template>
  <KitSection
    id="kapabilitas" eyebrow="Fondasi" title="Matriks kapabilitas"
    :description="`${CAPABILITIES.length} kebutuhan AAPM UI (Vue): AAPM Ecosystem, rute ERP R01–R16, dan kapabilitas platform PC01–PC22. Setiap baris punya status, sub-proyek pemilik (B1–B4), dan demo bila sudah ada.`"
  >
    <ul class="flex flex-wrap gap-2" aria-label="Ringkasan status">
      <li v-for="c in counts" :key="c.status">
        <ToneChip :tone="STATUS_TONE[c.status]" dot>
          {{ STATUS_LABEL[c.status] }} · {{ c.n }}
        </ToneChip>
      </li>
    </ul>

    <div class="grid gap-3 md:grid-cols-3">
      <div class="grid min-w-0 gap-1.5">
        <span class="text-xs font-medium">Status</span>
        <ToggleGroup :model-value="status" type="single" variant="outline" size="sm" class="flex-wrap justify-start" aria-label="Filter status" @update:model-value="(v) => v && (status = v as typeof status)">
          <ToggleGroupItem value="semua">
            Semua
          </ToggleGroupItem>
          <ToggleGroupItem v-for="s in STATUSES" :key="s" :value="s">
            {{ STATUS_LABEL[s] }}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div class="grid min-w-0 gap-1.5">
        <span class="text-xs font-medium">Sub-proyek</span>
        <ToggleGroup :model-value="subproject" type="single" variant="outline" size="sm" class="flex-wrap justify-start" aria-label="Filter sub-proyek" @update:model-value="(v) => v && (subproject = v as typeof subproject)">
          <ToggleGroupItem value="semua">
            Semua
          </ToggleGroupItem>
          <ToggleGroupItem v-for="b in SUBPROJECTS" :key="b" :value="b">
            {{ b }}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div class="grid min-w-0 gap-1.5">
        <span class="text-xs font-medium">Sumber</span>
        <ToggleGroup :model-value="source" type="single" variant="outline" size="sm" class="flex-wrap justify-start" aria-label="Filter sumber" @update:model-value="(v) => v && (source = v as typeof source)">
          <ToggleGroupItem value="semua">
            Semua
          </ToggleGroupItem>
          <ToggleGroupItem v-for="s in SOURCES" :key="s" :value="s">
            {{ SOURCE_LABEL[s] }}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>

    <p class="text-xs text-muted-foreground" aria-live="polite">
      Menampilkan {{ rows.length }} dari {{ CAPABILITIES.length }} kebutuhan.
    </p>

    <!-- The table scrolls inside its own labelled region; the page never scrolls sideways. -->
    <div role="region" aria-label="Tabel matriks kapabilitas" tabindex="0" class="min-w-0 overflow-x-auto rounded-lg border focus-visible:outline-2 focus-visible:outline-ring">
      <table class="w-full min-w-[44rem] text-left text-sm">
        <thead class="bg-muted/50 text-xs text-muted-foreground">
          <tr>
            <th scope="col" class="whitespace-nowrap px-3 py-2 font-medium">
              ID
            </th>
            <th scope="col" class="whitespace-nowrap px-3 py-2 font-medium">
              Kebutuhan
            </th>
            <th scope="col" class="whitespace-nowrap px-3 py-2 font-medium">
              Status
            </th>
            <th scope="col" class="whitespace-nowrap px-3 py-2 font-medium">
              Sub-proyek
            </th>
            <th scope="col" class="whitespace-nowrap px-3 py-2 font-medium">
              Prioritas
            </th>
            <th scope="col" class="whitespace-nowrap px-3 py-2 font-medium">
              Demo
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in rows" :key="c.id" class="border-t align-top">
            <th scope="row" class="whitespace-nowrap px-3 py-2 text-left font-mono text-xs font-normal">
              {{ c.id }}
            </th>
            <td class="px-3 py-2">
              <span class="block">{{ c.title }}</span>
              <span class="block text-xs text-muted-foreground">{{ SOURCE_LABEL[c.source] }}<template v-if="c.note"> · {{ c.note }}</template></span>
            </td>
            <td class="px-3 py-2">
              <ToneChip :tone="STATUS_TONE[c.status]" dot>
                {{ STATUS_LABEL[c.status] }}
              </ToneChip>
            </td>
            <td class="px-3 py-2">
              {{ c.subproject }}
            </td>
            <td class="px-3 py-2">
              {{ c.priority }}
            </td>
            <td class="whitespace-nowrap px-3 py-2">
              <RouterLink v-if="c.demo" :to="c.demo" class="text-primary underline-offset-2 hover:underline">
                #{{ c.demo.split('#')[1] }}
              </RouterLink>
              <span v-else class="text-muted-foreground">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </KitSection>
</template>
