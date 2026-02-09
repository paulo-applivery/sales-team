// Global auth middleware - protects all routes except login

export default defineNuxtRouteMiddleware(async (to) => {
  const publicRoutes = ['/login']

  if (publicRoutes.some(route => to.path.startsWith(route))) {
    return
  }

  if (process.server) {
    return
  }

  const authStore = useAuthStore()

  if (!authStore.user) {
    await authStore.checkAuth()
  }

  if (!authStore.isAuthenticated) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }
})
