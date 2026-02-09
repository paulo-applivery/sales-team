// Save settings (admin only)

import { requireAdmin } from '~/server/utils/session'
import { getDB, execute, uuid } from '~/server/utils/db-dev'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)
  const { category, data } = body

  if (!category || !data) {
    throw createError({ statusCode: 400, message: 'Missing category or data' })
  }

  if (!['prompts', 'api_config'].includes(category)) {
    throw createError({ statusCode: 400, message: 'Invalid category' })
  }

  const db = await getDB(event)
  const jsonData = JSON.stringify(data)

  // Upsert settings
  try {
    await execute(
      db,
      `INSERT INTO settings (id, category, data, updated_at) VALUES (?, ?, ?, datetime('now'))
       ON CONFLICT(category) DO UPDATE SET data = ?, updated_at = datetime('now')`,
      [uuid(), category, jsonData, jsonData]
    )
  } catch {
    // Fallback for older SQLite that may not support ON CONFLICT
    const existing = await db.prepare(`SELECT id FROM settings WHERE category = ?`).bind(category).first()
    if (existing) {
      await execute(db, `UPDATE settings SET data = ?, updated_at = datetime('now') WHERE category = ?`, [jsonData, category])
    } else {
      await execute(db, `INSERT INTO settings (id, category, data, updated_at) VALUES (?, ?, ?, datetime('now'))`, [uuid(), category, jsonData])
    }
  }

  return { success: true }
})
