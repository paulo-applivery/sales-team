# Sales Extension - Chrome Extension Development Plan

## Project Overview
A Chrome Extension that generates personalized cold emails, LinkedIn messages, and custom prompts using AI (Gemini API) based on screen context and user-defined business parameters.

---

## 1. Project Architecture

### 1.1 Core Components
- **Manifest V3** configuration
- **Popup UI** - Main interface with tabs
- **Content Script** - Screen context scraping
- **Background Service Worker** - API calls and data management
- **Storage** - Chrome Storage API for settings persistence

### 1.2 Technology Stack
- **Framework**: React + TypeScript
- **Build Tool**: Vite or Webpack
- **Styling**: Tailwind CSS (for consistency with reference project)
- **State Management**: React Context API or Zustand
- **API Integration**: Gemini API
- **Testing**: Jest + React Testing Library

---

## 2. Feature Breakdown

### 2.1 Tab Structure

#### Tab 1: Cold Email Generator
**Purpose**: Generate personalized cold emails based on context and user inputs

**Input Fields**:
- Screen context data (auto-captured)
- Company or product name
- Customer pain points
- Value proposition
- Call-to-action (CTA)
- Social proof
- Company overview
- Additional context
- Primary competitors
- Product differentiators

**Output**: 
- Generated email with copy button
- Edit capability
- Template variants (3-5 options)
- Tone selector (Professional, Casual, Urgent)

#### Tab 2: Cold LinkedIn Message
**Purpose**: Generate LinkedIn-optimized messages (shorter, more conversational)

**Input Fields**: Same as Cold Email

**Output**:
- LinkedIn-optimized message (shorter format)
- Character count indicator (2,000 char limit)
- Multiple variants
- Tone selector

#### Tab 3: Prompt Free
**Purpose**: Free-form AI assistant using screen context

**Input Fields**: 
- Same base fields as Cold Email
- Custom prompt input field
- Context inclusion toggle

**Output**:
- AI response based on custom prompt
- Conversation history
- Copy/edit functionality

#### Tab 4: Settings
**Purpose**: Configuration and data management

**Sections**:

1. **Screen Context Configuration**
   - Enable/disable auto-capture
   - Scraping rules selector:
     - Full page text
     - Visible viewport only
     - Selected text only
     - Custom CSS selectors
   - Exclude elements (ads, navigation, etc.)
   - Preview captured context

2. **Default Business Information**
   - Company or product name
   - Customer pain points (multi-line)
   - Value proposition
   - Call-to-action templates
   - Social proof (testimonials, metrics)
   - Company overview
   - Additional context
   - Primary competitors (list)
   - Product differentiators (list)

3. **API Configuration**
   - Gemini API key (masked input)
   - API key validation
   - Model selection (Gemini Pro, Flash, etc.)
   - Temperature/creativity slider
   - Max tokens configuration

4. **Additional Features** (Plus)
   - Custom prompts library (save/manage templates)
   - Output history (last 50 generations)
   - Export settings (JSON backup)
   - Import settings
   - Dark/light theme toggle
   - Font size adjustment
   - Keyboard shortcuts configuration
   - Language preference
   - Auto-save drafts
   - Rate limiting indicator

---

## 3. UI/UX Design

### 3.1 Reference Project Integration
- Extract color palette from `/Users/paulo/Documents/trae_projects/api-reference/`
- Maintain consistent spacing, typography, and component styles
- Use similar button styles, input fields, and card components

### 3.2 Layout Structure
```
┌─────────────────────────────────────┐
│  Sales Extension          [×]       │
├─────────────────────────────────────┤
│  [Cold Email] [LinkedIn] [Free] [⚙]│
├─────────────────────────────────────┤
│                                     │
│  Tab Content Area                   │
│  - Input fields                     │
│  - Generate button                  │
│  - Output area                      │
│                                     │
└─────────────────────────────────────┘
```

### 3.3 Dimensions
- Width: 400px
- Height: 600px (adjustable)
- Responsive design for different screen sizes

### 3.4 Key UI Elements
- **Tabs**: Material-style or custom styled tabs
- **Input Fields**: Grouped in expandable sections
- **Buttons**: Primary (Generate), Secondary (Copy, Edit, Clear)
- **Output Area**: Syntax-highlighted, scrollable, with copy button
- **Loading States**: Skeleton screens and spinners
- **Error States**: Toast notifications or inline error messages

---

## 4. Screen Context Scraping

### 4.1 Content Script Implementation
```javascript
// Capture strategies
- Document.body.innerText (basic)
- Readability.js integration (article extraction)
- Custom selectors for specific sites (LinkedIn, email clients)
- DOM parsing with sanitization
```

### 4.2 Context Data Structure
```typescript
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
```

### 4.3 Site-Specific Handlers
- **LinkedIn**: Profile data, company info, job postings
- **Company websites**: About pages, product pages
- **Email clients**: Existing conversation context
- **CRM platforms**: Contact information

---

## 5. AI Integration (Gemini API)

### 5.1 Prompt Engineering
**Cold Email Template**:
```
You are an expert sales copywriter. Generate a personalized cold email.

Context from webpage: {screenContext}
Company: {companyName}
Pain Points: {painPoints}
Value Proposition: {valueProposition}
CTA: {cta}
Social Proof: {socialProof}
Company Overview: {companyOverview}
Additional Context: {additionalContext}
Competitors: {competitors}
Differentiators: {differentiators}

Guidelines:
- Professional yet personable tone
- 150-200 words
- Clear subject line
- Strong opening hook
- One clear CTA
- Avoid jargon
```

### 5.2 API Call Structure
- Rate limiting (10 requests/minute)
- Error handling and retry logic
- Token counting and optimization
- Streaming responses for better UX

### 5.3 Model Configuration
- Default: Gemini 1.5 Pro
- Fallback: Gemini 1.5 Flash
- Temperature: 0.7 (balanced creativity)
- Max tokens: 1000 for emails, 500 for LinkedIn

---

## 6. Data Storage

### 6.1 Chrome Storage API
```typescript
interface StorageSchema {
  settings: {
    apiKey: string;
    model: string;
    temperature: number;
    scrapingMode: string;
    theme: 'light' | 'dark';
  };
  defaults: {
    companyName: string;
    painPoints: string[];
    valueProposition: string;
    // ... other defaults
  };
  history: GeneratedContent[];
  templates: CustomPrompt[];
}
```

### 6.2 Data Persistence
- Auto-save on field change (debounced)
- Sync across devices using chrome.storage.sync
- Local storage for history (chrome.storage.local)
- Maximum storage: 100KB for sync, unlimited for local

---

## 7. Development Phases

### Phase 1: Project Setup (Week 1)
- [ ] Initialize React + TypeScript + Vite project
- [ ] Configure Tailwind CSS
- [ ] Extract colors/styles from reference project
- [ ] Set up Chrome Extension manifest
- [ ] Create basic folder structure
- [ ] Set up ESLint, Prettier, Git

### Phase 2: Core UI (Week 2)
- [ ] Build tab navigation component
- [ ] Create reusable form components
- [ ] Implement Cold Email tab UI
- [ ] Implement LinkedIn Message tab UI
- [ ] Implement Prompt Free tab UI
- [ ] Implement Settings tab UI
- [ ] Add loading and error states

### Phase 3: Content Script (Week 3)
- [ ] Implement basic screen scraping
- [ ] Add site-specific handlers
- [ ] Create context preview in popup
- [ ] Add scraping configuration options
- [ ] Test on various websites

### Phase 4: AI Integration (Week 4)
- [ ] Set up Gemini API integration
- [ ] Implement prompt templates
- [ ] Add response parsing and formatting
- [ ] Implement variants generation
- [ ] Add streaming responses
- [ ] Error handling and fallbacks

### Phase 5: Settings & Storage (Week 5)
- [ ] Implement Chrome Storage API
- [ ] Build settings persistence
- [ ] Create defaults management
- [ ] Add import/export functionality
- [ ] Implement history tracking

### Phase 6: Polish & Features (Week 6)
- [ ] Add custom prompts library
- [ ] Implement keyboard shortcuts
- [ ] Add dark mode
- [ ] Create onboarding flow
- [ ] Add analytics (privacy-focused)
- [ ] Performance optimization

### Phase 7: Testing & Launch (Week 7)
- [ ] Unit testing (80% coverage)
- [ ] Integration testing
- [ ] Manual testing on multiple sites
- [ ] Security audit
- [ ] Chrome Web Store submission
- [ ] Documentation and user guide

---

## 8. File Structure

```
sales-extension/
├── public/
│   ├── manifest.json
│   ├── icons/
│   │   ├── icon16.png
│   │   ├── icon48.png
│   │   └── icon128.png
│   └── _locales/ (for i18n)
├── src/
│   ├── popup/
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   ├── tabs/
│   │   │   ├── ColdEmail.tsx
│   │   │   ├── LinkedIn.tsx
│   │   │   ├── PromptFree.tsx
│   │   │   └── Settings.tsx
│   │   ├── components/
│   │   │   ├── TabNavigation.tsx
│   │   │   ├── InputField.tsx
│   │   │   ├── TextArea.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── OutputDisplay.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   └── styles/
│   │       ├── globals.css
│   │       └── theme.ts
│   ├── content/
│   │   ├── content.ts
│   │   ├── scraper.ts
│   │   └── siteHandlers.ts
│   ├── background/
│   │   ├── service-worker.ts
│   │   ├── api/
│   │   │   └── gemini.ts
│   │   └── storage.ts
│   ├── shared/
│   │   ├── types.ts
│   │   ├── constants.ts
│   │   ├── utils.ts
│   │   └── prompts.ts
│   └── assets/
│       └── images/
├── tests/
│   ├── unit/
│   └── integration/
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## 9. Security Considerations

### 9.1 API Key Protection
- Store API keys encrypted in chrome.storage
- Never log API keys
- Validate key format before storage
- Clear text warnings about key security

### 9.2 Content Security Policy
```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

### 9.3 Permissions
- Minimize requested permissions
- Request only: `activeTab`, `storage`, `scripting`
- Justify each permission in store listing

### 9.4 Data Privacy
- No data sent to external servers (except Gemini API)
- Clear privacy policy
- User data never stored on backend
- GDPR compliance considerations

---

## 10. Performance Optimization

- Lazy load tab content
- Debounce user inputs (300ms)
- Cache API responses (5 minutes)
- Optimize bundle size (<500KB)
- Use Web Workers for heavy processing
- Virtual scrolling for long lists

---

## 11. Accessibility

- Keyboard navigation support (Tab, Enter, Esc)
- ARIA labels for all interactive elements
- Screen reader compatible
- High contrast mode support
- Focus indicators
- Error messages read by screen readers

---

## 12. Future Enhancements

1. **Multi-language support** (i18n)
2. **A/B testing** for generated content
3. **Integration with CRMs** (Salesforce, HubSpot)
4. **Email preview** with rendering
5. **Sentiment analysis** of generated content
6. **Team collaboration** features (shared templates)
7. **Analytics dashboard** (success metrics)
8. **Chrome sidebar** support
9. **Voice input** for prompts
10. **Mobile companion app**

---

## 13. Success Metrics

- Installation rate
- Daily active users (DAU)
- Generation completion rate
- Average generations per user
- User retention (7-day, 30-day)
- Chrome Web Store rating
- Support ticket volume

---

## 14. Next Steps

1. **Review and approve** this plan
2. **Extract UI reference** - Manually document colors, fonts, spacing from reference project
3. **Set up development environment**
4. **Create mockups** in Figma (optional)
5. **Begin Phase 1** implementation
6. **Weekly check-ins** for progress review

---

## Notes

- Estimated total development time: **7-8 weeks**
- Recommended team: 1-2 developers
- Budget considerations: Gemini API costs (~$0.001 per request)
- Chrome Web Store fee: $5 one-time registration

