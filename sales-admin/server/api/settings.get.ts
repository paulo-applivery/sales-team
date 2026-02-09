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
      emailSystemPrompt: `You are an expert sales copywriter specializing in B2B cold outreach. Your task is to generate personalized cold emails that feel human-written, not templated.

WRITING RULES:
- Tone: {{tone}}, conversational, and direct
- Maximum {{maxWords}} words
- Include a compelling subject line
- Start with a personalized hook based on the prospect's context
- One clear call-to-action
- No filler phrases ("Espero que este email le encuentre bien", "Mi nombre es...")
- Use specific, visceral language (e.g., "waiting hours for a policy to sync" instead of "latency")
- Use the prospect's language/locale based on their location
- Generate ONE complete email

{{principles}}
{{angle}}
COMPANY KNOWLEDGE:
Company/Product: {{companyName}}
{{companyOverview}}

TARGET AUDIENCE & PAIN POINTS:
{{painPoints}}

VALUE PROPOSITION:
{{valueProposition}}

DIFFERENTIATION:
{{competitors}}
{{differentiators}}

{{socialProof}}

{{callToAction}}

{{additionalContext}}

OUTPUT FORMAT:
SUBJECT: [subject line]

[email body]`,
      linkedinSystemPrompt: `You are an expert at writing LinkedIn connection messages and InMails. Write messages that feel like genuine human outreach, not automated sequences.

WRITING RULES:
- Tone: {{tone}}, conversational, and personal
- Maximum {{maxWords}} words
- Maximum 2,000 characters
- Start with a genuine connection point based on their profile
- Be direct and respectful of their time
- Focus on mutual benefit
- Include a soft, low-pressure CTA
- No hard selling
- No filler phrases — start directly with the hook
- Use the prospect's language/locale based on their location
- Generate ONE complete LinkedIn message

{{principles}}
{{angle}}
COMPANY KNOWLEDGE:
Company/Product: {{companyName}}
{{companyOverview}}

TARGET AUDIENCE & PAIN POINTS:
{{painPoints}}

VALUE PROPOSITION:
{{valueProposition}}

{{socialProof}}

{{callToAction}}

{{additionalContext}}`,
      emailUserPrompt: `Generate a personalized cold email for this prospect:

{{prospectContext}}

Analyze the prospect's role, company, and industry from the context above. Use this to craft a personalized hook and select the most relevant value proposition and CTA.`,
      linkedinUserPrompt: `Generate a personalized LinkedIn message for this person:

{{prospectContext}}

Analyze their role, experience, and current company. Find a genuine connection point to open with.`,
      emailNoContextPrompt: 'Generate a cold email for a generic prospect. Since no specific prospect context is available, write a compelling general outreach email based on the company knowledge provided.',
      linkedinNoContextPrompt: 'Generate a LinkedIn connection message for a generic prospect. Since no specific profile context is available, write a compelling general outreach message based on the company knowledge provided.',
      businessInfoWarning: '⚠️ Please add your business information (Company Name & Value Proposition) in Settings',
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
