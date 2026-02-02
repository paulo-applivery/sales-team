// Background Service Worker

import { MESSAGE_TYPES } from '@shared/constants';
import type { ApiResponse, GeneratedContent, Settings } from '@shared/types';

// Handle installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Sales Extension: Service worker installed');
  
  // Initialize default settings
  const defaultSettings: Settings = {
    apiKey: '',
    model: 'gemini-1.5-pro',
    temperature: 0.7,
    maxTokens: 1000,
    scrapingMode: 'full',
    theme: 'light',
    autoSave: true,
  };

  chrome.storage.local.get(['sales_ext_settings'], (result) => {
    if (!result.sales_ext_settings) {
      chrome.storage.local.set({ sales_ext_settings: defaultSettings });
    }
  });
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { type, payload } = request;

  switch (type) {
    case MESSAGE_TYPES.GENERATE_CONTENT:
      handleGenerateContent(payload)
        .then(response => sendResponse(response))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // Keep message channel open for async

    case MESSAGE_TYPES.SAVE_SETTINGS:
      chrome.storage.local.set({ sales_ext_settings: payload }, () => {
        sendResponse({ success: true });
      });
      return true;

    case MESSAGE_TYPES.GET_SETTINGS:
      chrome.storage.local.get(['sales_ext_settings'], (result) => {
        sendResponse({ success: true, settings: result.sales_ext_settings });
      });
      return true;

    case MESSAGE_TYPES.SAVE_HISTORY:
      saveToHistory(payload)
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case MESSAGE_TYPES.GET_HISTORY:
      chrome.storage.local.get(['sales_ext_history'], (result) => {
        sendResponse({ success: true, history: result.sales_ext_history || [] });
      });
      return true;

    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }
});

// Generate content using Gemini API
async function handleGenerateContent(payload: any): Promise<ApiResponse> {
  const { prompt, settings } = payload;

  // Get API key from settings
  const result = await chrome.storage.local.get(['sales_ext_settings']);
  const storedSettings: Settings = result.sales_ext_settings;

  if (!storedSettings?.apiKey) {
    throw new Error('API key not configured. Please add your Gemini API key in Settings.');
  }

  try {
    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${storedSettings.model}:generateContent?key=${storedSettings.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: settings?.temperature || storedSettings.temperature,
            maxOutputTokens: settings?.maxTokens || storedSettings.maxTokens,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API request failed');
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse variants if present
    const variants = parseVariants(generatedText);

    return {
      success: true,
      content: variants[0] || generatedText,
      variants: variants.length > 1 ? variants : undefined,
    };
  } catch (error: any) {
    console.error('Generation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate content',
    };
  }
}

// Parse variants from generated text
function parseVariants(text: string): string[] {
  // Split by common variant separators
  const variants = text.split(/---+|\n\nVARIANT \d+:?\n\n/i).filter(v => v.trim());
  
  if (variants.length > 1) {
    return variants.map(v => v.trim());
  }
  
  return [text.trim()];
}

// Save generated content to history
async function saveToHistory(content: GeneratedContent): Promise<void> {
  const result = await chrome.storage.local.get(['sales_ext_history']);
  const history: GeneratedContent[] = result.sales_ext_history || [];

  // Add new content to beginning
  history.unshift(content);

  // Keep only last 50 items
  const trimmedHistory = history.slice(0, 50);

  await chrome.storage.local.set({ sales_ext_history: trimmedHistory });
}

console.log('Sales Extension: Background service worker loaded');
