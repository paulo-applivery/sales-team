// Get aggregated token usage stats (admin only)

import { requireAdmin } from '~/server/utils/session'
import { getDB, query } from '~/server/utils/db-dev'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const db = await getDB(event)
  const url = getRequestURL(event)
  const period = url.searchParams.get('period') || '30d'

  // Build date filter
  let dateFilter = ''
  if (period === '7d') {
    dateFilter = `AND tu.created_at >= datetime('now', '-7 days')`
  } else if (period === '30d') {
    dateFilter = `AND tu.created_at >= datetime('now', '-30 days')`
  }
  // 'all' = no filter

  // Aggregated stats per user
  const users = await query<{
    user_id: string
    name: string
    email: string
    total_requests: number
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
    total_cost: number
    last_used: string
  }>(
    db,
    `SELECT
      u.id as user_id,
      u.name,
      u.email,
      COUNT(tu.id) as total_requests,
      COALESCE(SUM(tu.prompt_tokens), 0) as prompt_tokens,
      COALESCE(SUM(tu.completion_tokens), 0) as completion_tokens,
      COALESCE(SUM(tu.total_tokens), 0) as total_tokens,
      COALESCE(SUM(tu.estimated_cost), 0) as total_cost,
      MAX(tu.created_at) as last_used
    FROM users u
    LEFT JOIN token_usage tu ON tu.user_id = u.id ${dateFilter}
    GROUP BY u.id
    ORDER BY total_cost DESC`
  )

  // Calculate totals
  const totals = users.reduce(
    (acc, u) => ({
      totalRequests: acc.totalRequests + (u.total_requests || 0),
      totalTokens: acc.totalTokens + (u.total_tokens || 0),
      promptTokens: acc.promptTokens + (u.prompt_tokens || 0),
      completionTokens: acc.completionTokens + (u.completion_tokens || 0),
      totalCost: acc.totalCost + (u.total_cost || 0),
    }),
    { totalRequests: 0, totalTokens: 0, promptTokens: 0, completionTokens: 0, totalCost: 0 }
  )

  return {
    period,
    users: users.map(u => ({
      id: u.user_id,
      name: u.name,
      email: u.email,
      totalRequests: u.total_requests || 0,
      promptTokens: u.prompt_tokens || 0,
      completionTokens: u.completion_tokens || 0,
      totalTokens: u.total_tokens || 0,
      totalCost: u.total_cost || 0,
      lastUsed: u.last_used || null,
    })),
    totals,
  }
})
