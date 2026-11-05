<script setup lang="ts">
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
      <BrandBoard class="animate-rise" />
      <SystemSpecimen class="animate-rise rise-stagger" style="--rise-index: 2" />
    </div>
  </BasicPage>
</template>
