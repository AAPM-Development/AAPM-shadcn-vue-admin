<script setup lang="ts">
import AapmIcon from '@/components/aapm/icon/AapmIcon.vue'

import type { DocStatus } from './types'

import StatusChip from './status-chip.vue'

/** ERP DocumentHeader: identity, context, status, dates, source — and a clear immutable state. */
defineProps<{
  docType: string
  docNo: string
  status: DocStatus
  company: string
  site: string
  businessDate: string
  createdBy: string
  source?: { label: string, ref: string }
  immutableReason?: string
}>()
</script>

<template>
  <header class="grid gap-4 rounded-xl border p-5">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0 space-y-1">
        <p class="eyebrow text-muted-foreground">
          {{ docType }}
        </p>
        <h3 class="font-mono text-xl font-semibold tracking-title">
          {{ docNo }}
        </h3>
      </div>
      <StatusChip :status="status" />
    </div>
    <dl class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
      <div>
        <dt class="text-xs text-muted-foreground">
          Perusahaan
        </dt>
        <dd class="font-medium">
          {{ company }}
        </dd>
      </div>
      <div>
        <dt class="text-xs text-muted-foreground">
          Lokasi
        </dt>
        <dd class="font-medium">
          {{ site }}
        </dd>
      </div>
      <div>
        <dt class="text-xs text-muted-foreground">
          Tanggal bisnis
        </dt>
        <dd class="font-medium numeric">
          {{ businessDate }}
        </dd>
      </div>
      <div>
        <dt class="text-xs text-muted-foreground">
          Dibuat oleh
        </dt>
        <dd class="font-medium">
          {{ createdBy }}
        </dd>
      </div>
    </dl>
    <div v-if="source || immutableReason" class="flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-3 text-xs text-muted-foreground">
      <span v-if="source" class="inline-flex items-center gap-1.5">
        <AapmIcon name="external" :size="13" />
        {{ source.label }}
        <a href="#" class="font-mono font-medium text-brand hover:underline" @click.prevent>{{ source.ref }}</a>
      </span>
      <span v-if="immutableReason" class="inline-flex items-center gap-1.5">
        <AapmIcon name="locked" :size="13" />
        {{ immutableReason }}
      </span>
    </div>
  </header>
</template>
