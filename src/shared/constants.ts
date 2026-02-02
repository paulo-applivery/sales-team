// Application constants

export const APP_NAME = 'Sales Extension';
export const APP_VERSION = '1.0.0';

// API Configuration
export const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
export const DEFAULT_MODEL = 'gemini-1.5-pro';
export const DEFAULT_TEMPERATURE = 0.7;
export const DEFAULT_MAX_TOKENS = 1000;

// Storage Keys
export const STORAGE_KEYS = {
  SETTINGS: 'sales_ext_settings',
  DEFAULTS: 'sales_ext_defaults',
  HISTORY: 'sales_ext_history',
  CUSTOM_PROMPTS: 'sales_ext_custom_prompts',
} as const;

// UI Constants
export const TABS = [
  { id: 'email', label: 'Cold Email', icon: '✉️' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { id: 'free', label: 'Prompt Free', icon: '✨' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
] as const;

// Scraping Modes
export const SCRAPING_MODES = [
  { value: 'full', label: 'Full Page Text', description: 'Capture all text content from the page' },
  { value: 'viewport', label: 'Visible Viewport', description: 'Only capture visible content' },
  { value: 'selected', label: 'Selected Text', description: 'Use only selected/highlighted text' },
  { value: 'custom', label: 'Custom Selectors', description: 'Use custom CSS selectors' },
] as const;

// Model Options
export const MODEL_OPTIONS = [
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', description: 'Best quality, slower' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', description: 'Fast, good quality' },
  { value: 'gemini-pro', label: 'Gemini Pro', description: 'Balanced performance' },
] as const;

// Tone Options
export const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'friendly', label: 'Friendly' },
] as const;

// History Limits
export const MAX_HISTORY_ITEMS = 50;
export const MAX_CUSTOM_PROMPTS = 20;

// Debounce Timers (ms)
export const DEBOUNCE_DELAY = 300;
export const AUTO_SAVE_DELAY = 1000;

// Rate Limiting
export const RATE_LIMIT_REQUESTS = 10;
export const RATE_LIMIT_WINDOW = 60000; // 1 minute

// Message Types for Chrome Extension Communication
export const MESSAGE_TYPES = {
  GET_CONTEXT: 'GET_CONTEXT',
  GENERATE_CONTENT: 'GENERATE_CONTENT',
  SAVE_SETTINGS: 'SAVE_SETTINGS',
  GET_SETTINGS: 'GET_SETTINGS',
  SAVE_HISTORY: 'SAVE_HISTORY',
  GET_HISTORY: 'GET_HISTORY',
} as const;
