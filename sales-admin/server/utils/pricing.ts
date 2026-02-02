// Gemini pricing per 1M tokens (USD)
// Source: https://ai.google.dev/gemini-api/docs/pricing

export const GEMINI_PRICING: Record<string, { input: number; output: number }> = {
  'gemini-2.0-flash': { input: 0.10, output: 0.40 },
  'gemini-2.5-flash': { input: 0.30, output: 2.50 },
  'gemini-2.5-pro': { input: 1.25, output: 10.00 },
  'gemini-1.5-pro': { input: 1.25, output: 5.00 },
  'gemini-1.5-flash': { input: 0.075, output: 0.30 },
  'gemini-3-pro-preview': { input: 2.00, output: 12.00 },
  'gemini-3-flash-preview': { input: 0.50, output: 3.00 },
}

/**
 * Estimate cost in USD for a Gemini API call.
 * Falls back to gemini-2.0-flash pricing if model not found.
 */
export function estimateCost(model: string, promptTokens: number, completionTokens: number): number {
  // Try exact match first, then prefix match for versioned models
  let pricing = GEMINI_PRICING[model]
  if (!pricing) {
    const key = Object.keys(GEMINI_PRICING).find(k => model.startsWith(k))
    pricing = key ? GEMINI_PRICING[key] : GEMINI_PRICING['gemini-2.0-flash']
  }
  return (promptTokens * pricing.input + completionTokens * pricing.output) / 1_000_000
}
