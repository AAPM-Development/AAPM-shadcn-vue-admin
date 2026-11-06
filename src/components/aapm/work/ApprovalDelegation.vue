<script setup lang="ts">
import type { Approver, Blocker, Delegation } from '@/design-system/contracts'

import AapmIcon from '@/components/aapm/icon/AapmIcon.vue'

import BlockerList from './BlockerList.vue'

/**
 * Approval & delegation (ERP PC09): the effective approver chain and active delegations, as computed
 * by the server. No eligible approver is a blocker with a resolution path, never a silent override.
 */
defineProps<{ approvers: Approver[], delegations?: Delegation[] }>()

const NO_APPROVER: Blocker = {
  code: 'NO-APPROVER',
  title: 'Tidak ada approver yang berwenang',
  reason: 'Belum ada pengguna dengan wewenang menyetujui dokumen ini di perusahaan aktif.',
  resolution: 'Minta admin perusahaan menetapkan approver atau delegasi sementara.',
}
const day = (d: Date | number) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' })
</script>

<template>
  <div class="grid min-w-0 gap-3">
    <ul v-if="delegations?.length" class="grid gap-2" aria-label="Delegasi aktif">
      <li v-for="d in delegations" :key="`${d.delegator}-${d.delegate}`" data-tone="blue" class="flex min-w-0 gap-2 rounded-lg border border-(--tone-border) bg-(--tone-bg) p-3 text-sm">
        <AapmIcon name="userCheck" :size="16" class="mt-0.5 shrink-0 text-(--tone-fg)" />
        <p class="min-w-0 wrap-anywhere">
          <span class="font-semibold">{{ d.delegator }}</span> mendelegasikan ke <span class="font-semibold">{{ d.delegate }}</span>
          · {{ d.scope }} · {{ day(d.from) }} – {{ day(d.to) }}
        </p>
      </li>
    </ul>

    <ol v-if="approvers.length" class="grid gap-2" aria-label="Approver efektif">
      <li v-for="(a, i) in approvers" :key="a.name" class="flex min-w-0 items-center gap-3 rounded-lg border p-3 text-sm">
        <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold numeric">{{ i + 1 }}</span>
        <span class="grid min-w-0 wrap-anywhere">
          <span class="font-semibold">{{ a.name }}</span>
          <span class="text-xs text-muted-foreground">{{ a.role }}<template v-if="a.onBehalfOf"> · atas nama {{ a.onBehalfOf }}</template></span>
        </span>
      </li>
    </ol>
    <BlockerList v-else :blockers="[NO_APPROVER]" />
  </div>
</template>
