import { defineStore } from 'pinia'
import type { User, AuthState } from '~/types/auth'

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
  },

  actions: {
    async checkAuth() {
      if (this.loading) return

      this.loading = true
      this.error = null

      try {
        const data = await $fetch<{ user: User | null }>('/api/auth/session')
        this.user = data.user
      } catch (error) {
        console.error('Auth check failed:', error)
        this.user = null
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.loading = true
      this.error = null

      try {
        await $fetch('/api/auth/logout', { method: 'POST' })
        this.user = null

        if (process.client) {
          window.location.href = '/login'
        }
      } catch (error) {
        console.error('Logout failed:', error)
        this.error = 'Failed to logout'
      } finally {
        this.loading = false
      }
    },

    setUser(user: User | null) {
      this.user = user
    },

    clearError() {
      this.error = null
    },
  },
})
