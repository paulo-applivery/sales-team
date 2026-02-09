// Zustand store for state management

import { create } from 'zustand';
import type {
  TabType,
  EmailFormData,
  ScreenContext,
  Settings,
  GeneratedContent,
  CustomPrompt,
  StructuredPrompt,
  UserProfile,
  AdminSettings,
} from '@shared/types';
import { MESSAGE_TYPES, STORAGE_KEYS } from '@shared/constants';

interface AppState {
  // UI State
  activeTab: TabType;
  isLoading: boolean;
  error: string | null;

  // Form Data
  formData: EmailFormData;
  screenContext: ScreenContext | null;

  // Generated Content
  generatedContent: string;
  variants: string[];
  selectedVariant: number;

  // Settings (local preferences)
  settings: Settings | null;

  // Auth state
  user: UserProfile | null;
  token: string | null;
  apiKey: string | null;
  isAuthenticated: boolean;
  authLoading: boolean;

  // Admin settings (from backend)
  adminSettings: AdminSettings | null;

  // History
  history: GeneratedContent[];

  // Custom Prompts
  customPrompts: CustomPrompt[];

  // Actions
  setActiveTab: (tab: TabType) => void;
  setFormData: (data: Partial<EmailFormData>) => void;
  setScreenContext: (context: ScreenContext | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setGeneratedContent: (content: string, variants?: string[]) => void;
  setSelectedVariant: (index: number) => void;
  setSettings: (settings: Settings) => void;
  loadSettings: () => Promise<void>;
  saveSettings: (settings: Settings) => Promise<void>;
  loadHistory: () => Promise<void>;
  addToHistory: (content: GeneratedContent) => Promise<void>;
  generateContent: (prompt: string | StructuredPrompt) => Promise<void>;
  captureScreenContext: () => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setApiKey: (key: string) => Promise<void>;
  checkAuth: () => Promise<void>;
  fetchAdminSettings: () => Promise<void>;
  reset: () => void;
}

const defaultFormData: EmailFormData = {
  companyName: '',
  painPoints: '',
  valueProposition: '',
  callToAction: '',
  socialProof: '',
  companyOverview: '',
  additionalContext: '',
  competitors: '',
  differentiators: '',
};

export const useStore = create<AppState>((set, get) => ({
  // Initial State
  activeTab: 'email',
  isLoading: false,
  error: null,
  formData: defaultFormData,
  screenContext: null,
  generatedContent: '',
  variants: [],
  selectedVariant: 0,
  settings: null,
  user: null,
  token: null,
  apiKey: null,
  isAuthenticated: false,
  authLoading: false,
  adminSettings: null,
  history: [],
  customPrompts: [],

  // Actions
  setActiveTab: (tab) => set({
    activeTab: tab,
    error: null,
    generatedContent: '',
    variants: [],
    selectedVariant: 0,
  }),

  setFormData: (data) => set((state) => ({
    formData: { ...state.formData, ...data },
  })),

  setScreenContext: (context) => set({ screenContext: context }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  setGeneratedContent: (content, variants = []) => set({
    generatedContent: content,
    variants,
    selectedVariant: 0,
  }),

  setSelectedVariant: (index) => set({ selectedVariant: index }),
  setSettings: (settings) => set({ settings }),

  loadSettings: async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.GET_SETTINGS,
      });

      if (response.success && response.settings) {
        set({ settings: response.settings });

        // Also load defaults into form if they exist
        const defaults = await chrome.storage.local.get(['sales_ext_defaults']);
        if (defaults.sales_ext_defaults) {
          set({ formData: defaults.sales_ext_defaults });
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  },

  saveSettings: async (settings) => {
    try {
      await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.SAVE_SETTINGS,
        payload: settings,
      });
      set({ settings });
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  },

  loadHistory: async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.GET_HISTORY,
      });
      if (response.success) {
        set({ history: response.history || [] });
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  },

  addToHistory: async (content) => {
    try {
      await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.SAVE_HISTORY,
        payload: content,
      });
      await get().loadHistory();
    } catch (error) {
      console.error('Failed to save to history:', error);
    }
  },

  generateContent: async (prompt) => {
    set({ isLoading: true, error: null });

    const payload = typeof prompt === 'string'
      ? { prompt }
      : { systemInstruction: prompt.systemInstruction, userMessage: prompt.userMessage };

    try {
      const response = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.GENERATE_CONTENT,
        payload,
      });

      if (response.success) {
        set({
          generatedContent: response.content,
          variants: response.variants || [],
          selectedVariant: 0,
          isLoading: false,
        });
      } else {
        set({
          error: response.error || 'Failed to generate content',
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'An error occurred',
        isLoading: false,
      });
    }
  },

  captureScreenContext: async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.GET_CONTEXT,
      });

      if (response?.success && response.context) {
        set({ screenContext: response.context });
      } else {
        console.warn('Context capture failed:', response?.error || 'unknown');
        set({ screenContext: null });
      }
    } catch (error) {
      console.error('Failed to capture screen context:', error);
      set({ screenContext: null });
    }
  },

  // Auth actions
  setApiKey: async (key: string) => {
    try {
      await chrome.storage.local.set({ [STORAGE_KEYS.API_KEY]: key });
      set({ apiKey: key });
      
      // If we have an API key, we are "authenticated" for the purpose of generation
      if (key && key.length > 0) {
        set({ isAuthenticated: true });
      } else if (!get().token) {
        set({ isAuthenticated: false });
      }
    } catch (error) {
      console.error('Failed to save API key:', error);
    }
  },

  login: async () => {
    set({ authLoading: true, error: null });
    try {
      const response = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.LOGIN,
      });

      if (response.success) {
        set({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          authLoading: false,
        });
        // Fetch admin settings after login
        await get().fetchAdminSettings();
      } else {
        set({
          error: response.error || 'Login failed',
          authLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Login failed',
        authLoading: false,
      });
    }
  },

  logout: async () => {
    set({ authLoading: true });
    try {
      await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.LOGOUT,
      });
      
      await chrome.storage.local.remove([STORAGE_KEYS.API_KEY]);
      
      set({
        user: null,
        token: null,
        apiKey: null,
        isAuthenticated: false,
        adminSettings: null,
        authLoading: false,
      });
    } catch (error: any) {
      set({ authLoading: false });
      console.error('Logout failed:', error);
    }
  },

  checkAuth: async () => {
    set({ authLoading: true });
    try {
      const response = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.CHECK_AUTH,
      });

      // Load API Key
      const keyResult = await chrome.storage.local.get([STORAGE_KEYS.API_KEY]);
      const apiKey = keyResult[STORAGE_KEYS.API_KEY];
      if (apiKey) {
        set({ apiKey });
      }

      if (response.success && response.isAuthenticated) {
        set({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          authLoading: false,
        });
        // Fetch admin settings if authenticated
        await get().fetchAdminSettings();
      } else if (apiKey) {
        // Fallback to API Key auth
        set({
          isAuthenticated: true,
          authLoading: false,
          user: { name: 'Local User', email: 'Using API Key', id: 'local', role: 'regular', avatarUrl: '' }
        });
      } else {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          authLoading: false,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      set({ authLoading: false });
    }
  },

  fetchAdminSettings: async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.FETCH_ADMIN_SETTINGS,
      });

      if (response.success && response.settings) {
        const admin = response.settings as AdminSettings;
        set({ adminSettings: admin });

        // Merge admin settings into the combined settings object for prompt builders
        const currentSettings = get().settings;
        if (currentSettings) {
          set({
            settings: {
              ...currentSettings,
              angles: admin.angles,
              principles: admin.principles,
              emailMaxLength: admin.emailMaxWords,
              linkedinMaxLength: admin.linkedinMaxWords,
              emailSystemPrompt: admin.emailSystemPrompt,
              linkedinSystemPrompt: admin.linkedinSystemPrompt,
              emailUserPrompt: admin.emailUserPrompt,
              linkedinUserPrompt: admin.linkedinUserPrompt,
              emailNoContextPrompt: admin.emailNoContextPrompt,
              linkedinNoContextPrompt: admin.linkedinNoContextPrompt,
            },
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch admin settings:', error);
    }
  },

  reset: () => set({
    generatedContent: '',
    variants: [],
    selectedVariant: 0,
    error: null,
  }),
}));
