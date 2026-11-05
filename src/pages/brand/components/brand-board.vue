<script setup lang="ts">
import BrandMark from '@/components/aapm/brand-mark.vue'
import AapmIcon from '@/components/aapm/icon/AapmIcon.vue'
import { Button } from '@/components/ui/button'

const core = [
  { name: 'AAPM Green', hex: '#318139', role: 'Aksi utama, fokus, seri data 1' },
  { name: 'AAPM Orange', hex: '#D4451A', role: 'Aksen hangat, seri data 3' },
  { name: 'White', hex: '#FFFFFF', role: 'Kanvas & inverse' },
  { name: 'Dark-logo neutral', hex: '#CCCCCC', role: 'Logo di permukaan gelap' },
]
const statuses = [
  { label: 'Draft', icon: 'edit', cls: 'bg-muted text-muted-foreground' },
  { label: 'Dikirim', icon: 'truck', cls: 'bg-info-soft text-info' },
  { label: 'Lunas', icon: 'success', cls: 'bg-success-soft text-success' },
  { label: 'Jatuh tempo', icon: 'warning', cls: 'bg-warning-soft text-warning' },
] as const
const glyphs = ['egg', 'flock', 'feed', 'house', 'mortality', 'vaccine', 'warehouse', 'truck'] as const
</script>

<template>
  <section aria-labelledby="board-title" class="grid gap-3">
    <h2 id="board-title" class="sr-only">
      Brand kit
    </h2>
    <!-- Flat bento: 1px gaps on the border color draw the grid; no nested cards -->
    <div class="grid grid-cols-1 gap-px overflow-hidden rounded-xl border bg-border md:grid-cols-2 xl:grid-cols-3">
      <!-- 01 · Light master on its real surface (always white) -->
      <article class="flex min-h-60 flex-col justify-between bg-white p-7 text-neutral-900">
        <span class="eyebrow text-neutral-500">01 · Logo utama</span>
        <img src="/brand/aapm-logo.svg" alt="Logo AAPM horizontal untuk permukaan terang" class="h-14 w-auto self-start">
        <p class="font-mono text-[11px] text-neutral-500">
          aapm-logo-horizontal.svg
        </p>
      </article>

      <!-- 02 · Dark master on its real surface (always near-black) -->
      <article class="flex min-h-60 flex-col justify-between bg-neutral-950 p-7 text-neutral-100">
        <span class="eyebrow text-neutral-400">02 · Permukaan gelap</span>
        <img src="/brand/aapm-logo-dark.svg" alt="Logo AAPM untuk permukaan gelap" class="h-14 w-auto self-start">
        <p class="font-mono text-[11px] text-neutral-400">
          aapm-logo-horizontal-dark.svg · tanpa filter invert
        </p>
      </article>

      <!-- 03 · Digital application: minimal window chrome -->
      <article class="flex min-h-60 flex-col gap-5 bg-card p-7">
        <span class="eyebrow text-muted-foreground">03 · Aplikasi</span>
        <div class="rounded-lg border">
          <div class="flex items-center gap-1.5 border-b px-3 py-2">
            <span class="size-2 rounded-full bg-border" />
            <span class="size-2 rounded-full bg-border" />
            <span class="size-2 rounded-full bg-border" />
            <span class="ml-2 font-mono text-[11px] text-muted-foreground">erp.aapm.co.id</span>
          </div>
          <div class="flex items-end justify-between gap-4 p-4">
            <div class="space-y-1">
              <BrandMark class="h-5" />
              <p class="pt-2 text-2xl font-semibold tracking-display">
                6.793 <span class="text-sm font-medium text-muted-foreground">kg</span>
              </p>
              <p class="text-xs text-muted-foreground">
                Produksi telur · 4 Nov
              </p>
            </div>
            <svg width="96" height="36" viewBox="0 0 96 36" aria-hidden="true">
              <path d="M2 28 L14 24 L26 26 L38 18 L50 20 L62 12 L74 15 L86 8 L94 10" fill="none" stroke="var(--chart-1)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <circle cx="94" cy="10" r="3.5" fill="var(--chart-1)" stroke="var(--card)" stroke-width="2" />
            </svg>
          </div>
        </div>
      </article>

      <!-- 04 · Essence -->
      <article class="flex min-h-60 flex-col justify-between bg-card p-7">
        <span class="eyebrow text-muted-foreground">04 · Esensi</span>
        <p class="text-[1.875rem] font-semibold leading-[1.1] tracking-display text-balance">
          Pelayanan prima. Produk bermutu. Mitra terpercaya.
        </p>
        <p class="text-xs text-muted-foreground">
          Tagline aapm.co.id · tenang, hangat, tanpa hiperbola
        </p>
      </article>

      <!-- 05 · Color: Brand Core only -->
      <article class="flex min-h-60 flex-col gap-5 bg-card p-7">
        <span class="eyebrow text-muted-foreground">05 · Brand Core</span>
        <ul class="grid gap-3">
          <li v-for="c in core" :key="c.hex" class="flex items-center gap-3">
            <span class="size-8 shrink-0 rounded-md border" :style="{ background: c.hex }" />
            <span class="min-w-0 flex-1">
              <span class="block text-sm font-medium">{{ c.name }}</span>
              <span class="block truncate text-xs text-muted-foreground">{{ c.role }}</span>
            </span>
            <span class="font-mono text-xs text-muted-foreground">{{ c.hex }}</span>
          </li>
        </ul>
      </article>

      <!-- 06 · Typography -->
      <article class="flex min-h-60 flex-col justify-between bg-card p-7">
        <span class="eyebrow text-muted-foreground">06 · Tipografi</span>
        <div class="flex items-end justify-between gap-4">
          <p class="text-[5.5rem] font-semibold leading-none tracking-display">
            Aa
          </p>
          <div class="space-y-1 pb-2 text-right text-xs text-muted-foreground">
            <p class="text-sm font-semibold text-foreground">
              Plus Jakarta Sans
            </p>
            <p>Tokotype, Jakarta · 400–700</p>
            <p class="font-mono">
              JetBrains Mono · SO-2611-0142
            </p>
          </div>
        </div>
        <p class="text-xs text-muted-foreground numeric">
          0123456789 · Rp 482.650.000 · 92,4%
        </p>
      </article>

      <!-- 07 · Physical application: egg-tray label (always white, like the real print) -->
      <article class="flex min-h-60 flex-col gap-5 bg-card p-7">
        <span class="eyebrow text-muted-foreground">07 · Label peti telur</span>
        <div class="w-full max-w-[17rem] rounded-md border border-neutral-300 bg-white p-4 text-neutral-900">
          <div class="flex items-center justify-between border-b border-neutral-200 pb-2.5">
            <img src="/brand/aapm-logo.svg" alt="" class="h-6 w-auto">
            <span class="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Grade A</span>
          </div>
          <dl class="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
            <dt class="text-neutral-500">
              Isi
            </dt>
            <dd class="text-right font-semibold">
              15 kg
            </dd>
            <dt class="text-neutral-500">
              Kandang
            </dt>
            <dd class="text-right font-semibold">
              B2
            </dd>
            <dt class="text-neutral-500">
              Produksi
            </dt>
            <dd class="text-right font-mono">
              04/11/2026
            </dd>
          </dl>
        </div>
      </article>

      <!-- 08 · Iconography -->
      <article class="flex min-h-60 flex-col gap-5 bg-card p-7">
        <span class="eyebrow text-muted-foreground">08 · Ikon</span>
        <div class="grid grid-cols-4 gap-y-5 text-foreground/80">
          <AapmIcon v-for="g in glyphs" :key="g" :name="g" :size="24" :label="g" />
        </div>
        <p class="mt-auto text-xs text-muted-foreground">
          Lucide, satu stroke 1,75 · selalu disertai teks
        </p>
      </article>

      <!-- 09 · System detail -->
      <article class="flex min-h-60 flex-col gap-5 bg-card p-7">
        <span class="eyebrow text-muted-foreground">09 · Status & aksi</span>
        <div class="flex flex-wrap gap-1.5">
          <span v-for="s in statuses" :key="s.label" class="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold" :class="s.cls">
            <AapmIcon :name="s.icon" :size="13" />
            {{ s.label }}
          </span>
        </div>
        <div class="mt-auto flex flex-wrap items-center gap-2">
          <Button size="sm">
            <AapmIcon name="submit" :size="16" />
            Ajukan
          </Button>
          <Button size="sm" variant="outline">
            <AapmIcon name="save" :size="16" />
            Simpan draft
          </Button>
        </div>
      </article>
    </div>
  </section>
</template>
