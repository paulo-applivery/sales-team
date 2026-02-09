// Delete user (admin only)

import { requireAdmin } from '~/server/utils/session'
import { getDB, execute } from '~/server/utils/db-dev'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, message: 'Missing user ID' })
  }

  // Prevent self-deletion
  if (id === admin.id) {
    throw createError({ statusCode: 400, message: 'Cannot delete yourself' })
  }

  const db = await getDB(event)

  // Delete sessions first
  await execute(db, `DELETE FROM sessions WHERE user_id = ?`, [id])
  await execute(db, `DELETE FROM users WHERE id = ?`, [id])

  return { success: true }
})
