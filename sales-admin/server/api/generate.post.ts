// Generate content proxy - calls Gemini API with server-side API key
// Accepts requests from both the dashboard (cookie auth) and extension (bearer token)

import { requireAuth } from '~/server/utils/session'
import { getDB, queryOne, execute, uuid } from '~/server/utils/db-dev'
import { estimateCost } from '~/server/utils/pricing'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const body = await readBody(event)
  const { systemInstruction, userMessage } = body

  if (!userMessage) {
    throw createError({ statusCode: 400, message: 'Missing userMessage' })
  }

  // Get API config from settings DB
  const db = await getDB(event)
  const settingsRow = await queryOne<{ data: string }>(
    db,
    `SELECT data FROM settings WHERE category = 'api_config'`
  )

  const apiConfig = settingsRow ? JSON.parse(settingsRow.data) : {}
  const apiKey = apiConfig.geminiApiKey || ''
  const model = apiConfig.model || 'gemini-2.0-flash'
  const temperature = apiConfig.temperature ?? 0.7
  const maxTokens = apiConfig.maxTokens ?? 1000

  if (!apiKey) {
    throw createError({ statusCode: 500, message: 'Gemini API key not configured in admin settings' })
  }

  // Build Gemini request
  const requestBody: Record<string, unknown> = {
    contents: [
      {
        role: 'user',
        parts: [{ text: userMessage }],
      },
    ],
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
      topP: 0.9,
    },
  }

  if (systemInstruction) {
    requestBody.systemInstruction = {
      parts: [{ text: systemInstruction }],
    }
  }

  // Use v1beta for systemInstruction or preview models, v1 otherwise
  const needsBeta = !!systemInstruction || model.includes('preview')
  const primaryVersion = needsBeta ? 'v1beta' : 'v1'
  const fallbackVersion = needsBeta ? 'v1' : 'v1beta'

  const makeRequest = async (apiVersion: string) => {
    return fetch(
      `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    )
  }

  try {
    let response = await makeRequest(primaryVersion)
    let lastErrorText = ''

    if (!response.ok) {
      lastErrorText = await response.text()
      let shouldRetry = false

      try {
        const errorData = JSON.parse(lastErrorText)
        const errMsg = errorData.error?.message || ''
        if (
          errMsg.includes('not found') ||
          errMsg.includes('not supported') ||
          errMsg.includes('Unknown name') ||
          errMsg.includes('Cannot find field') ||
          errorData.error?.status === 'NOT_FOUND' ||
          errorData.error?.status === 'INVALID_ARGUMENT'
        ) {
          shouldRetry = true
        }
      } catch {
        shouldRetry = true
      }

      if (shouldRetry) {
        response = await makeRequest(fallbackVersion)
        if (!response.ok) {
          lastErrorText = await response.text()
        }
      }

      if (!response.ok) {
        const error = JSON.parse(lastErrorText)
        throw new Error(error.error?.message || 'API request failed')
      }
    }

    const data = await response.json()
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Track token usage
    const usageMetadata = data.usageMetadata || {}
    const promptTokens = usageMetadata.promptTokenCount || 0
    const completionTokens = usageMetadata.candidatesTokenCount || 0
    const totalTokens = usageMetadata.totalTokenCount || 0
    const cost = estimateCost(model, promptTokens, completionTokens)

    // Save usage to database (fire-and-forget, don't block response)
    try {
      await execute(
        db,
        `INSERT INTO token_usage (id, user_id, model, prompt_tokens, completion_tokens, total_tokens, estimated_cost, request_type, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'generate', datetime('now'))`,
        [uuid(), user.id, model, promptTokens, completionTokens, totalTokens, cost]
      )
    } catch (err) {
      console.error('Failed to save token usage:', err)
    }

    // Parse variants
    const variants = generatedText.split(/---+|\n\nVARIANT \d+:?\n\n/i).filter((v: string) => v.trim())

    return {
      success: true,
      content: variants[0]?.trim() || generatedText.trim(),
      variants: variants.length > 1 ? variants.map((v: string) => v.trim()) : undefined,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens,
        estimatedCost: cost,
      },
    }
  } catch (error: any) {
    console.error('Generate error:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to generate content',
    })
  }
})
