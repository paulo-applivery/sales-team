// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Cloudflare Pages compatibility
  nitro: {
    preset: 'cloudflare-pages',
    cloudflare: {
      pages: {
        routes: {
          exclude: ['/assets/*', '/_nuxt/*'],
        },
      },
    },
  },

  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],

  typescript: {
    strict: false,
    typeCheck: false,
    shim: false,
  },

  app: {
    head: {
      title: 'Sales Admin',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Admin dashboard for Sales Extension' },
        { name: 'robots', content: 'noindex, nofollow' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },

  runtimeConfig: {
    // Server-only (read from NUXT_ env vars at runtime)
    googleClientSecret: '',
    googleClientId: '',
    googleRedirectUri: '',
    appUrl: '',
    sessionSecret: '',
    geminiApiKey: '',

    // Public (client-side accessible, baked at build time)
    public: {
      googleClientId: '',
      googleRedirectUri: '',
      appUrl: '',
    },
  },

  css: [
    '~/assets/css/main.css',
  ],

  imports: {
    dirs: [
      'composables/**',
      'stores/**',
      'utils/**',
    ],
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  compatibilityDate: '2024-01-01',

  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: false,
  },
})
