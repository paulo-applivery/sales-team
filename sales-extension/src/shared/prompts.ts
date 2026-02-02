// AI Prompt Templates

import { EmailFormData, ScreenContext, Settings } from './types';

/**
 * Builds the system instruction (static company knowledge + copywriting rules).
 * This stays constant across generations and goes into Gemini's systemInstruction field.
 */
export const buildEmailSystemInstruction = (
  formData: EmailFormData,
  tone: string = 'professional',
  settings?: Settings,
  angleId?: string
): string => {
  const maxLength = settings?.emailMaxLength || 200;
  const principles = settings?.principles || '';
  const selectedAngle = settings?.angles?.find(a => a.id === angleId);
  const anglePrompt = selectedAngle?.prompt || '';

  return `You are an expert sales copywriter specializing in B2B cold outreach. Your task is to generate personalized cold emails that feel human-written, not templated.

WRITING RULES:
- Tone: ${tone}, conversational, and direct
- Maximum ${maxLength} words
- Include a compelling subject line
- Start with a personalized hook based on the prospect's context
- One clear call-to-action
- No filler phrases ("Espero que este email le encuentre bien", "Mi nombre es...")
- Use specific, visceral language (e.g., "waiting hours for a policy to sync" instead of "latency")
- Use the prospect's language/locale based on their location
- Generate ONE complete email

${principles ? `GUIDING PRINCIPLES:\n${principles}\n` : ''}${anglePrompt ? `MESSAGE ANGLE:\n${anglePrompt}\n` : ''}
COMPANY KNOWLEDGE:
Company/Product: ${formData.companyName}
${formData.companyOverview ? `Company Overview: ${formData.companyOverview}` : ''}

TARGET AUDIENCE & PAIN POINTS:
${formData.painPoints}

VALUE PROPOSITION:
${formData.valueProposition}

DIFFERENTIATION:
${formData.competitors ? `Primary Competitors: ${formData.competitors}` : ''}
${formData.differentiators ? `Product Differentiators: ${formData.differentiators}` : ''}

${formData.socialProof ? `SOCIAL PROOF:\n${formData.socialProof}` : ''}

${formData.callToAction ? `CALL TO ACTION EXAMPLES:\n${formData.callToAction}` : ''}

${formData.additionalContext ? `ADDITIONAL CONTEXT:\n${formData.additionalContext}` : ''}

OUTPUT FORMAT:
SUBJECT: [subject line]

[email body]`;
};

/**
 * Builds the user message (prospect-specific context).
 * This is the dynamic part that changes per generation.
 */
export const buildEmailUserMessage = (
  context?: ScreenContext
): string => {
  if (!context) {
    return 'Generate a cold email for a generic prospect. Since no specific prospect context is available, write a compelling general outreach email based on the company knowledge provided.';
  }

  const parts: string[] = ['Generate a personalized cold email for this prospect:'];

  if (context.url) {
    parts.push(`Profile/Page URL: ${context.url}`);
  }
  if (context.title) {
    parts.push(`Page Title: ${context.title}`);
  }
  if (context.content) {
    parts.push(`Profile/Page Content:\n${context.content.substring(0, 2000)}`);
  }
  if (context.selectedText) {
    parts.push(`Key highlighted text: ${context.selectedText}`);
  }

  parts.push('\nAnalyze the prospect\'s role, company, and industry from the context above. Use this to craft a personalized hook and select the most relevant value proposition and CTA.');

  return parts.join('\n');
};

/**
 * Legacy single-prompt fallback for email generation.
 * Used when the API doesn't support systemInstruction.
 */
export const generateEmailPrompt = (
  formData: EmailFormData,
  context?: ScreenContext,
  tone: string = 'professional',
  settings?: Settings,
  angleId?: string
): string => {
  const systemPart = buildEmailSystemInstruction(formData, tone, settings, angleId);
  const userPart = buildEmailUserMessage(context);
  return `${systemPart}\n\n---\n\n${userPart}`;
};

/**
 * Builds the system instruction for LinkedIn messages.
 */
export const buildLinkedInSystemInstruction = (
  formData: EmailFormData,
  tone: string = 'professional',
  settings?: Settings,
  angleId?: string
): string => {
  const maxLength = settings?.linkedinMaxLength || 300;
  const principles = settings?.principles || '';
  const selectedAngle = settings?.angles?.find(a => a.id === angleId);
  const anglePrompt = selectedAngle?.prompt || '';

  return `You are an expert at writing LinkedIn connection messages and InMails. Write messages that feel like genuine human outreach, not automated sequences.

WRITING RULES:
- Tone: ${tone}, conversational, and personal
- Maximum ${maxLength} words
- Maximum 2,000 characters
- Start with a genuine connection point based on their profile
- Be direct and respectful of their time
- Focus on mutual benefit
- Include a soft, low-pressure CTA
- No hard selling
- No filler phrases — start directly with the hook
- Use the prospect's language/locale based on their location
- Generate ONE complete LinkedIn message

${principles ? `GUIDING PRINCIPLES:\n${principles}\n` : ''}${anglePrompt ? `MESSAGE ANGLE:\n${anglePrompt}\n` : ''}
COMPANY KNOWLEDGE:
Company/Product: ${formData.companyName}
${formData.companyOverview ? `Company Overview: ${formData.companyOverview}` : ''}

TARGET AUDIENCE & PAIN POINTS:
${formData.painPoints}

VALUE PROPOSITION:
${formData.valueProposition}

${formData.socialProof ? `SOCIAL PROOF:\n${formData.socialProof}` : ''}

${formData.callToAction ? `CALL TO ACTION EXAMPLES:\n${formData.callToAction}` : ''}

${formData.additionalContext ? `ADDITIONAL CONTEXT:\n${formData.additionalContext}` : ''}`;
};

/**
 * Builds the user message for LinkedIn messages.
 */
export const buildLinkedInUserMessage = (
  context?: ScreenContext
): string => {
  if (!context) {
    return 'Generate a LinkedIn connection message for a generic prospect. Since no specific profile context is available, write a compelling general outreach message based on the company knowledge provided.';
  }

  const parts: string[] = ['Generate a personalized LinkedIn message for this person:'];

  if (context.url) {
    parts.push(`LinkedIn Profile URL: ${context.url}`);
  }
  if (context.title) {
    parts.push(`Profile Title: ${context.title}`);
  }
  if (context.content) {
    parts.push(`Profile Content:\n${context.content.substring(0, 2000)}`);
  }
  if (context.selectedText) {
    parts.push(`Key highlighted text: ${context.selectedText}`);
  }

  parts.push('\nAnalyze their role, experience, and current company. Find a genuine connection point to open with.');

  return parts.join('\n');
};

/**
 * Legacy single-prompt fallback for LinkedIn generation.
 */
export const generateLinkedInPrompt = (
  formData: EmailFormData,
  context?: ScreenContext,
  tone: string = 'professional',
  settings?: Settings,
  angleId?: string
): string => {
  const systemPart = buildLinkedInSystemInstruction(formData, tone, settings, angleId);
  const userPart = buildLinkedInUserMessage(context);
  return `${systemPart}\n\n---\n\n${userPart}`;
};

export const generateCustomPrompt = (
  customPrompt: string,
  formData: EmailFormData,
  context?: ScreenContext
): string => {
  return `${customPrompt}

${context ? `CONTEXT FROM WEBPAGE:
URL: ${context.url}
Page Title: ${context.title}
Content: ${context.content.substring(0, 2000)}
${context.selectedText ? `Selected Text: ${context.selectedText}` : ''}
` : ''}

BUSINESS INFORMATION:
Company: ${formData.companyName}
Overview: ${formData.companyOverview}
Pain Points: ${formData.painPoints}
Value Proposition: ${formData.valueProposition}
Social Proof: ${formData.socialProof}
Competitors: ${formData.competitors}
Differentiators: ${formData.differentiators}
Call to Action: ${formData.callToAction}
${formData.additionalContext ? `Additional Context: ${formData.additionalContext}` : ''}`;
};
