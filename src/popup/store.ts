// Zustand store for state management

import { create } from 'zustand';
import type { 
  TabType, 
  EmailFormData, 
  ScreenContext, 
  Settings, 
  GeneratedContent,
  CustomPrompt 
} from '@shared/types';
import { MESSAGE_TYPES } from '@shared/constants';

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
  
  // Settings
  settings: Settings | null;
  
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
  generateContent: (prompt: string) => Promise<void>;
  captureScreenContext: () => Promise<void>;
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
  history: [],
  customPrompts: [],

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab, error: null }),
  
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
      
      // Reload history
      await get().loadHistory();
    } catch (error) {
      console.error('Failed to save to history:', error);
    }
  },
  
  generateContent: async (prompt) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.GENERATE_CONTENT,
        payload: { prompt },
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
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.id) {
        throw new Error('No active tab found');
      }
      
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: MESSAGE_TYPES.GET_CONTEXT,
      });
      
      if (response.success) {
        set({ screenContext: response.context });
      }
    } catch (error) {
      console.error('Failed to capture screen context:', error);
      // Don't throw error - context is optional
    }
  },
  
  reset: () => set({
    generatedContent: '',
    variants: [],
    selectedVariant: 0,
    error: null,
  }),
}));
