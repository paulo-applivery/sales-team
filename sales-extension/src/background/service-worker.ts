// Background Service Worker

import { MESSAGE_TYPES, STORAGE_KEYS, ADMIN_API_URL, ADMIN_SETTINGS_CACHE_TTL } from '@shared/constants';
import type { ApiResponse, GeneratedContent, LocalSettings, AdminSettings, UserProfile } from '@shared/types';

// Handle installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Sales Extension: Service worker installed');

  // Initialize default local settings
  const defaultSettings: LocalSettings = {
    scrapingMode: 'full',
    theme: 'light',
    autoSave: true,
  };

  chrome.storage.local.get([STORAGE_KEYS.SETTINGS], (result) => {
    if (!result[STORAGE_KEYS.SETTINGS]) {
      chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: defaultSettings });
    }
  });
});

// Handle extension icon click to open side panel
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id });
  }
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  const { type, payload } = request;

  switch (type) {
    case MESSAGE_TYPES.GENERATE_CONTENT:
      handleGenerateContent(payload)
        .then(response => sendResponse(response))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case MESSAGE_TYPES.SAVE_SETTINGS:
      chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: payload }, () => {
        sendResponse({ success: true });
      });
      return true;

    case MESSAGE_TYPES.GET_SETTINGS:
      chrome.storage.local.get([STORAGE_KEYS.SETTINGS], (result) => {
        sendResponse({ success: true, settings: result[STORAGE_KEYS.SETTINGS] });
      });
      return true;

    case MESSAGE_TYPES.SAVE_HISTORY:
      saveToHistory(payload)
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case MESSAGE_TYPES.GET_HISTORY:
      chrome.storage.local.get([STORAGE_KEYS.HISTORY], (result) => {
        sendResponse({ success: true, history: result[STORAGE_KEYS.HISTORY] || [] });
      });
      return true;

    case MESSAGE_TYPES.GET_CONTEXT:
      handleGetContext()
        .then(response => sendResponse(response))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case MESSAGE_TYPES.LOGIN:
      handleLogin()
        .then(response => sendResponse(response))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case MESSAGE_TYPES.LOGOUT:
      handleLogout()
        .then(response => sendResponse(response))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case MESSAGE_TYPES.CHECK_AUTH:
      handleCheckAuth()
        .then(response => sendResponse(response))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case MESSAGE_TYPES.FETCH_ADMIN_SETTINGS:
      handleFetchAdminSettings()
        .then(response => sendResponse(response))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }
});

// Generate content by proxying through admin backend
async function handleGenerateContent(payload: any): Promise<ApiResponse> {
  const { systemInstruction, userMessage, prompt } = payload;

  // Get auth token
  const result = await chrome.storage.local.get([STORAGE_KEYS.AUTH_TOKEN]);
  const token = result[STORAGE_KEYS.AUTH_TOKEN];

  if (!token) {
    throw new Error('Not authenticated. Please sign in first.');
  }

  try {
    const response = await fetch(`${ADMIN_API_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        systemInstruction: systemInstruction || undefined,
        userMessage: userMessage || prompt || '',
      }),
    });

    if (response.status === 401) {
      await chrome.storage.local.remove([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.AUTH_USER]);
      throw new Error('Session expired. Please sign in again.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'API request failed' }));
      throw new Error(error.message || `Server error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      content: data.content || '',
      variants: data.variants,
    };
  } catch (error: any) {
    console.error('Generation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate content',
    };
  }
}

// Handle Google SSO login via chrome.identity
async function handleLogin(): Promise<any> {
  try {
    const authResult = await chrome.identity.getAuthToken({ interactive: true });
    const googleToken = authResult.token;

    if (!googleToken) {
      throw new Error('Failed to get Google auth token');
    }

    const response = await fetch(`${ADMIN_API_URL}/api/auth/extension`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: googleToken }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Authentication failed' }));
      await chrome.identity.removeCachedAuthToken({ token: googleToken });
      throw new Error(error.message || 'Authentication failed');
    }

    const data = await response.json();

    await chrome.storage.local.set({
      [STORAGE_KEYS.AUTH_TOKEN]: data.token,
      [STORAGE_KEYS.AUTH_USER]: data.user,
    });

    return { success: true, user: data.user, token: data.token };
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, error: error.message || 'Login failed' };
  }
}

// Handle logout
async function handleLogout(): Promise<any> {
  try {
    try {
      const authResult = await chrome.identity.getAuthToken({ interactive: false });
      if (authResult.token) {
        await chrome.identity.removeCachedAuthToken({ token: authResult.token });
      }
    } catch {
      // Token might not be cached
    }

    await chrome.storage.local.remove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.AUTH_USER,
      STORAGE_KEYS.ADMIN_SETTINGS,
      STORAGE_KEYS.ADMIN_SETTINGS_TTL,
    ]);

    return { success: true };
  } catch (error: any) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
}

// Check if user is authenticated
async function handleCheckAuth(): Promise<any> {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.AUTH_USER]);
    const token = result[STORAGE_KEYS.AUTH_TOKEN];
    const user = result[STORAGE_KEYS.AUTH_USER] as UserProfile | undefined;

    if (!token || !user) {
      return { success: true, isAuthenticated: false };
    }

    const response = await fetch(`${ADMIN_API_URL}/api/auth/session`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      await chrome.storage.local.remove([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.AUTH_USER]);
      return { success: true, isAuthenticated: false };
    }

    const data = await response.json();
    if (data.user) {
      await chrome.storage.local.set({ [STORAGE_KEYS.AUTH_USER]: data.user });
      return { success: true, isAuthenticated: true, user: data.user, token };
    }

    return { success: true, isAuthenticated: false };
  } catch (error: any) {
    console.error('Auth check error:', error);
    // Network error — use cached user (offline support)
    const result = await chrome.storage.local.get([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.AUTH_USER]);
    if (result[STORAGE_KEYS.AUTH_TOKEN] && result[STORAGE_KEYS.AUTH_USER]) {
      return { success: true, isAuthenticated: true, user: result[STORAGE_KEYS.AUTH_USER], token: result[STORAGE_KEYS.AUTH_TOKEN] };
    }
    return { success: true, isAuthenticated: false };
  }
}

// Fetch admin settings from backend (with caching)
async function handleFetchAdminSettings(): Promise<any> {
  try {
    const cached = await chrome.storage.local.get([STORAGE_KEYS.ADMIN_SETTINGS, STORAGE_KEYS.ADMIN_SETTINGS_TTL]);
    const ttl = cached[STORAGE_KEYS.ADMIN_SETTINGS_TTL];
    if (cached[STORAGE_KEYS.ADMIN_SETTINGS] && ttl && Date.now() < ttl) {
      return { success: true, settings: cached[STORAGE_KEYS.ADMIN_SETTINGS] };
    }

    const authResult = await chrome.storage.local.get([STORAGE_KEYS.AUTH_TOKEN]);
    const token = authResult[STORAGE_KEYS.AUTH_TOKEN];

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${ADMIN_API_URL}/api/settings`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      if (cached[STORAGE_KEYS.ADMIN_SETTINGS]) {
        return { success: true, settings: cached[STORAGE_KEYS.ADMIN_SETTINGS] };
      }
      throw new Error('Failed to fetch admin settings');
    }

    const data = await response.json();

    const adminSettings: AdminSettings = {
      angles: data.prompts?.angles || [],
      principles: data.prompts?.principles || '',
      emailMaxWords: data.prompts?.emailMaxWords || 200,
      linkedinMaxWords: data.prompts?.linkedinMaxWords || 300,
    };

    await chrome.storage.local.set({
      [STORAGE_KEYS.ADMIN_SETTINGS]: adminSettings,
      [STORAGE_KEYS.ADMIN_SETTINGS_TTL]: Date.now() + ADMIN_SETTINGS_CACHE_TTL,
    });

    return { success: true, settings: adminSettings };
  } catch (error: any) {
    console.error('Fetch admin settings error:', error);
    const cached = await chrome.storage.local.get([STORAGE_KEYS.ADMIN_SETTINGS]);
    if (cached[STORAGE_KEYS.ADMIN_SETTINGS]) {
      return { success: true, settings: cached[STORAGE_KEYS.ADMIN_SETTINGS] };
    }
    return { success: false, error: error.message };
  }
}

// Capture screen context
async function handleGetContext(): Promise<any> {
  let tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tabs.length) {
    tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  }

  const tab = tabs[0];
  if (!tab?.id) {
    return { success: false, error: 'No active tab found' };
  }

  if (tab.url && !tab.url.startsWith('http')) {
    return { success: false, error: `Cannot capture context from: ${tab.url}` };
  }

  try {
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_CONTEXT' });
    if (response?.success) return response;
  } catch {
    // Content script not reachable
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content/content.js'],
    });
    await new Promise(resolve => setTimeout(resolve, 500));
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_CONTEXT' });
    return response;
  } catch (error: any) {
    return { success: false, error: `Failed to capture context: ${error.message}` };
  }
}

// Save generated content to history
async function saveToHistory(content: GeneratedContent): Promise<void> {
  const result = await chrome.storage.local.get([STORAGE_KEYS.HISTORY]);
  const history: GeneratedContent[] = result[STORAGE_KEYS.HISTORY] || [];
  history.unshift(content);
  const trimmedHistory = history.slice(0, 50);
  await chrome.storage.local.set({ [STORAGE_KEYS.HISTORY]: trimmedHistory });
}

console.log('Sales Extension: Background service worker loaded');
