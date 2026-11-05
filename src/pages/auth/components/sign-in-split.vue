<script setup lang="ts">
import { PauseIcon, PlayIcon } from '@lucide/vue'

import AnimatedBrandMark from '@/components/aapm/animated-brand-mark.vue'
import BrandBumper from '@/components/aapm/brand-bumper.vue'
import Reveal from '@/components/aapm/motion/reveal.vue'

import AuthTitle from './auth-title.vue'
import LoginForm from './login-form.vue'

const paused = shallowRef(false)

/**
 * The AAPM sign-in: two columns. Left = the green brand bumper (farm.aapm.co.id); right = the form. Below lg the brand panel collapses to the title above the form.
 */
</script>

<template>
  <div data-aapm-auth :data-motion-paused="paused || undefined" class="relative grid min-h-dvh w-full lg:grid-cols-2">
    <!-- Brand panel = the green bumper of farm.aapm.co.id (egg orb + words that rise in) -->
    <BrandBumper
      size="panel" class="hidden lg:block"
      identity
      words="Selamat datang / kembali."
    >
      <template #identity>
        <h1 class="flex">
          <AnimatedBrandMark variant="erp-stacked" :paused="paused" on-dark class="aapm-bumper-mark" />
        </h1>
      </template>
      <template #bottom>
        <p class="aapm-auth-powered flex items-center justify-center gap-3 text-sm font-semibold text-white">
          Powered by
          <img src="/brand/aapm-powered-white.svg" alt="AAPM" width="112" height="26" class="h-[26px] w-auto">
        </p>
      </template>
    </BrandBumper>

    <main class="flex min-w-0 items-center justify-center px-4 py-12 sm:px-8">
      <div class="grid w-full min-w-0 max-w-[22rem] grid-cols-1 gap-8 wrap-anywhere">
        <AuthTitle :paused="paused" class="lg:hidden" />
        <Reveal>
          <LoginForm class="border-0 shadow-none" />
        </Reveal>
      </div>
    </main>
    <button
      type="button" class="auth-motion-control absolute bottom-2 right-2 flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      :aria-label="paused ? 'Lanjutkan animasi' : 'Jeda animasi'" :aria-pressed="paused" @click="paused = !paused"
    >
      <component :is="paused ? PlayIcon : PauseIcon" :size="14" aria-hidden="true" />
    </button>
  </div>
</template>

<style>
[data-aapm-auth][data-motion-paused] :is([data-aapm-bumper], [data-aapm-animated-brand]) *,
[data-aapm-auth][data-motion-paused] :is([data-aapm-bumper], [data-aapm-animated-brand])::before,
[data-aapm-auth][data-motion-paused] :is([data-aapm-bumper], [data-aapm-animated-brand]) *::before,
[data-aapm-auth][data-motion-paused] :is([data-aapm-bumper], [data-aapm-animated-brand]) *::after {
  animation-play-state: paused !important;
}
@media (prefers-reduced-motion: reduce) {
  .auth-motion-control {
    display: none;
  }
}
</style>
