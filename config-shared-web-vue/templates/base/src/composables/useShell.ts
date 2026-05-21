import { ref } from 'vue'

const sidebarOpen = ref(true)
const mobileSidebarOpen = ref(false)

export function useShell() {
  function toggleSidebar() {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      mobileSidebarOpen.value = !mobileSidebarOpen.value
      return
    }
    sidebarOpen.value = !sidebarOpen.value
  }

  function closeMobileSidebar() {
    mobileSidebarOpen.value = false
  }

  return {
    sidebarOpen,
    mobileSidebarOpen,
    toggleSidebar,
    closeMobileSidebar,
  }
}
