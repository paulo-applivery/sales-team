// Return current user from session

import { getSession } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const user = await getSession(event)
  return { user }
})
