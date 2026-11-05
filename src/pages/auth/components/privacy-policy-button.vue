<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <Button variant="link" class="h-auto max-w-full whitespace-normal px-0 font-normal underline text-muted-foreground wrap-anywhere">
    {{ $t('auth.privacy') }}
  </Button>
</template>
