// Content Script - Screen Context Scraping

import { ScreenContext } from '@shared/types';
import { MESSAGE_TYPES } from '@shared/constants';

// Main scraper function
function getPageContext(): ScreenContext {
  const url = window.location.href;
  const title = document.title;
  const domain = window.location.hostname;

  // Get selected text if any
  const selectedText = window.getSelection()?.toString() || '';

  // Extract page content
  const content = extractPageContent();

  // Extract metadata
  const metadata = {
    author: getMetaContent('author'),
    date: getMetaContent('date') || getMetaContent('article:published_time'),
    domain,
  };

  return {
    url,
    title,
    content,
    metadata,
    selectedText: selectedText || undefined,
    timestamp: Date.now(),
  };
}

// Extract readable content from the page
function extractPageContent(): string {
  // Remove script, style, and other non-content elements
  const elementsToRemove = ['script', 'style', 'noscript', 'iframe', 'nav', 'header', 'footer'];
  const clone = document.cloneNode(true) as Document;
  
  elementsToRemove.forEach(tag => {
    const elements = clone.getElementsByTagName(tag);
    Array.from(elements).forEach(el => el.remove());
  });

  // Get text content
  const text = clone.body?.innerText || '';
  
  // Clean up multiple spaces and newlines
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim()
    .substring(0, 5000); // Limit to first 5000 characters
}

// Get meta tag content
function getMetaContent(name: string): string | undefined {
  const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  return meta?.getAttribute('content') || undefined;
}

// Site-specific handlers
function getLinkedInContext(): Partial<ScreenContext> {
  // LinkedIn-specific scraping logic
  const profileName = document.querySelector('.text-heading-xlarge')?.textContent?.trim();
  const headline = document.querySelector('.text-body-medium')?.textContent?.trim();
  
  return {
    content: `Profile: ${profileName || 'Unknown'}\nHeadline: ${headline || 'N/A'}\n${extractPageContent()}`,
  };
}

function getContextBySite(domain: string): ScreenContext {
  const baseContext = getPageContext();

  // Site-specific enhancements
  if (domain.includes('linkedin.com')) {
    return { ...baseContext, ...getLinkedInContext() };
  }

  return baseContext;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === MESSAGE_TYPES.GET_CONTEXT) {
    const domain = window.location.hostname;
    const context = getContextBySite(domain);
    sendResponse({ success: true, context });
  }
  return true; // Keep the message channel open for async response
});

// Initialize
console.log('Sales Extension: Content script loaded');
