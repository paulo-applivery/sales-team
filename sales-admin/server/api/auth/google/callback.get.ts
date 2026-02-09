// Google OAuth callback handler

import { getDB, queryOne, execute, uuid } from '~/server/utils/db-dev'
import { createSession } from '~/server/utils/session'
import { getAppConfig } from '~/server/utils/env'

interface GoogleTokenResponse {
  access_token: string
  expires_in: number
  refresh_token?: string
  scope: string
  token_type: string
  id_token: string
}

interface GoogleUserInfo {
  sub?: string
  id?: string
  email: string
  email_verified?: boolean
  verified_email?: boolean
  name: string
  picture: string
  given_name?: string
  family_name?: string
}

export default defineEventHandler(async (event) => {
  const appConfig = getAppConfig(event)
  const query = getQuery(event)

  const code = query.code as string | undefined
  const state = query.state as string | undefined
  const error = query.error as string | undefined

  if (error) {
    return sendRedirect(event, `/login?error=${encodeURIComponent(error)}`, 302)
  }

  if (!code || !state) {
    return sendRedirect(event, '/login?error=invalid_request', 302)
  }

  // Validate CSRF state
  const storedState = getCookie(event, 'google_oauth_state')
  deleteCookie(event, 'google_oauth_state')

  if (state !== storedState) {
    return sendRedirect(event, '/login?error=invalid_state', 302)
  }

  try {
    // Exchange code for access token
    const tokenResponse = await $fetch<GoogleTokenResponse>('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: appConfig.googleClientId,
        client_secret: appConfig.googleClientSecret,
        redirect_uri: appConfig.googleRedirectUri,
        grant_type: 'authorization_code',
      }),
    })

    const accessToken = tokenResponse.access_token
    if (!accessToken) {
      throw new Error('No access token received from Google')
    }

    // Get user info
    const userInfo = await $fetch<GoogleUserInfo>('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!userInfo.email_verified && !userInfo.verified_email) {
      return sendRedirect(event, '/login?error=email_not_verified', 302)
    }

    // Restrict to @applivery.com
    const ALLOWED_DOMAIN = 'applivery.com'
    const emailDomain = userInfo.email.split('@')[1]?.toLowerCase()
    if (emailDomain !== ALLOWED_DOMAIN) {
      console.warn(`[AUTH] Google login rejected for ${userInfo.email} - not @${ALLOWED_DOMAIN}`)
      return sendRedirect(event, `/login?error=${encodeURIComponent('org_membership_required')}`, 302)
    }

    const db = await getDB(event)
    const googleId = userInfo.sub || userInfo.id || ''

    // Check if user exists
    const existingUser = await queryOne<{ id: string }>(
      db,
      `SELECT id FROM users WHERE email = ?`,
      [userInfo.email]
    )

    let userId: string

    if (existingUser) {
      userId = existingUser.id
      await execute(
        db,
        `UPDATE users SET name = ?, avatar_url = ?, google_id = ?, last_login_at = datetime('now') WHERE id = ?`,
        [userInfo.name || userInfo.email.split('@')[0], userInfo.picture || '', googleId, userId]
      )
    } else {
      userId = uuid()
      await execute(
        db,
        `INSERT INTO users (id, email, name, avatar_url, google_id, role, created_at, last_login_at)
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [
          userId,
          userInfo.email,
          userInfo.name || userInfo.email.split('@')[0],
          userInfo.picture || '',
          googleId,
          'regular',
        ]
      )
    }

    // Create session
    await createSession(event, userId)

    return sendRedirect(event, '/', 302)
  } catch (error: any) {
    console.error('Google OAuth error:', error)
    const errorMessage = error?.message || 'authentication_failed'
    return sendRedirect(event, `/login?error=${encodeURIComponent(errorMessage)}`, 302)
  }
})
