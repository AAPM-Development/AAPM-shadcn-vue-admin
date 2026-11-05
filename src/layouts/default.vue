<script setup lang="ts">
import { useCookies } from '@vueuse/integrations/useCookies'
import { animate } from 'motion-v'
import { storeToRefs } from 'pinia'

import AppBreadcrumbs from '@/components/aapm/app-breadcrumbs.vue'
import AapmIcon from '@/components/aapm/icon/AapmIcon.vue'
import { AAPM_EASE, prefersReducedMotion } from '@/components/aapm/motion/easing'
import { enterWithMotionBlur, hideForEnter } from '@/components/aapm/motion/motion-blur'
import AppSidebar from '@/components/app-sidebar/index.vue'
import CommandMenuPanel from '@/components/command-menu-panel/index.vue'
import ThemePopover from '@/components/custom-theme/theme-popover.vue'
import LanguageChange from '@/components/language-change.vue'
import ToggleTheme from '@/components/toggle-theme.vue'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { SIDEBAR_COOKIE_NAME } from '@/components/ui/sidebar/utils'
import { cn } from '@/lib/utils'
import { useThemeStore } from '@/stores/theme'

const defaultOpen = useCookies([SIDEBAR_COOKIE_NAME])
const themeStore = useThemeStore()
const { contentLayout } = storeToRefs(themeStore)

/* Route change: outgoing page fades up and out (140ms); incoming page rises 8px and fades in. */
function onBeforeEnter(el: Element) {
  hideForEnter(el as HTMLElement, 10)
}
function onEnter(el: Element, done: () => void) {
  enterWithMotionBlur(el as HTMLElement, { distance: 8, blur: 0, duration: 0.45 }).then(done)
}
function onLeave(el: Element, done: () => void) {
  if (prefersReducedMotion())
    return done()
  const node = el as HTMLElement
  animate(node, { opacity: 0, y: -6 }, { duration: 0.14, ease: AAPM_EASE.out }).then(done)
}
</script>

<template>
  <SidebarProvider :default-open="defaultOpen.get(SIDEBAR_COOKIE_NAME)">
    <AppSidebar />
    <SidebarInset class="w-full max-w-full peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)] peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]">
      <header
        class="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border/70 bg-(--topbar-bg) px-4 backdrop-blur-xl transition-[width,height] duration-200 ease-aapm sm:gap-4"
      >
        <SidebarTrigger class="-ml-1" />
        <Separator orientation="vertical" />
        <AppBreadcrumbs class="hidden md:flex" />
        <CommandMenuPanel />
        <div class="flex-1" />
        <!-- Active company + site stay visible on every page (UX-03) -->
        <span class="hidden items-center gap-1.5 text-xs text-muted-foreground xl:inline-flex">
          <AapmIcon name="company" :size="14" />
          <span class="font-semibold text-foreground">PT AAPM</span>
          <span aria-hidden="true">·</span>
          <span>Farm Payakumbuh</span>
        </span>
        <div class="ml-auto flex items-center space-x-2">
          <LanguageChange />
          <ToggleTheme />
          <ThemePopover />
        </div>
      </header>

      <main
        :class="cn(
          'grow relative px-4 pt-2 pb-10 sm:px-6',
          contentLayout === 'centered' ? 'container mx-auto ' : '',
        )"
      >
        <router-view v-slot="{ Component, route }">
          <Transition :css="false" mode="out-in" @before-enter="onBeforeEnter" @enter="onEnter" @leave="onLeave">
            <component :is="Component" :key="route.path" />
          </Transition>
        </router-view>
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
