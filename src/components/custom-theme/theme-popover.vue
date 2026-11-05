<script setup lang="ts">
import { PaintbrushIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import ContentLayout from './content-layout.vue'
import CustomColor from './custom-color.vue'
import CustomRadius from './custom-radius.vue'
import CustomThemeTitle from './custom-theme-title.vue'
import MenuStyle from './menu-style.vue'
import ToggleColorMode from './toggle-color-mode.vue'
import UiSound from './ui-sound.vue'
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button variant="outline" size="icon-sm" aria-label="Pengaturan tema" title="Pengaturan tema">
        <PaintbrushIcon />
      </Button>
    </PopoverTrigger>
    <PopoverContent align="end">
      <CustomThemeTitle />
      <CustomColor />
      <CustomRadius />
      <ToggleColorMode />
      <UiSound />
      <ContentLayout />
      <MenuStyle />
    </PopoverContent>
  </Popover>
</template>
