<script setup lang="ts">
import { prefersReducedMotion } from '@/components/aapm/motion/easing'
import { BasicPage } from '@/components/global-layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { scrollToAnchorWhenStable } from '@/composables/use-anchor-scroll'
import { getLenis } from '@/plugins/smooth-scroll/setup'

import type { KitTab } from './components/kit-anchors'

import { KIT_ANCHOR_TAB } from './components/kit-anchors'
import KitCapabilities from './components/kit-capabilities.vue'
import KitCharts from './components/kit-charts.vue'
import KitControls from './components/kit-controls.vue'
import KitData from './components/kit-data.vue'
import KitErp from './components/kit-erp.vue'
import KitIdentity from './components/kit-identity.vue'
import KitOverlays from './components/kit-overlays.vue'
import KitTones from './components/kit-tones.vue'

/**
 * AAPM component library: every primitive and ERP component, live, with its micro-interaction.
 * Coverage is enforced by src/assets/__tests__/motion-coverage.test.ts.
 */
const TABS = [
  { value: 'kontrol', label: 'Kontrol & input' },
  { value: 'navigasi', label: 'Navigasi & overlay' },
  { value: 'data', label: 'Tabel & visual' },
  { value: 'erp', label: 'Komponen ERP' },
  { value: 'identitas', label: 'Identitas & sesi' },
  { value: 'kapabilitas', label: 'Kapabilitas' },
] as const satisfies readonly { value: KitTab, label: string }[]
const tab = shallowRef<KitTab>('kontrol')

/** `/ui-kit#<anchor>` opens the tab that holds the anchor, then scrolls to it (kit-anchors.ts). */
const route = useRoute()
async function openAnchor(hash: string) {
  const id = decodeURIComponent(hash.replace(/^#/, ''))
  const target = KIT_ANCHOR_TAB[id]
  if (!target)
    return
  tab.value = target
  await nextTick()
  // Lenis owns the window scroll when active; 128px clears the sticky header and the tab strip.
  await scrollToAnchorWhenStable(id, { scroller: getLenis(), offset: 128, reducedMotion: prefersReducedMotion() })
}
watch(() => route.hash, hash => hash && openAnchor(hash), { immediate: true })

/** On narrow screens the tab strip scrolls; keep the active tab in view. */
watch(tab, async () => {
  await nextTick()
  document.querySelector('[data-aapm-kit-tabs] [data-slot="tabs-trigger"][data-state="active"]')
    ?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
})
</script>

<template>
  <BasicPage
    overline="Sistem · AAPM UI"
    title="Library komponen"
    description="Semua komponen shadcn-vue dan komponen ERP AAPM dalam satu tempat, lengkap dengan micro-interaction. Data di halaman ini adalah contoh."
  >
    <Tabs v-model="tab" class="w-full">
      <div class="sticky top-14 z-20 -mx-4 bg-background/85 px-4 py-2 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <div class="overflow-x-auto" data-aapm-kit-tabs>
          <TabsList>
            <TabsTrigger v-for="t in TABS" :key="t.value" :value="t.value">
              {{ t.label }}
            </TabsTrigger>
          </TabsList>
        </div>
      </div>
      <TabsContent value="kontrol" class="grid min-w-0 grid-cols-1 gap-4 pt-2">
        <KitControls />
      </TabsContent>
      <TabsContent value="navigasi" class="grid min-w-0 grid-cols-1 gap-4 pt-2">
        <KitOverlays />
      </TabsContent>
      <TabsContent value="data" class="grid min-w-0 grid-cols-1 gap-4 pt-2">
        <KitTones />
        <KitData />
        <KitCharts />
      </TabsContent>
      <TabsContent value="erp" class="grid min-w-0 grid-cols-1 gap-4 pt-2">
        <KitErp />
      </TabsContent>
      <TabsContent value="identitas" class="grid min-w-0 grid-cols-1 gap-4 pt-2">
        <KitIdentity />
      </TabsContent>
      <TabsContent value="kapabilitas" class="grid min-w-0 grid-cols-1 gap-4 pt-2">
        <KitCapabilities />
      </TabsContent>
    </Tabs>
  </BasicPage>
</template>
