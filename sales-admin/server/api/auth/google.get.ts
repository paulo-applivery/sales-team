// Google OAuth - Initiate OAuth flow

import { getAppConfig } from '~/server/utils/env'

export default defineEventHandler(async (event) => {
  const appConfig = getAppConfig(event)

  if (!appConfig.googleClientId || !appConfig.googleRedirectUri) {
    throw createError({
      statusCode: 500,
      message: 'Google OAuth not configured. Set NUXT_GOOGLE_CLIENT_ID and NUXT_GOOGLE_REDIRECT_URI.',
    })
  }

  // Generate random state for CSRF protection
  const state = crypto.randomUUID()

  setCookie(event, 'google_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })

  const params = new URLSearchParams({
    client_id: appConfig.googleClientId,
    redirect_uri: appConfig.googleRedirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'consent',
  })

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  return sendRedirect(event, googleAuthUrl, 302)
})
