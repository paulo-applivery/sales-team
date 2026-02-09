// Environment variable utilities for Cloudflare Pages
// On CF Pages Workers, env vars are available on event.context.cloudflare.env
// NOT on process.env or via useRuntimeConfig() alone

import type { H3Event } from 'h3'

/**
 * Get an environment variable from Cloudflare Pages context,
 * falling back to process.env and runtimeConfig.
 */
export function getCfEnv(event: H3Event, key: string): string {
  // 1. Cloudflare Pages env (bindings + env vars set in dashboard)
  const cfVal = (event as any).context?.cloudflare?.env?.[key]
  if (cfVal && typeof cfVal === 'string') return cfVal

  // 2. process.env fallback (local dev)
  const procVal = process.env[key]
  if (procVal) return procVal

  return ''
}

/**
 * Get all OAuth/app config from environment.
 * Merges Cloudflare env, process.env, and runtimeConfig.
 */
export function getAppConfig(event: H3Event) {
  const config = useRuntimeConfig()

  return {
    googleClientId: getCfEnv(event, 'NUXT_GOOGLE_CLIENT_ID') || config.googleClientId || config.public.googleClientId || '',
    googleClientSecret: getCfEnv(event, 'NUXT_GOOGLE_CLIENT_SECRET') || config.googleClientSecret || '',
    googleRedirectUri: getCfEnv(event, 'NUXT_GOOGLE_REDIRECT_URI') || config.googleRedirectUri || config.public.googleRedirectUri || '',
    sessionSecret: getCfEnv(event, 'NUXT_SESSION_SECRET') || config.sessionSecret || '',
    geminiApiKey: getCfEnv(event, 'NUXT_GEMINI_API_KEY') || config.geminiApiKey || '',
    appUrl: getCfEnv(event, 'NUXT_APP_URL') || config.appUrl || config.public.appUrl || '',
  }
}
