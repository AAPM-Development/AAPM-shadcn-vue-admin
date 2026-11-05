<script setup lang="ts">
import { toast } from 'vue-sonner'

import BrandMark from '@/components/aapm/brand-mark.vue'
import SessionCenter from '@/components/aapm/erp/session-center.vue'
import StateView from '@/components/aapm/erp/state-view.vue'
import AapmIcon from '@/components/aapm/icon/AapmIcon.vue'
import { shake } from '@/components/aapm/motion/motion-blur'
import { Button } from '@/components/ui/button'
import { PinInput, PinInputGroup, PinInputSlot } from '@/components/ui/pin-input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

import KitSection from './kit-section.vue'

/** ERP identity & session UI extension: company chooser, MFA, session center, no-access. */
const companies = [
  { id: 'aapm', name: 'PT Agung Abadi Putra Mandiri', role: 'Supervisor produksi', sites: 'Farm Payakumbuh · Gudang Pakan' },
  { id: 'pakan', name: 'PT AAPM — Unit Pakan', role: 'Hanya-baca', sites: 'Mixing & gudang pakan' },
]
const company = shallowRef('aapm')

const code = ref<string[]>([])
const otpRoot = useTemplateRef<HTMLElement>('otpRoot')
const otpError = shallowRef('')
async function verify() {
  if (code.value.join('') !== '246810') {
    otpError.value = 'Kode tidak cocok. Periksa aplikasi autentikator Anda.'
    await shake(otpRoot.value)
    return
  }
  otpError.value = ''
  toast.success('Terverifikasi', { description: 'Masuk ke PT Agung Abadi Putra Mandiri.' })
}
</script>

<template>
  <div class="grid gap-4 xl:grid-cols-2">
    <KitSection id="perusahaan" eyebrow="Identitas" title="Pilih perusahaan" description="Satu sesi browser = satu perusahaan. Berpindah memberi tahu tab lain; draft tidak pernah ikut pindah diam-diam.">
      <RadioGroup v-model="company" data-aapm-radio-cards class="grid gap-2">
        <label v-for="c in companies" :key="c.id" :for="`co-${c.id}`" class="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors duration-150 ease-aapm">
          <RadioGroupItem :id="`co-${c.id}`" :value="c.id" class="mt-0.5" />
          <span class="min-w-0">
            <span class="block text-sm font-semibold">{{ c.name }}</span>
            <span class="block text-xs text-muted-foreground">{{ c.role }} · {{ c.sites }}</span>
          </span>
        </label>
      </RadioGroup>
      <Button class="h-auto min-h-9 max-w-full justify-self-start whitespace-normal wrap-anywhere">
        Lanjut ke {{ companies.find(c => c.id === company)?.name }}
        <AapmIcon name="chevronRight" :size="16" />
      </Button>
    </KitSection>

    <KitSection id="mfa" eyebrow="Identitas" title="Verifikasi dua langkah" description="Slot aktif terangkat, angka meletup saat diisi; kode salah menggetarkan grup. Kode demo: 246810.">
      <div ref="otpRoot" class="grid justify-items-start gap-3">
        <BrandMark class="h-8" />
        <PinInput id="otp" v-model="code" placeholder="○" otp @complete="verify">
          <PinInputGroup>
            <PinInputSlot v-for="(id, index) in 6" :key="id" :index="index" />
          </PinInputGroup>
        </PinInput>
        <p v-if="otpError" data-slot="field-error" class="text-sm text-destructive">
          {{ otpError }}
        </p>
        <Button size="sm" variant="outline" @click="verify">
          Verifikasi
        </Button>
      </div>
    </KitSection>

    <KitSection id="sesi" eyebrow="Identitas" title="Session center" description="Sesi bukan perangkat. Lihat sesi ini, aktivitas terakhir, kedaluwarsa; cabut sesi lain dengan konfirmasi.">
      <SessionCenter />
    </KitSection>

    <KitSection id="tanpa-akses" eyebrow="Identitas" title="Tanpa akses" description="Penolakan dengan bahasa biasa dan jalan keluar yang aman, tanpa membocorkan isi.">
      <StateView state="forbidden" />
    </KitSection>
  </div>
</template>
