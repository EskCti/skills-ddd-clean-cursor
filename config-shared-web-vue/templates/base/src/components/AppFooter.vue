<script setup lang="ts">
defineProps<{
  appName?: string
}>()

const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-border bg-card/80 px-4 py-3 text-center text-xs text-muted-foreground md:px-6">
    <p>&copy; {{ year }} {{ appName ?? '__APP_NAME__' }}. Todos os direitos reservados.</p>
  </footer>
</template>
