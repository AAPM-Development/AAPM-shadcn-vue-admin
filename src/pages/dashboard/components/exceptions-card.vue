<script setup lang="ts">
import type { IconName } from '@/components/aapm/icon/registry'

import AapmIcon from '@/components/aapm/icon/AapmIcon.vue'
import ToneChip from '@/components/aapm/tone/tone-chip.vue'
import { toneOf } from '@/components/aapm/tone/tones'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import type { ExceptionTone, FarmException } from '../data/farm-overview'

import { exceptions } from '../data/farm-overview'
import PanelHeader from './panel-header.vue'

const ICON: Record<FarmException['icon'], IconName> = {
  mortality: 'mortality',
  feed: 'feed',
  vaccine: 'vaccine',
  temperature: 'temperature',
  production: 'hdp',
}

const TONE: Record<ExceptionTone, { label: string, icon: IconName }> = {
  danger: { label: 'Kritis', icon: 'danger' },
  warning: { label: 'Perhatian', icon: 'warning' },
  info: { label: 'Terjadwal', icon: 'pending' },
}

const critical = computed(() => exceptions.filter(e => e.tone === 'danger').length)
const LIMIT = 3
const expanded = shallowRef(false)
const visible = computed(() => (expanded.value ? exceptions : exceptions.slice(0, LIMIT)))
</script>

<template>
  <Card class="h-full">
    <PanelHeader
      overline="Antrean tindakan"
      title="Perlu ditindaklanjuti"
      :description="`${exceptions.length} item · ${critical} kritis. Diurutkan menurut prioritas, lalu waktu.`"
    />
    <CardContent>
      <TransitionGroup
        tag="ol" class="grid"
        enter-active-class="transition-[opacity,transform] duration-300 ease-aapm"
        enter-from-class="opacity-0 -translate-y-1"
        leave-active-class="transition-opacity duration-150 ease-aapm"
        leave-to-class="opacity-0"
      >
        <li
          v-for="item in visible" :key="item.id"
          class="grid grid-cols-[auto_1fr] gap-3 border-b border-border/70 px-1 py-3 last:border-0"
        >
          <AapmIcon :name="ICON[item.icon]" :size="18" class="mt-0.5 text-muted-foreground" />
          <div class="min-w-0 space-y-1.5">
            <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
              <ToneChip :tone="toneOf('severity', item.tone)" :icon="TONE[item.tone].icon">
                {{ TONE[item.tone].label }}
              </ToneChip>
              <span class="text-xs text-muted-foreground numeric">{{ item.time }}</span>
            </div>
            <p class="text-sm font-semibold leading-snug">
              {{ item.title }}
            </p>
            <p class="text-xs leading-relaxed text-muted-foreground text-pretty">
              {{ item.detail }}
            </p>
            <div class="flex flex-wrap items-center justify-between gap-2 pt-0.5">
              <span class="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                <AapmIcon name="user" :size="13" />
                <span class="truncate">{{ item.owner }}</span>
              </span>
              <Button variant="outline" size="sm" class="h-auto min-h-7 max-w-full whitespace-normal px-2.5 py-1 text-left text-xs pointer-coarse:min-h-11">
                {{ item.action }}
                <AapmIcon name="chevronRight" :size="14" />
              </Button>
            </div>
          </div>
        </li>
      </TransitionGroup>
      <Button
        v-if="exceptions.length > LIMIT"
        variant="ghost" size="sm" class="mt-1 h-auto min-h-8 w-full whitespace-normal text-muted-foreground"
        :aria-expanded="expanded"
        @click="expanded = !expanded"
      >
        {{ expanded ? 'Tampilkan lebih sedikit' : `Tampilkan semua (${exceptions.length})` }}
        <AapmIcon name="chevronDown" :size="16" class="transition-transform duration-200 ease-aapm" :class="expanded ? 'rotate-180' : ''" />
      </Button>
    </CardContent>
  </Card>
</template>
