<script setup lang='ts'>
import { ExternalLinkIcon } from '@lucide/vue'
import { Motion } from 'motion-v'

import { AAPM_EASE } from '@/components/aapm/motion/easing'
import { SidebarMenuButton } from '@/components/ui/sidebar'

import type { NavSubItem } from './types'

defineProps<{
  isActive: boolean
  tooltip?: string
  isExternalUrl?: boolean
  menu: NavSubItem
}>()
</script>

<template>
  <SidebarMenuButton
    as-child
    :is-active="isActive"
    :tooltip="tooltip"
  >
    <a v-if="isExternalUrl" :href="menu.url" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2">
      <component :is="menu.icon" v-if="menu.icon" />
      <span>{{ menu.title }}</span>
      <ExternalLinkIcon class="w-4 h-4 ml-auto" />
    </a>

    <router-link v-else :to="menu.url!" class="relative isolate flex items-center gap-2 data-[active=true]:bg-transparent">
      <!-- One shared pill (layoutId) slides to the active item when the route changes -->
      <Motion
        v-if="isActive"
        layout-id="aapm-sidebar-active"
        class="absolute inset-0 -z-10 rounded-md bg-(--nav-active) ring-1 ring-inset ring-(--nav-active-indicator)/20"
        :transition="{ duration: 0.38, ease: AAPM_EASE.emphasis }"
        aria-hidden="true"
      />
      <component :is="menu.icon" v-if="menu.icon" />
      <span>{{ menu.title }}</span>
    </router-link>
  </SidebarMenuButton>
</template>
