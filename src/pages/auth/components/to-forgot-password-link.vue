<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <Button variant="link" class="h-auto min-h-9 max-w-full whitespace-normal px-0 text-left text-muted-foreground wrap-anywhere" @click="$router.push('/auth/forgot-password')">
    {{ $t('forgotPassword') }}
  </Button>
</template>
