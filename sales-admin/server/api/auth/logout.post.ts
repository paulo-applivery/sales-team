// Logout - delete session

import { deleteSession } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  await deleteSession(event)
  return { success: true }
})
