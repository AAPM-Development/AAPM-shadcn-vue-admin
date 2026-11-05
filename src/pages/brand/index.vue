<script setup lang="ts">
import Reveal from '@/components/aapm/motion/reveal.vue'
import { BasicPage } from '@/components/global-layout'

import BrandBoard from './components/brand-board.vue'
import SystemSpecimen from './components/system-specimen.vue'
</script>

<template>
  <BasicPage
    overline="Sistem · AAPM UI"
    title="Brand & design system"
    description="Logo dan warna mengikuti Brand Design canonical AAPM_Ecosystem. Token, tipografi, ikon, dan palet data di bawah adalah ekspresi produk untuk aplikasi internal."
  >
    <div class="grid gap-8">
      <Reveal>
        <BrandBoard />
      </Reveal>
      <Reveal :index="2">
        <SystemSpecimen />
      </Reveal>
    </div>
  </BasicPage>
</template>
