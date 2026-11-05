<script setup lang="ts">
import { focusFirstInvalid, shake } from '@/components/aapm/motion/motion-blur'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/composables/use-auth'
import { AUTH_CONFIG } from '@/config/auth'

import GitHubButton from './github-button.vue'
import GoogleButton from './google-button.vue'
import PrivacyPolicyButton from './privacy-policy-button.vue'
import TermsOfServiceButton from './terms-of-service-button.vue'
import ToForgotPasswordLink from './to-forgot-password-link.vue'

const { login, loading } = useAuth()

/* Blocked sign-in: inline errors, focus the first invalid field, shake the card (UX-07). */
const formEl = useTemplateRef<HTMLFormElement>('formEl')
const email = shallowRef('')
const password = shallowRef('')
const emailError = shallowRef('')
const passwordError = shallowRef('')

async function submit() {
  emailError.value = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(email.value) ? '' : 'Masukkan email yang valid.'
  passwordError.value = password.value ? '' : 'Masukkan kata sandi.'
  if (emailError.value || passwordError.value) {
    await nextTick()
    focusFirstInvalid(formEl.value)
    await shake(formEl.value?.closest<HTMLElement>('[data-slot="card"]'))
    return
  }
  login()
}
</script>

<template>
  <Card class="w-full min-w-0 max-w-sm wrap-anywhere">
    <CardHeader class="min-w-0 grid-cols-1">
      <CardTitle class="text-2xl" data-display>
        {{ $t('auth.title') }}
      </CardTitle>
      <CardDescription>
        {{ $t('auth.subtitle') }}
      </CardDescription>
    </CardHeader>
    <CardContent class="grid min-w-0 grid-cols-1 gap-4">
      <form ref="formEl" class="grid min-w-0 grid-cols-1 gap-4" novalidate @submit.prevent="submit">
        <div class="grid min-w-0 grid-cols-1 gap-2">
          <Label for="email">
            {{ $t('email') }}
          </Label>
          <Input
            id="email" v-model="email" type="email" placeholder="nama@aapm.co.id" autocomplete="username" required
            :aria-invalid="emailError ? 'true' : undefined" aria-describedby="email-error"
          />
          <p v-if="emailError" id="email-error" data-slot="field-error" class="text-sm text-destructive">
            {{ emailError }}
          </p>
        </div>
        <div class="grid min-w-0 grid-cols-1 gap-2">
          <div class="flex min-w-0 flex-wrap items-center justify-between gap-2">
            <Label for="password">
              {{ $t('password') }}
            </Label>
            <ToForgotPasswordLink />
          </div>
          <Input
            id="password" v-model="password" type="password" required placeholder="*********" autocomplete="current-password"
            :aria-invalid="passwordError ? 'true' : undefined" aria-describedby="password-error"
          />
          <p v-if="passwordError" id="password-error" data-slot="field-error" class="text-sm text-destructive">
            {{ passwordError }}
          </p>
        </div>

        <Button type="submit" class="h-auto min-h-9 w-full whitespace-normal" :disabled="loading" :aria-busy="loading">
          <Spinner v-if="loading" class="mr-2" />
          {{ loading ? $t('auth.signingIn') : $t('auth.title') }}
        </Button>
      </form>

      <template v-if="AUTH_CONFIG.sso.github || AUTH_CONFIG.sso.google">
        <Separator :label="$t('auth.orContinue')" />

        <div class="flex flex-col items-center justify-between gap-4">
          <GitHubButton v-if="AUTH_CONFIG.sso.github" />
          <GoogleButton v-if="AUTH_CONFIG.sso.google" />
        </div>
      </template>

      <!-- Internal ERP: no self sign-up — accounts are provisioned by IT -->
      <CardDescription class="text-pretty">
        {{ $t('auth.access') }}
      </CardDescription>
      <CardDescription class="text-xs">
        {{ $t('auth.agree') }}
        <TermsOfServiceButton />
        {{ $t('auth.and') }}
        <PrivacyPolicyButton />
      </CardDescription>
    </CardContent>
  </Card>
</template>
