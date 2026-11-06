<script setup lang="ts">
import type { FeatureAvailability } from '@/design-system/contracts'

import AapmIcon from '@/components/aapm/icon/AapmIcon.vue'
import { SETTING_SCOPE_LABEL } from '@/design-system/contracts'

import ReasonedAction from './ReasonedAction.vue'

/**
 * Settings & feature availability (ERP PC17): a required setting that is missing or invalid disables
 * the action with its reason and a path to the setting (and its scope) — never a guessed default.
 * When enabled, the gated control renders exactly as given.
 */
defineProps<{ availability: FeatureAvailability }>()
</script>

<template>
  <slot v-if="availability.enabled" />
  <div v-else class="grid min-w-0 justify-items-start gap-1.5">
    <ReasonedAction :availability="{ state: 'disabled', reason: availability.reason ?? `${availability.feature} belum tersedia` }">
      {{ availability.feature }}
    </ReasonedAction>
    <p class="text-xs text-muted-foreground wrap-anywhere">
      {{ availability.reason }}
      <template v-if="availability.setting">
        <component :is="availability.setting.to ? 'RouterLink' : 'span'" :to="availability.setting.to" class="inline-flex max-w-full items-center gap-1 font-medium text-primary underline-offset-2 wrap-anywhere hover:underline">
          <AapmIcon name="settings" :size="12" />Buka pengaturan
        </component>
        <span> · Pengaturan {{ SETTING_SCOPE_LABEL[availability.setting.scope] }}</span>
      </template>
    </p>
  </div>
</template>
