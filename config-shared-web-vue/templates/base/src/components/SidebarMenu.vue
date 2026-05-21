<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import type { SidebarMenuItem, SidebarMenuSection } from '@/config/shell-navigation'

const props = defineProps<{
  mainItem?: SidebarMenuItem
  sections: SidebarMenuSection[]
  collapsed?: boolean
}>()

const emit = defineEmits<{ navigate: [] }>()
const route = useRoute()

function isActive(item: SidebarMenuItem) {
  if (item.match === 'exact') return route.path === item.to
  return route.path === item.to || route.path.startsWith(`${item.to}/`)
}

const itemClass = computed(
  () =>
    'group relative flex h-10 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
)
</script>

<template>
  <nav class="px-2 py-4">
    <div v-if="mainItem" class="space-y-1">
      <RouterLink
        :to="mainItem.to"
        :class="[itemClass, isActive(mainItem) && 'bg-accent text-accent-foreground', collapsed && 'justify-center px-2']"
        @click="emit('navigate')"
      >
        <span class="inline-flex size-4 shrink-0 items-center justify-center text-xs">⌂</span>
        <span v-if="!collapsed" class="truncate">{{ mainItem.label }}</span>
      </RouterLink>
      <div class="my-4 h-px bg-border" />
    </div>

    <div class="space-y-4">
      <div v-for="section in sections" :key="section.id">
        <p
          v-if="section.label"
          :class="collapsed ? 'sr-only' : 'px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground'"
        >
          {{ section.label }}
        </p>
        <div class="space-y-1">
          <RouterLink
            v-for="item in section.items"
            :key="item.id"
            :to="item.to"
            :aria-label="collapsed ? item.label : undefined"
            :class="[itemClass, isActive(item) && 'bg-accent text-accent-foreground', collapsed && 'justify-center px-2']"
            @click="emit('navigate')"
          >
            <span class="inline-flex size-4 shrink-0 items-center justify-center text-xs">•</span>
            <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
            <span
              v-if="collapsed"
              class="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 hidden -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground shadow-md group-hover:block"
            >
              {{ item.label }}
            </span>
          </RouterLink>
        </div>
      </div>
    </div>
  </nav>
</template>
