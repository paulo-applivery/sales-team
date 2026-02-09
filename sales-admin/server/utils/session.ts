// Session management utilities

import { type H3Event, getCookie, setCookie, deleteCookie, createError } from 'h3'
import { getDB, query, queryOne, execute, uuid } from './db-dev'
import type { User } from '~/types/auth'

const SESSION_COOKIE_NAME = 'sales_admin_session'
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days

/**
 * Create a new session
 */
export async function createSession(event: H3Event, userId: string): Promise<string> {
  const db = await getDB(event)
  const sessionId = uuid()
  const token = uuid()
  const expiresAt = new Date(Date.now() + SESSION_DURATION).toISOString()

  await execute(
    db,
    `INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)`,
    [sessionId, userId, token, expiresAt]
  )

  // Set cookie with the token
  setCookie(event, SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/',
  })

  return token
}

/**
 * Get user from session (cookie or bearer token)
 */
export async function getSession(event: H3Event): Promise<User | null> {
  // Check cookie first, then Authorization header (for extension bearer tokens)
  let token = getCookie(event, SESSION_COOKIE_NAME)

  if (!token) {
    const authHeader = event.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7)
    }
  }

  if (!token) {
    return null
  }

  const db = await getDB(event)

  const result = await queryOne<{
    user_id: string
    email: string
    name: string
    avatar_url: string
    google_id: string
    role: string
    created_at: string
    last_login_at: string
  }>(
    db,
    `SELECT
      s.user_id,
      u.email,
      u.name,
      u.avatar_url,
      u.google_id,
      u.role,
      u.created_at,
      u.last_login_at
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ? AND s.expires_at > datetime('now')`,
    [token]
  )

  if (!result) {
    deleteCookie(event, SESSION_COOKIE_NAME)
    return null
  }

  // Update last activity
  await execute(
    db,
    `UPDATE sessions SET last_activity_at = datetime('now') WHERE token = ?`,
    [token]
  )

  return {
    id: result.user_id,
    email: result.email,
    name: result.name,
    avatarUrl: result.avatar_url,
    googleId: result.google_id,
    role: result.role as 'admin' | 'regular',
    createdAt: result.created_at,
    lastLoginAt: result.last_login_at,
  }
}

/**
 * Delete session (logout)
 */
export async function deleteSession(event: H3Event): Promise<void> {
  const token = getCookie(event, SESSION_COOKIE_NAME)

  if (token) {
    const db = await getDB(event)
    await execute(db, `DELETE FROM sessions WHERE token = ?`, [token])
    deleteCookie(event, SESSION_COOKIE_NAME)
  }
}

/**
 * Require authentication (throws error if not authenticated)
 */
export async function requireAuth(event: H3Event): Promise<User> {
  const user = await getSession(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized - Please sign in',
    })
  }

  return user
}

/**
 * Require admin role
 */
export async function requireAdmin(event: H3Event): Promise<User> {
  const user = await requireAuth(event)

  if (user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      message: 'Forbidden - Admin access required',
    })
  }

  return user
}
