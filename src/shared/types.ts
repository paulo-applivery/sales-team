// Shared TypeScript types and interfaces

export interface ScreenContext {
  url: string;
  title: string;
  content: string;
  metadata: {
    author?: string;
    date?: string;
    domain: string;
  };
  selectedText?: string;
  timestamp: number;
}

export interface EmailFormData {
  companyName: string;
  painPoints: string;
  valueProposition: string;
  callToAction: string;
  socialProof: string;
  companyOverview: string;
  additionalContext: string;
  competitors: string;
  differentiators: string;
}

export interface GeneratedContent {
  id: string;
  type: 'email' | 'linkedin' | 'custom';
  content: string;
  variants?: string[];
  timestamp: number;
  formData: EmailFormData;
  screenContext?: ScreenContext;
}

export interface Settings {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  scrapingMode: 'full' | 'viewport' | 'selected' | 'custom';
  theme: 'light' | 'dark';
  autoSave: boolean;
}

export interface StorageSchema {
  settings: Settings;
  defaults: EmailFormData;
  history: GeneratedContent[];
  customPrompts: CustomPrompt[];
}

export interface CustomPrompt {
  id: string;
  name: string;
  prompt: string;
  createdAt: number;
  lastUsed?: number;
}

export type TabType = 'email' | 'linkedin' | 'free' | 'settings';

export interface ApiResponse {
  success: boolean;
  content?: string;
  variants?: string[];
  error?: string;
}
