<template>
  <div class="login-page">
    <!-- Hero background animation -->
    <div class="login-hero-bg">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
      <div class="orb orb-4"></div>
    </div>

    <!-- Overlay -->
    <div class="login-overlay"></div>

    <!-- Content -->
    <div class="login-content">
      <!-- Left side - Branding -->
      <div class="login-branding">
        <div class="login-branding-inner">
          <div class="login-branding-text">
            <h1>Sales Admin</h1>
            <p>Manage your AI-powered sales extension. Configure prompts, API settings, and team access from one dashboard.</p>
          </div>

          <div class="login-features">
            <div class="login-feature">
              <div class="login-feature-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <div class="login-feature-text">
                <span class="title">AI Prompts</span>
                <span class="desc">Centralized prompt management</span>
              </div>
            </div>

            <div class="login-feature">
              <div class="login-feature-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <div class="login-feature-text">
                <span class="title">Team Access</span>
                <span class="desc">Role-based user management</span>
              </div>
            </div>

            <div class="login-feature">
              <div class="login-feature-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </svg>
              </div>
              <div class="login-feature-text">
                <span class="title">API Config</span>
                <span class="desc">Gemini model & parameter control</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right side - Login form -->
      <div class="login-form-wrapper">
        <div class="login-card">
          <div class="login-card-header">
            <div class="login-card-logo">Sales Admin</div>
            <h2 class="login-card-title">Welcome back</h2>
            <p class="login-card-subtitle">Sign in to manage your sales extension</p>
          </div>

          <div class="login-card-body">
            <!-- Error message -->
            <div v-if="error" class="login-error">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{{ errorMessage }}</p>
            </div>

            <!-- Google login button -->
            <button
              @click="loginWithGoogle"
              :disabled="loading"
              class="login-btn login-btn-google"
            >
              <svg v-if="!loading" class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ loading ? 'Signing in...' : 'Continue with Google' }}</span>
            </button>

            <div class="login-divider">
              <span>Secure authentication</span>
            </div>

            <div class="login-info-badges">
              <div class="login-info-badge">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>SSL Encrypted</span>
              </div>
              <div class="login-info-badge">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>OAuth 2.0</span>
              </div>
            </div>
          </div>

          <div class="login-card-footer">
            <p>Restricted to @applivery.com accounts</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const route = useRoute()
const authStore = useAuthStore()

onMounted(async () => {
  await authStore.checkAuth()
  if (authStore.isAuthenticated) {
    navigateTo('/')
  }
})

const error = computed(() => route.query.error as string | undefined)

const errorMessage = computed(() => {
  if (!error.value) return null
  const messages: Record<string, string> = {
    access_denied: 'Access denied. You cancelled the login or don\'t have permission.',
    invalid_request: 'Invalid request. Please try again.',
    invalid_state: 'Invalid state. Possible CSRF attempt. Please try again.',
    authentication_failed: 'Authentication failed. Please try again.',
    email_not_verified: 'Please verify your email address with Google first.',
    org_membership_required: 'Access restricted to @applivery.com accounts.',
  }
  return messages[error.value] || 'Something went wrong. Please try again.'
})

const loading = ref(false)

function loginWithGoogle() {
  loading.value = true
  window.location.href = '/api/auth/google'
}
</script>

<style scoped>
@import '../assets/css/login.css';
</style>
