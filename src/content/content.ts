// Content Script - Screen Context Scraping
//
// IMPORTANT: Content scripts in MV3 cannot use ES module imports.
// Vite code-splits shared imports into separate chunks that content scripts
// cannot load. All types and constants must be inlined here.

interface ScreenContext {
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

// Inlined from @shared/constants — must match MESSAGE_TYPES.GET_CONTEXT
const MSG_GET_CONTEXT = 'GET_CONTEXT';

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

// Extract readable content from the page without cloning the DOM
function extractPageContent(): string {
  const tagsToSkip = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'NAV', 'HEADER', 'FOOTER', 'SVG']);

  function walkNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent?.trim() || '';
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    const el = node as Element;
    if (tagsToSkip.has(el.tagName)) return '';
    if (el.getAttribute('aria-hidden') === 'true') return '';

    const parts: string[] = [];
    for (const child of Array.from(el.childNodes)) {
      const text = walkNode(child);
      if (text) parts.push(text);
    }
    return parts.join(' ');
  }

  const raw = walkNode(document.body);
  return raw
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .substring(0, 10000);
}

// Get meta tag content
function getMetaContent(name: string): string | undefined {
  const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  return meta?.getAttribute('content') || undefined;
}

// LinkedIn-specific context extraction with resilient selectors
function getLinkedInContext(): Partial<ScreenContext> {
  // Try multiple selector strategies for profile name
  const profileName =
    document.querySelector('.text-heading-xlarge')?.textContent?.trim() ||
    document.querySelector('h1.inline')?.textContent?.trim() ||
    document.querySelector('[data-anonymize="person-name"]')?.textContent?.trim() ||
    document.querySelector('h1')?.textContent?.trim();

  // Try multiple selector strategies for headline
  const headline =
    document.querySelector('.text-body-medium.break-words')?.textContent?.trim() ||
    document.querySelector('.text-body-medium')?.textContent?.trim() ||
    document.querySelector('[data-anonymize="headline"]')?.textContent?.trim();

  // Try to get experience/about sections
  const aboutSection =
    document.querySelector('#about + .display-flex .inline-show-more-text')?.textContent?.trim() ||
    document.querySelector('section.pv-about-section')?.textContent?.trim() ||
    '';

  const parts = [
    profileName ? `Name: ${profileName}` : '',
    headline ? `Headline: ${headline}` : '',
    aboutSection ? `About: ${aboutSection}` : '',
  ].filter(Boolean);

  // Append general page content as fallback
  const pageContent = extractPageContent();
  parts.push(pageContent);

  return {
    content: parts.join('\n'),
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

// Listen for messages from service worker
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === MSG_GET_CONTEXT) {
    try {
      const domain = window.location.hostname;
      const context = getContextBySite(domain);
      sendResponse({ success: true, context });
    } catch (error) {
      sendResponse({ success: false, error: String(error) });
    }
  }
  return true;
});

console.log('Sales Extension: Content script loaded');
