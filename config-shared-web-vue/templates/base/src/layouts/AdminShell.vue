<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import SidebarMenu from '@/components/SidebarMenu.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useShell } from '@/composables/useShell'
import {
  DEFAULT_SHELL_MAIN_ITEM,
  DEFAULT_SHELL_SECTIONS,
  type SidebarMenuItem,
  type SidebarMenuSection,
} from '@/config/shell-navigation'

withDefaults(
  defineProps<{
    appName?: string
    userName?: string
    userEmail?: string
    mainItem?: SidebarMenuItem
    sections?: SidebarMenuSection[]
  }>(),
  {
    appName: '__APP_NAME__',
    userName: 'Usuario',
    userEmail: 'usuario@aplicacao.local',
    mainItem: () => DEFAULT_SHELL_MAIN_ITEM,
    sections: () => DEFAULT_SHELL_SECTIONS,
  },
)

const { sidebarOpen, mobileSidebarOpen, toggleSidebar, closeMobileSidebar } = useShell()
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <div class="flex min-h-screen">
      <aside
        class="hidden border-r border-border bg-card lg:flex lg:flex-col"
        :class="sidebarOpen ? 'w-72' : 'w-18'"
      >
        <div
          class="flex h-16 border-b border-border"
          :class="sidebarOpen ? 'items-center gap-2 px-4' : 'items-center justify-center px-2'"
        >
          <RouterLink to="/dashboard" aria-label="Ir para dashboard" class="flex items-center gap-2" :class="{ 'justify-center': !sidebarOpen }">
            <div class="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-xs font-bold text-primary">AP</div>
            <div v-if="sidebarOpen" class="truncate text-sm font-semibold">{{ appName }}</div>
          </RouterLink>
        </div>
        <div class="flex-1 overflow-y-auto">
          <SidebarMenu :main-item="mainItem" :sections="sections" :collapsed="!sidebarOpen" />
        </div>
      </aside>

      <div v-if="mobileSidebarOpen" class="fixed inset-0 z-40 bg-black/50 lg:hidden" @click="closeMobileSidebar" />
      <aside
        v-if="mobileSidebarOpen"
        class="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card lg:hidden"
      >
        <div class="flex h-16 items-center gap-2 border-b border-border px-4">
          <RouterLink to="/dashboard" class="flex items-center gap-2 text-sm font-semibold" @click="closeMobileSidebar">
            <span class="flex size-8 items-center justify-center rounded-md bg-primary/15 text-xs font-bold text-primary">AP</span>
            <span>{{ appName }}</span>
          </RouterLink>
        </div>
        <div class="flex-1 overflow-y-auto">
          <SidebarMenu :main-item="mainItem" :sections="sections" @navigate="closeMobileSidebar" />
        </div>
      </aside>

      <div class="flex min-h-screen flex-1 flex-col">
        <header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur md:px-6">
          <button
            type="button"
            aria-label="Alternar menu lateral"
            class="inline-flex size-9 items-center justify-center rounded-md hover:bg-accent"
            @click="toggleSidebar"
          >
            ☰
          </button>
          <div class="flex items-center gap-2">
            <button type="button" aria-label="Notificações" class="inline-flex size-9 items-center justify-center rounded-md hover:bg-accent">🔔</button>
            <button type="button" class="inline-flex h-auto items-center gap-2 rounded-md px-2.5 py-1.5 hover:bg-accent">
              <span class="flex size-8 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">👤</span>
              <span class="hidden min-w-0 flex-col items-start text-left md:flex">
                <span class="max-w-35 truncate text-sm leading-4">{{ userName }}</span>
                <span class="max-w-35 truncate text-xs text-muted-foreground">{{ userEmail }}</span>
              </span>
            </button>
          </div>
        </header>

        <main class="flex-1 p-4 md:p-6">
          <RouterView />
        </main>

        <AppFooter :app-name="appName" />
      </div>
    </div>
  </div>
</template>
