// List all users (admin only)

import { requireAdmin } from '~/server/utils/session'
import { getDB, query } from '~/server/utils/db-dev'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const db = await getDB(event)

  const users = await query(
    db,
    `SELECT id, email, name, avatar_url, role, created_at, last_login_at FROM users ORDER BY created_at DESC`
  )

  return {
    users: users.map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      avatarUrl: u.avatar_url,
      role: u.role,
      createdAt: u.created_at,
      lastLoginAt: u.last_login_at,
    })),
  }
})
