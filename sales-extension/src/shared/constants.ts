// Application constants

export const APP_NAME = 'Sales Extension';
export const APP_VERSION = '1.0.0';

// Admin Backend URL
export const ADMIN_API_URL = 'https://sales-team.pages.dev';

// Storage Keys
export const STORAGE_KEYS = {
  SETTINGS: 'sales_ext_settings',
  DEFAULTS: 'sales_ext_defaults',
  HISTORY: 'sales_ext_history',
  CUSTOM_PROMPTS: 'sales_ext_custom_prompts',
  AUTH_TOKEN: 'sales_ext_auth_token',
  AUTH_USER: 'sales_ext_auth_user',
  ADMIN_SETTINGS: 'sales_ext_admin_settings',
  ADMIN_SETTINGS_TTL: 'sales_ext_admin_settings_ttl',
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

// Admin settings cache TTL (5 minutes)
export const ADMIN_SETTINGS_CACHE_TTL = 5 * 60 * 1000;

// Message Types for Chrome Extension Communication
export const MESSAGE_TYPES = {
  GET_CONTEXT: 'GET_CONTEXT',
  GENERATE_CONTENT: 'GENERATE_CONTENT',
  SAVE_SETTINGS: 'SAVE_SETTINGS',
  GET_SETTINGS: 'GET_SETTINGS',
  SAVE_HISTORY: 'SAVE_HISTORY',
  GET_HISTORY: 'GET_HISTORY',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  CHECK_AUTH: 'CHECK_AUTH',
  FETCH_ADMIN_SETTINGS: 'FETCH_ADMIN_SETTINGS',
} as const;
