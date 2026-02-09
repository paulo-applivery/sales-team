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

export interface Angle {
  id: string;
  name: string;
  prompt: string;
}

// Local settings stored in chrome.storage (user preferences only)
export interface LocalSettings {
  scrapingMode: 'full' | 'viewport' | 'selected' | 'custom';
  theme: 'light' | 'dark';
  autoSave: boolean;
}

// Admin settings fetched from the backend
export interface AdminSettings {
  angles: Angle[];
  principles: string;
  emailMaxWords: number;
  linkedinMaxWords: number;
  // Prompt templates (managed from dashboard)
  emailSystemPrompt?: string;
  linkedinSystemPrompt?: string;
  emailUserPrompt?: string;
  linkedinUserPrompt?: string;
  emailNoContextPrompt?: string;
  linkedinNoContextPrompt?: string;
}

// Combined Settings type for backward compatibility in prompt builders
export interface Settings {
  scrapingMode: 'full' | 'viewport' | 'selected' | 'custom';
  theme: 'light' | 'dark';
  autoSave: boolean;
  // Admin-managed (from backend)
  angles: Angle[];
  principles?: string;
  emailMaxLength?: number;
  linkedinMaxLength?: number;
  // Prompt templates (from backend)
  emailSystemPrompt?: string;
  linkedinSystemPrompt?: string;
  emailUserPrompt?: string;
  linkedinUserPrompt?: string;
  emailNoContextPrompt?: string;
  linkedinNoContextPrompt?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  role: 'admin' | 'regular';
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface StorageSchema {
  settings: LocalSettings;
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

export interface StructuredPrompt {
  systemInstruction: string;
  userMessage: string;
}

export interface ApiResponse {
  success: boolean;
  content?: string;
  variants?: string[];
  error?: string;
}
