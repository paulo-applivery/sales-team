// AI Prompt Templates

import { EmailFormData, ScreenContext } from './types';

export const generateEmailPrompt = (
  formData: EmailFormData,
  context?: ScreenContext,
  tone: string = 'professional'
): string => {
  return `You are an expert sales copywriter. Generate a personalized cold email based on the following information.

${context ? `CONTEXT FROM WEBPAGE:
URL: ${context.url}
Page Title: ${context.title}
Content Preview: ${context.content.substring(0, 500)}
${context.selectedText ? `Selected Text: ${context.selectedText}` : ''}
` : ''}

COMPANY INFORMATION:
Company/Product: ${formData.companyName}
Company Overview: ${formData.companyOverview}

TARGET AUDIENCE:
Customer Pain Points: ${formData.painPoints}

VALUE PROPOSITION:
${formData.valueProposition}

DIFFERENTIATION:
Primary Competitors: ${formData.competitors}
Product Differentiators: ${formData.differentiators}

SOCIAL PROOF:
${formData.socialProof}

CALL TO ACTION:
${formData.callToAction}

${formData.additionalContext ? `ADDITIONAL CONTEXT:\n${formData.additionalContext}` : ''}

REQUIREMENTS:
- Tone: ${tone}
- Length: 150-200 words
- Include a compelling subject line
- Start with a personalized hook based on the webpage context
- Clearly articulate the value proposition
- Include one clear call-to-action
- Professional formatting
- Avoid jargon and buzzwords
- Make it conversational and human

Generate 3 variants with slightly different approaches.

Format your response as:
SUBJECT: [subject line]

[email body]

---

VARIANT 2:
SUBJECT: [subject line]

[email body]

---

VARIANT 3:
SUBJECT: [subject line]

[email body]`;
};

export const generateLinkedInPrompt = (
  formData: EmailFormData,
  context?: ScreenContext,
  tone: string = 'professional'
): string => {
  return `You are an expert at writing LinkedIn connection messages and InMails. Generate a personalized LinkedIn message based on the following information.

${context ? `CONTEXT FROM LINKEDIN PROFILE/PAGE:
URL: ${context.url}
Page Title: ${context.title}
Content Preview: ${context.content.substring(0, 300)}
` : ''}

COMPANY INFORMATION:
Company/Product: ${formData.companyName}
Company Overview: ${formData.companyOverview}

TARGET AUDIENCE:
Customer Pain Points: ${formData.painPoints}

VALUE PROPOSITION:
${formData.valueProposition}

SOCIAL PROOF:
${formData.socialProof}

CALL TO ACTION:
${formData.callToAction}

${formData.additionalContext ? `ADDITIONAL CONTEXT:\n${formData.additionalContext}` : ''}

REQUIREMENTS:
- Tone: ${tone}, conversational, and personal
- Length: 100-150 words (LinkedIn messages should be brief)
- Maximum 2,000 characters
- Start with a genuine connection point based on their profile
- Be direct and respectful of their time
- Focus on mutual benefit
- Include a soft, low-pressure CTA
- No hard selling
- Make it feel human and authentic

Generate 3 variants with different opening hooks.

Format each variant clearly separated by ---`;
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
Content: ${context.content.substring(0, 500)}
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
