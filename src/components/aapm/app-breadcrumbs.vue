<script setup lang="ts">
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { navData } from '@/constants/sidebar-data'
import { resolveBreadcrumbs } from '@/lib/breadcrumbs'

/** Current location from the sidebar model (UX-03). Hidden when the route is not in the nav. */
const route = useRoute()
const crumbs = computed(() => resolveBreadcrumbs(route.path, navData))
</script>

<template>
  <Breadcrumb v-if="crumbs.length" class="min-w-0">
    <BreadcrumbList class="flex-nowrap">
      <template v-for="(crumb, i) in crumbs" :key="`${i}-${crumb.title}`">
        <BreadcrumbItem class="min-w-0" :class="i < crumbs.length - 1 ? 'hidden lg:inline-flex' : ''">
          <BreadcrumbPage v-if="i === crumbs.length - 1" class="truncate font-medium">
            {{ crumb.title }}
          </BreadcrumbPage>
          <span v-else class="truncate text-muted-foreground">{{ crumb.title }}</span>
        </BreadcrumbItem>
        <BreadcrumbSeparator v-if="i < crumbs.length - 1" class="hidden lg:inline-flex" />
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>
