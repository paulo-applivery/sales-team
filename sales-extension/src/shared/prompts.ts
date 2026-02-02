// AI Prompt Templates
// Templates are fetched from the admin dashboard and use {{variable}} placeholders.
// This module provides fallback templates and the variable substitution engine.

import { EmailFormData, ScreenContext, Settings } from './types';

/**
 * Replace {{variable}} placeholders in a template string.
 */
function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');
}

/**
 * Build the common variable map from form data and settings.
 */
function buildVarMap(
  formData: EmailFormData,
  tone: string,
  settings?: Settings,
  angleId?: string,
  context?: ScreenContext
): Record<string, string> {
  const selectedAngle = settings?.angles?.find(a => a.id === angleId);
  const principlesText = settings?.principles ? `GUIDING PRINCIPLES:\n${settings.principles}\n` : '';
  const angleText = selectedAngle?.prompt ? `MESSAGE ANGLE:\n${selectedAngle.prompt}\n` : '';

  const prospectParts: string[] = [];
  if (context) {
    if (context.url) prospectParts.push(`Profile/Page URL: ${context.url}`);
    if (context.title) prospectParts.push(`Page Title: ${context.title}`);
    if (context.content) prospectParts.push(`Profile/Page Content:\n${context.content.substring(0, 2000)}`);
    if (context.selectedText) prospectParts.push(`Key highlighted text: ${context.selectedText}`);
  }

  return {
    tone,
    maxWords: String(settings?.emailMaxLength || 200),
    principles: principlesText,
    angle: angleText,
    companyName: formData.companyName || '',
    companyOverview: formData.companyOverview ? `Company Overview: ${formData.companyOverview}` : '',
    painPoints: formData.painPoints || '',
    valueProposition: formData.valueProposition || '',
    competitors: formData.competitors ? `Primary Competitors: ${formData.competitors}` : '',
    differentiators: formData.differentiators ? `Product Differentiators: ${formData.differentiators}` : '',
    socialProof: formData.socialProof ? `SOCIAL PROOF:\n${formData.socialProof}` : '',
    callToAction: formData.callToAction ? `CALL TO ACTION EXAMPLES:\n${formData.callToAction}` : '',
    additionalContext: formData.additionalContext ? `ADDITIONAL CONTEXT:\n${formData.additionalContext}` : '',
    prospectContext: prospectParts.join('\n'),
  };
}

// ─── Fallback templates (used when no admin template is configured) ───

const FALLBACK_EMAIL_SYSTEM = `You are an expert sales copywriter specializing in B2B cold outreach. Your task is to generate personalized cold emails that feel human-written, not templated.

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

[email body]`;

const FALLBACK_LINKEDIN_SYSTEM = `You are an expert at writing LinkedIn connection messages and InMails. Write messages that feel like genuine human outreach, not automated sequences.

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

{{additionalContext}}`;

const FALLBACK_EMAIL_USER = `Generate a personalized cold email for this prospect:

{{prospectContext}}

Analyze the prospect's role, company, and industry from the context above. Use this to craft a personalized hook and select the most relevant value proposition and CTA.`;

const FALLBACK_LINKEDIN_USER = `Generate a personalized LinkedIn message for this person:

{{prospectContext}}

Analyze their role, experience, and current company. Find a genuine connection point to open with.`;

const FALLBACK_EMAIL_NO_CONTEXT = 'Generate a cold email for a generic prospect. Since no specific prospect context is available, write a compelling general outreach email based on the company knowledge provided.';

const FALLBACK_LINKEDIN_NO_CONTEXT = 'Generate a LinkedIn connection message for a generic prospect. Since no specific profile context is available, write a compelling general outreach message based on the company knowledge provided.';

// ─── Public API ───

/**
 * Builds the system instruction for email generation.
 */
export const buildEmailSystemInstruction = (
  formData: EmailFormData,
  tone: string = 'professional',
  settings?: Settings,
  angleId?: string
): string => {
  const vars = buildVarMap(formData, tone, settings, angleId);
  vars.maxWords = String(settings?.emailMaxLength || 200);
  const template = (settings as any)?.emailSystemPrompt || FALLBACK_EMAIL_SYSTEM;
  return fillTemplate(template, vars);
};

/**
 * Builds the user message for email generation.
 */
export const buildEmailUserMessage = (
  context?: ScreenContext,
  settings?: Settings
): string => {
  if (!context) {
    return (settings as any)?.emailNoContextPrompt || FALLBACK_EMAIL_NO_CONTEXT;
  }
  const vars = buildVarMap({} as EmailFormData, '', settings, undefined, context);
  const template = (settings as any)?.emailUserPrompt || FALLBACK_EMAIL_USER;
  return fillTemplate(template, vars);
};

/**
 * Legacy single-prompt fallback for email generation.
 */
export const generateEmailPrompt = (
  formData: EmailFormData,
  context?: ScreenContext,
  tone: string = 'professional',
  settings?: Settings,
  angleId?: string
): string => {
  const systemPart = buildEmailSystemInstruction(formData, tone, settings, angleId);
  const userPart = buildEmailUserMessage(context, settings);
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
  const vars = buildVarMap(formData, tone, settings, angleId);
  vars.maxWords = String(settings?.linkedinMaxLength || 300);
  const template = (settings as any)?.linkedinSystemPrompt || FALLBACK_LINKEDIN_SYSTEM;
  return fillTemplate(template, vars);
};

/**
 * Builds the user message for LinkedIn messages.
 */
export const buildLinkedInUserMessage = (
  context?: ScreenContext,
  settings?: Settings
): string => {
  if (!context) {
    return (settings as any)?.linkedinNoContextPrompt || FALLBACK_LINKEDIN_NO_CONTEXT;
  }
  const vars = buildVarMap({} as EmailFormData, '', settings, undefined, context);
  const template = (settings as any)?.linkedinUserPrompt || FALLBACK_LINKEDIN_USER;
  return fillTemplate(template, vars);
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
  const userPart = buildLinkedInUserMessage(context, settings);
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
