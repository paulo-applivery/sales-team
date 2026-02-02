// Get all settings

import { requireAuth } from '~/server/utils/session'
import { getDB, query } from '~/server/utils/db-dev'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const db = await getDB(event)

  const rows = await query<{ category: string; data: string }>(
    db,
    `SELECT category, data FROM settings`
  )

  const settings: Record<string, any> = {}
  for (const row of rows) {
    try {
      settings[row.category] = JSON.parse(row.data)
    } catch {
      settings[row.category] = {}
    }
  }

  // Merge with defaults
  const defaults = {
    prompts: {
      principles: '',
      angles: [
        { id: 'problem-solution', name: 'Problem-Solution', prompt: 'Start by identifying their pain points, then present your solution as the answer.' },
        { id: 'social-proof', name: 'Social Proof', prompt: 'Lead with testimonials, metrics, or case studies to build credibility immediately.' },
        { id: 'question-based', name: 'Question-Based', prompt: 'Open with an engaging question that resonates with their challenges or goals.' },
      ],
      emailMaxWords: 200,
      linkedinMaxWords: 300,
    },
    api_config: {
      geminiApiKey: '',
      model: 'gemini-2.0-flash',
      temperature: 0.7,
      maxTokens: 1000,
    },
  }

  return {
    prompts: { ...defaults.prompts, ...settings.prompts },
    api_config: { ...defaults.api_config, ...settings.api_config },
  }
})
