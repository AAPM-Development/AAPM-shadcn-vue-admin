<script setup lang="ts">
import { prefersReducedMotion } from '@/components/aapm/motion/easing'

/**
 * Brand bumper — a 1:1 port of farm.aapm.co.id's `.landing-bumper` (CSS values copied verbatim:
 * #0b3618 field, egg orb gradient + inner light/shade + neon halo, film grain, centred bold words).
 * Adaptations for the ERP:
 * 1. Lengths in vw/vh become container units (cqw/cqh), so the same composition holds inside a
 *    half-screen auth panel or a dashboard strip.
 * 2. `--progress` (scroll-scrubbed on the landing page) is driven by time here — an ERP screen must
 *    never pin the scroll: it rises to the landing page's resting state, then drifts slowly.
 * 3. The auth identity variant centres the official product lockup and keeps the egg in the corner.
 * `panel` = the landing composition (centred words, orb rising from below). `banner` = the same
 * materials in a compact, left-aligned strip for the dashboard.
 */
const props = withDefaults(defineProps<{
  /** Headline. Use " / " to split it into phrases (each phrase is one line, like the landing page). */
  words: string
  eyebrow?: string
  size?: 'panel' | 'banner'
  /** Auth identity: replace the headline with a centred official product lockup. */
  identity?: boolean
}>(), {
  eyebrow: undefined,
  size: 'banner',
  identity: false,
})

const root = useTemplateRef<HTMLElement>('root')
const shown = shallowRef(props.identity || prefersReducedMotion())
const phrases = computed(() => props.words.split(' / ').map(p => p.split(/\s+/).filter(Boolean)))
const plain = computed(() => props.words.replaceAll(' / ', ' '))
/** Running word index across phrases, for the stagger. */
const offset = (pi: number) => phrases.value.slice(0, pi).reduce((n, p) => n + p.length, 0)

onMounted(() => {
  if (shown.value || typeof IntersectionObserver === 'undefined' || !root.value) {
    shown.value = true
    return
  }
  const io = new IntersectionObserver((entries) => {
    if (entries.some(e => e.isIntersecting)) {
      shown.value = true
      io.disconnect()
    }
  }, { threshold: 0.35 })
  io.observe(root.value)
  onBeforeUnmount(() => io.disconnect())
})
</script>

<template>
  <section
    ref="root"
    data-aapm-bumper
    :data-size="size"
    :data-identity="identity || undefined"
    :data-shown="shown || undefined"
    class="relative isolate overflow-hidden text-white"
  >
    <div v-if="identity" class="aapm-orb aapm-orb-secondary" aria-hidden="true" />
    <div class="aapm-orb" aria-hidden="true" />
    <div class="aapm-bumper-copy">
      <slot name="top" />
      <div class="aapm-bumper-center">
        <slot name="identity" />
        <p v-if="eyebrow" class="eyebrow text-white/70">
          {{ eyebrow }}
        </p>
        <p v-if="!identity" class="aapm-bumper-words" :aria-label="plain">
          <span v-for="(phrase, pi) in phrases" :key="pi" class="aapm-phrase" aria-hidden="true">
            <span v-for="(word, wi) in phrase" :key="`${pi}-${wi}`" class="aapm-word" :style="{ '--aapm-i': offset(pi) + wi }">{{ word }}</span>
          </span>
        </p>
        <slot />
      </div>
      <slot name="bottom" />
    </div>
  </section>
</template>

<style>
/* ═══ Port of farm.aapm.co.id .landing-bumper (values verbatim; vw/vh → cqw/cqh, progress by time) ═══ */
@property --progress {
  syntax: '<number>';
  inherits: true;
  initial-value: 0.58;
}

[data-aapm-bumper] {
  --bumper: #0b3618;
  --landing-ease: cubic-bezier(0.16, 1, 0.3, 1);
  container-type: size;
  background: var(--bumper);
  color: rgb(255, 255, 255);
}
[data-aapm-bumper][data-size='banner'] {
  container-type: inline-size;
  min-height: 15rem;
  border-radius: var(--radius-shell, calc(var(--radius) + 6px));
}

/* Film grain (.landing-bumper-pin::before) */
[data-aapm-bumper]::before {
  content: '';
  position: absolute;
  inset: -10%;
  z-index: 2;
  pointer-events: none;
  opacity: 0.13;
  will-change: transform;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 .55'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
}

/* The egg orb (.landing-orb) */
[data-aapm-bumper] .aapm-orb {
  --rise: clamp(0, calc(var(--progress, 0) / 0.3), 1);
  --ease: calc(var(--rise) * (2 - var(--rise)));
  --drift: clamp(0, calc((var(--progress, 0) - 0.3) / 0.58), 1);
  --leave: clamp(0, calc((var(--progress, 0) - 0.86) / 0.14), 1);
  --x: -2cqw;
  position: absolute;
  left: 50%;
  top: 62%;
  width: max(91cqw, 78cqh);
  aspect-ratio: 5 / 6;
  border-radius: 50% / 56% 56% 44% 44%;
  overflow: hidden;
  pointer-events: none;
  background: linear-gradient(
    160deg,
    rgb(88, 198, 50),
    rgb(98, 223, 59) 42%,
    rgb(134, 232, 98) 72%,
    rgb(184, 239, 160)
  );
  box-shadow:
    rgba(255, 255, 255, 0.6) -26px -6px 46px -14px inset,
    rgba(16, 72, 18, 0.5) 34px 0 70px -24px inset,
    rgba(107, 236, 70, 0.32) 0 0 60px 8px,
    rgba(107, 236, 70, 0.12) 0 0 180px 40px;
  transform: translate(
      calc(-50% + var(--x) + 5cqw * (1 - var(--ease)) - 1.5cqw * var(--drift)),
      calc(-50% + 38cqh * (1 - var(--ease)) + 1.5cqh * var(--drift))
    )
    scale(calc(1 + 0.07 * var(--drift) + 0.35 * var(--leave)));
}
[data-aapm-bumper] .aapm-orb,
[data-aapm-bumper] .aapm-orb::after,
[data-aapm-bumper] .aapm-orb::before {
  will-change: transform;
}
[data-aapm-bumper] .aapm-orb::after,
[data-aapm-bumper] .aapm-orb::before {
  content: '';
  position: absolute;
  inset: -25%;
  pointer-events: none;
}
[data-aapm-bumper] .aapm-orb::before {
  background: radial-gradient(30% 26% at 30% 30%, rgba(58, 146, 30, 0.8), rgba(58, 146, 30, 0) 100%);
  transform: translate(calc(9% * var(--drift)), calc(5% * var(--drift)));
}
[data-aapm-bumper] .aapm-orb::after {
  background: radial-gradient(
    34% 30% at 66% 72%,
    rgb(240, 253, 236) 0,
    rgba(196, 244, 176, 0.9) 34%,
    rgba(150, 236, 110, 0) 100%
  );
  transform: translate(calc(-12% * var(--drift)), calc(-9% * var(--drift)));
}
@media (max-width: 899px) {
  [data-aapm-bumper] .aapm-orb {
    top: 66%;
  }
}

/* Copy (.landing-bumper-copy / -words / .landing-phrase / .landing-word) */
[data-aapm-bumper] .aapm-bumper-copy {
  position: relative;
  z-index: 1;
  display: grid;
  height: 100%;
  grid-template-rows: auto 1fr auto;
  padding: clamp(1.5rem, 4cqw, 2.5rem);
}
/* Panel (auth): words left-aligned in the upper half; the egg rises from the lower right corner,
 * partly cropped — the user's preferred placement — with the landing page's exact materials. */
[data-aapm-bumper][data-size='panel'] .aapm-bumper-center {
  display: grid;
  align-content: center;
  justify-items: start;
  gap: 1.25rem;
  max-width: 30rem;
}
[data-aapm-bumper][data-size='panel'] .aapm-phrase {
  justify-content: flex-start;
}
[data-aapm-bumper][data-size='panel'] .aapm-orb {
  left: auto;
  top: auto;
  right: -55%;
  bottom: -45%;
  width: 115%;
  transform: translate(
      calc(5cqw * (1 - var(--ease)) - 1.5cqw * var(--drift)),
      calc(38cqh * (1 - var(--ease)) + 1.5cqh * var(--drift))
    )
    scale(calc(1 + 0.07 * var(--drift) + 0.35 * var(--leave)));
}
[data-aapm-bumper] .aapm-bumper-words {
  display: grid;
  margin: 0;
  font-size: clamp(34px, 4.6cqw, 88px);
  line-height: 1.05;
  font-weight: 700;
  letter-spacing: -0.04em;
  text-shadow: rgba(11, 54, 24, 0.28) 0 1px 18px;
}
[data-aapm-bumper][data-size='panel'] .aapm-bumper-words {
  font-size: clamp(34px, 7.5cqw, 72px);
}
[data-aapm-bumper][data-identity] .aapm-bumper-copy {
  display: flex;
  flex-direction: column;
}
[data-aapm-bumper][data-identity] .aapm-bumper-center {
  flex: 1;
  justify-items: center;
  max-width: none;
  text-align: center;
  gap: 1.5rem;
}
[data-aapm-bumper] .aapm-bumper-mark {
  width: min(78cqw, 30rem);
  aspect-ratio: 70.14 / 28.76;
}
[data-aapm-bumper] .aapm-bumper-mark img {
  width: 100%;
  height: auto;
}
[data-aapm-bumper][data-identity] .aapm-orb {
  width: min(112cqw, 96cqh);
  right: 0;
  bottom: 0;
  transform: translate(68%, 64%) rotate(-8deg);
}
[data-aapm-bumper][data-identity] .aapm-orb-secondary {
  left: 0;
  top: 0;
  right: auto;
  bottom: auto;
  transform: translate(-68%, -64%) rotate(172deg);
}
[data-aapm-bumper] .aapm-phrase {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0 0.26em;
}
[data-aapm-bumper] .aapm-word {
  display: inline-block;
}

/* Banner: same materials, compact and left-aligned for the dashboard */
[data-aapm-bumper][data-size='banner'] .aapm-bumper-copy {
  grid-template-rows: 1fr;
}
[data-aapm-bumper][data-size='banner'] .aapm-bumper-center {
  display: grid;
  align-content: center;
  gap: 0.75rem;
  max-width: min(36rem, 62cqw);
}
[data-aapm-bumper][data-size='banner'] .aapm-bumper-words {
  font-size: clamp(26px, 3.4cqw, 44px);
}
[data-aapm-bumper][data-size='banner'] .aapm-phrase {
  justify-content: flex-start;
}
[data-aapm-bumper][data-size='banner'] .aapm-orb {
  --x: 0cqw;
  left: 82%;
  top: 55%;
  width: max(44cqw, 22rem);
}
@media (max-width: 40rem) {
  [data-aapm-bumper][data-size='banner'] .aapm-bumper-center {
    max-width: 100%;
  }
  [data-aapm-bumper][data-size='banner'] .aapm-orb {
    left: 96%;
    top: 30%;
    width: 18rem;
  }
}

@media (prefers-reduced-motion: no-preference) {
  [data-aapm-bumper]::before {
    animation: landing-grain 1s steps(8) infinite;
  }
  [data-aapm-bumper]:not([data-shown]) {
    --progress: 0;
  }
  /* rise to the landing page's resting state, then drift (never "leave") */
  [data-aapm-bumper][data-shown] {
    animation:
      aapm-bumper-rise 1800ms var(--landing-ease) both,
      aapm-bumper-drift 9s cubic-bezier(0.87, 0, 0.13, 1) 1800ms infinite alternate both;
  }
  /* The auth egg floats independently from the lockup and form. Separate transform properties
   * preserve the entrance transform while giving its contour a visible, unhurried motion. */
  /* On load the green panel fades in from the page (no hard cut), then each egg fades in on
   * its own beat. The fades use opacity only, so the float's translate/scale carry on untouched. */
  [data-aapm-bumper][data-identity][data-shown] {
    --progress: 0.58;
    animation: aapm-panel-in 900ms var(--landing-ease) both;
  }
  [data-aapm-bumper][data-identity][data-shown] .aapm-orb {
    animation:
      aapm-orb-in 1600ms var(--landing-ease) 250ms backwards,
      aapm-egg-float 12s cubic-bezier(0.37, 0, 0.63, 1) infinite alternate;
    transform-origin: center;
  }
  [data-aapm-bumper][data-identity][data-shown] .aapm-orb-secondary {
    animation:
      aapm-orb-in 1600ms var(--landing-ease) 450ms backwards,
      aapm-egg-float-top 16s cubic-bezier(0.25, 0.1, 0.65, 1) infinite alternate;
  }
  /* words rise in one by one (.landing-word: opacity .42s / transform .7s on the landing ease) */
  [data-aapm-bumper]:not([data-shown]) .aapm-word {
    opacity: 0;
    transform: translateY(0.4em);
  }
  [data-aapm-bumper][data-shown] .aapm-word {
    animation:
      aapm-word-fade 0.42s var(--landing-ease) backwards,
      aapm-word-lift 0.7s var(--landing-ease) backwards;
    animation-delay: calc(500ms + var(--aapm-i) * 90ms);
  }
}
@keyframes aapm-panel-in {
  from {
    opacity: 0;
  }
}
@keyframes aapm-orb-in {
  from {
    opacity: 0;
  }
}
@keyframes aapm-egg-float-top {
  from {
    translate: 0 0;
    scale: 1;
  }
  to {
    translate: 0.5cqw 0.35cqh;
    scale: 1.14;
  }
}
@keyframes aapm-egg-float {
  from {
    translate: 0 0;
    scale: 1;
  }
  to {
    translate: -0.7cqw -0.5cqh;
    scale: 1.18;
  }
}
@keyframes aapm-word-fade {
  from {
    opacity: 0;
  }
}
@keyframes aapm-word-lift {
  from {
    transform: translateY(0.4em);
  }
}
@keyframes landing-grain {
  0%,
  100% {
    transform: translate(0);
  }
  12% {
    transform: translate(-3%, 2%);
  }
  25% {
    transform: translate(2%, -4%);
  }
  37% {
    transform: translate(-5%, -1%);
  }
  50% {
    transform: translate(4%, 3%);
  }
  62% {
    transform: translate(-1%, 5%);
  }
  75% {
    transform: translate(5%, -2%);
  }
  87% {
    transform: translate(-4%, -5%);
  }
}
@keyframes aapm-bumper-rise {
  from {
    --progress: 0;
  }
  to {
    --progress: 0.58;
  }
}
@keyframes aapm-bumper-drift {
  from {
    --progress: 0.58;
  }
  to {
    --progress: 0.84;
  }
}
@media (forced-colors: active) {
  [data-aapm-bumper] .aapm-orb,
  [data-aapm-bumper]::before {
    display: none;
  }
}
</style>
