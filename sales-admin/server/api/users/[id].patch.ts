// Update user role (admin only)

import { requireAdmin } from '~/server/utils/session'
import { getDB, execute } from '~/server/utils/db-dev'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) {
    throw createError({ statusCode: 400, message: 'Missing user ID' })
  }

  // Prevent self-demotion
  if (id === admin.id && body.role !== 'admin') {
    throw createError({ statusCode: 400, message: 'Cannot change your own role' })
  }

  if (body.role && !['admin', 'regular'].includes(body.role)) {
    throw createError({ statusCode: 400, message: 'Invalid role' })
  }

  const db = await getDB(event)

  if (body.role) {
    await execute(db, `UPDATE users SET role = ? WHERE id = ?`, [body.role, id])
  }

  return { success: true }
})
