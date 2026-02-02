// Extension authentication endpoint
// Receives a Google access token from chrome.identity.getAuthToken(),
// verifies it via Google's userinfo endpoint, checks domain,
// and returns a bearer session token.

import { getDB, queryOne, execute, uuid } from '~/server/utils/db-dev'

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
  const body = await readBody(event)
  const { token } = body

  if (!token) {
    throw createError({ statusCode: 400, message: 'Missing token' })
  }

  try {
    // chrome.identity.getAuthToken() returns an OAuth2 access token (not ID token)
    // Verify it by calling Google's userinfo endpoint
    const userInfo = await $fetch<GoogleUserInfo>(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (!userInfo.email) {
      throw createError({ statusCode: 401, message: 'Could not retrieve email from Google' })
    }

    if (userInfo.email_verified === false || userInfo.verified_email === false) {
      throw createError({ statusCode: 401, message: 'Email not verified' })
    }

    // Restrict to @applivery.com
    const ALLOWED_DOMAIN = 'applivery.com'
    const emailDomain = userInfo.email.split('@')[1]?.toLowerCase()
    if (emailDomain !== ALLOWED_DOMAIN) {
      throw createError({ statusCode: 403, message: 'Access restricted to @applivery.com' })
    }

    const googleId = userInfo.sub || userInfo.id || ''
    const db = await getDB(event)

    // Find or create user
    let user = await queryOne<{ id: string; role: string }>(
      db,
      `SELECT id, role FROM users WHERE email = ?`,
      [userInfo.email]
    )

    if (!user) {
      const userId = uuid()
      await execute(
        db,
        `INSERT INTO users (id, email, name, avatar_url, google_id, role, created_at, last_login_at)
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [userId, userInfo.email, userInfo.name || userInfo.email.split('@')[0], userInfo.picture || '', googleId, 'regular']
      )
      user = { id: userId, role: 'regular' }
    } else {
      await execute(
        db,
        `UPDATE users SET last_login_at = datetime('now'), google_id = COALESCE(NULLIF(google_id, ''), ?) WHERE id = ?`,
        [googleId, user.id]
      )
    }

    // Create session and return bearer token
    const sessionId = uuid()
    const sessionToken = uuid()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    await execute(
      db,
      `INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)`,
      [sessionId, user.id, sessionToken, expiresAt]
    )

    return {
      success: true,
      token: sessionToken,
      user: {
        id: user.id,
        email: userInfo.email,
        name: userInfo.name,
        avatarUrl: userInfo.picture,
        role: user.role,
      },
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Extension auth error:', error)
    throw createError({ statusCode: 401, message: 'Authentication failed' })
  }
})
