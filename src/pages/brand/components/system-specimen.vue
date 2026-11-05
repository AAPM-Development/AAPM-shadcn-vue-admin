<script setup lang="ts">
import { useColorMode } from '@vueuse/core'

import type { IconName } from '@/components/aapm/icon/registry'

import AapmIcon from '@/components/aapm/icon/AapmIcon.vue'
import { ICON_GROUPS } from '@/components/aapm/icon/registry'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/** Semantic tokens shown with their live value for the current theme. */
const TOKEN_GROUPS = [
  { title: 'Permukaan', tokens: ['--background', '--card', '--surface-soft', '--surface-tint', '--muted', '--border'] },
  { title: 'Teks', tokens: ['--foreground', '--muted-foreground', '--brand-accent-ink'] },
  { title: 'Brand', tokens: ['--brand', '--brand-deep', '--brand-accent', '--highlight', '--ring'] },
  { title: 'Status', tokens: ['--success', '--warning', '--danger', '--info'] },
  { title: 'Data · kategorikal', tokens: ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5'] },
  { title: 'Data · sekuensial', tokens: ['--seq-0', '--seq-1', '--seq-2', '--seq-3', '--seq-4', '--seq-5'] },
]

const mode = useColorMode()
const values = shallowRef<Record<string, string>>({})

function toHex(color: string) {
  const ctx = document.createElement('canvas').getContext('2d')
  if (!ctx)
    return color
  ctx.fillStyle = color
  return ctx.fillStyle.toUpperCase()
}

function readTokens() {
  const probe = document.createElement('div')
  document.body.appendChild(probe)
  const next: Record<string, string> = {}
  for (const token of TOKEN_GROUPS.flatMap(g => g.tokens)) {
    probe.style.color = `var(${token})`
    next[token] = toHex(getComputedStyle(probe).color)
  }
  probe.remove()
  values.value = next
}

onMounted(readTokens)
watch(mode, () => requestAnimationFrame(readTokens))

const TYPE_SCALE = [
  { name: 'Hero metric', cls: 'text-[3.75rem] leading-none font-semibold tracking-display', spec: '60 / 1 · 600 · −0,035em', sample: '6.793' },
  { name: 'Page title', cls: 'text-[1.875rem] leading-9 font-semibold tracking-display', spec: '30 / 36 · 600', sample: 'Ringkasan produksi' },
  { name: 'Card title', cls: 'text-lg font-semibold tracking-title', spec: '18 / 28 · 600 · −0,025em', sample: 'Stok terhadap kebutuhan minimum' },
  { name: 'Body', cls: 'text-sm', spec: '14 / 20 · 400', sample: 'Periksa ventilasi dan catatan nekropsi sebelum shift sore.' },
  { name: 'Caption', cls: 'text-xs text-muted-foreground', spec: '12 / 16 · 400', sample: 'Diperbarui 05/11/2026 06.00 WIB' },
  { name: 'Overline', cls: 'eyebrow text-muted-foreground', spec: '11 / 16 · 600 · +0,14em', sample: 'Antrean tindakan' },
  { name: 'Mono', cls: 'font-mono text-xs', spec: 'JetBrains Mono 12', sample: 'SO-2611-0142' },
]

const RADII = [
  { name: 'control', var: '--radius-control', use: 'tombol, input' },
  { name: 'panel', var: '--radius-panel', use: 'panel dalam' },
  { name: 'card', var: '--radius-card', use: 'kartu' },
  { name: 'shell', var: '--radius-shell', use: 'dialog, auth' },
]

const iconGroups = Object.entries(ICON_GROUPS) as [string, Record<IconName, unknown>][]
</script>

<template>
  <div class="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
    <Card class="lg:col-span-7">
      <CardHeader>
        <p class="eyebrow text-muted-foreground">
          Token semantik · tema {{ mode === 'dark' ? 'Dark Operator' : 'Soft Structural' }}
        </p>
        <CardTitle class="text-lg">
          Warna yang dipakai layar
        </CardTitle>
        <CardDescription>Layar memakai peran, bukan hex. Nilai di bawah dibaca langsung dari tema aktif.</CardDescription>
      </CardHeader>
      <CardContent class="grid gap-5">
        <div v-for="group in TOKEN_GROUPS" :key="group.title" class="grid gap-2">
          <p class="text-xs font-semibold text-muted-foreground">
            {{ group.title }}
          </p>
          <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
            <div v-for="token in group.tokens" :key="token" class="flex items-center gap-2 rounded-(--radius-panel) border p-1.5">
              <span class="size-8 shrink-0 rounded-lg ring-1 ring-foreground/10" :style="{ background: `var(${token})` }" />
              <span class="min-w-0">
                <span class="block truncate font-mono text-[11px]">{{ token.slice(2) }}</span>
                <span class="block font-mono text-[10px] text-muted-foreground">{{ values[token] ?? '…' }}</span>
              </span>
            </div>
          </div>
        </div>
        <p class="border-t pt-4 text-xs leading-relaxed text-muted-foreground">
          Urutan kategorikal (hijau → teal → oranye → violet → lime) lolos validator CVD untuk pasangan bersebelahan di kedua tema.
          Lime terang &lt; 3:1 pada putih, jadi grafik selalu menyertakan legenda, tooltip, dan tampilan tabel.
        </p>
      </CardContent>
    </Card>

    <div class="grid gap-4 lg:col-span-5 lg:gap-5">
      <Card>
        <CardHeader>
          <p class="eyebrow text-muted-foreground">
            Skala tipe
          </p>
          <CardTitle class="text-lg">
            Plus Jakarta Sans
          </CardTitle>
        </CardHeader>
        <CardContent class="grid gap-4">
          <div v-for="row in TYPE_SCALE" :key="row.name" class="grid gap-1 border-b border-border/60 pb-3 last:border-0 last:pb-0">
            <div class="flex justify-between text-[11px] text-muted-foreground">
              <span>{{ row.name }}</span><span class="font-mono">{{ row.spec }}</span>
            </div>
            <p :class="row.cls" class="truncate">
              {{ row.sample }}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <p class="eyebrow text-muted-foreground">
            Bentuk & elevasi
          </p>
          <CardTitle class="text-lg">
            Radius konsentris
          </CardTitle>
        </CardHeader>
        <CardContent class="grid grid-cols-4 gap-3">
          <div v-for="r in RADII" :key="r.name" class="grid gap-1.5 text-center">
            <div class="aspect-square border bg-muted" :style="{ borderRadius: `var(${r.var})` }" />
            <p class="text-xs font-semibold">
              {{ r.name }}
            </p>
            <p class="text-[10px] text-muted-foreground">
              {{ r.use }}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card class="lg:col-span-12">
      <CardHeader>
        <p class="eyebrow text-muted-foreground">
          Ikon · Lucide (UX-13)
        </p>
        <CardTitle class="text-lg">
          Registry ikon semantik
        </CardTitle>
        <CardDescription>
          Layar memanggil &lt;AapmIcon name="egg" /&gt;, bukan nama provider. Satu kosakata Lucide, stroke 1,75, ukuran 16 / 20 / 24 px.
        </CardDescription>
      </CardHeader>
      <CardContent class="grid gap-5">
        <div v-for="[group, icons] in iconGroups" :key="group" class="grid gap-2">
          <p class="eyebrow text-muted-foreground">
            {{ group }}
          </p>
          <div class="grid grid-cols-3 gap-1.5 sm:grid-cols-5 md:grid-cols-7 xl:grid-cols-10">
            <div
              v-for="name in Object.keys(icons) as IconName[]" :key="name"
              class="flex flex-col items-center gap-1.5 rounded-(--radius-panel) border border-transparent p-2 text-center transition-colors duration-150 ease-aapm hover:border-border hover:bg-muted/60"
            >
              <AapmIcon :name="name" :size="20" />
              <span class="w-full truncate font-mono text-[10px] text-muted-foreground">{{ name }}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
