# Sales Extension

AI-powered Chrome Extension for generating personalized cold emails, LinkedIn messages, and custom sales content using Google's Gemini API.

## Features

- **Cold Email Generator**: Create personalized cold emails based on screen context and business parameters
- **LinkedIn Message Generator**: Generate LinkedIn-optimized connection messages
- **Free-form AI Assistant**: Custom prompt-based content generation
- **Screen Context Scraping**: Automatically capture webpage content for context
- **Settings Management**: Configure API, default business info, and preferences

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))
- Chrome browser

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Build the extension**
   ```bash
   npm run build
   ```

3. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the `dist` folder from this project

4. **Configure the extension**
   - Click the extension icon in Chrome toolbar
   - Go to Settings tab
   - Enter your Gemini API key
   - Fill in your default business information
   - Click "Save Settings"

## Development

### Run in development mode
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

### Lint code
```bash
npm run lint
```

### Type checking
```bash
npm run type-check
```

## Project Structure

```
sales-extension/
├── public/
│   ├── manifest.json          # Chrome extension manifest
│   └── icons/                 # Extension icons
├── src/
│   ├── popup/                 # Main UI
│   │   ├── App.tsx           # Root component
│   │   ├── store.ts          # Zustand state management
│   │   ├── components/       # Reusable UI components
│   │   ├── tabs/             # Tab components
│   │   └── styles/           # Global styles
│   ├── content/              # Content scripts
│   │   └── content.ts        # Screen scraping
│   ├── background/           # Service worker
│   │   └── service-worker.ts # API calls & storage
│   └── shared/               # Shared utilities
│       ├── types.ts          # TypeScript types
│       ├── constants.ts      # App constants
│       ├── utils.ts          # Helper functions
│       └── prompts.ts        # AI prompt templates
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Usage

### 1. Cold Email Tab
- The extension automatically captures context from the current webpage
- Fill in your company details (or use defaults from Settings)
- Select a tone (Professional, Casual, Urgent, Friendly)
- Click "Generate Cold Email"
- Choose from 3 variants
- Copy to clipboard

### 2. LinkedIn Message Tab
- Navigate to a LinkedIn profile
- Fill in key information
- Generate LinkedIn-optimized message (under 2,000 chars)
- Copy and send

### 3. Prompt Free Tab
- Write any custom prompt
- Toggle screen context inclusion
- Generate custom content based on your needs
- Great for follow-ups, meeting agendas, etc.

### 4. Settings Tab
- **API Configuration**: Set up Gemini API key and model preferences
- **Screen Context**: Configure how content is scraped
- **Default Business Info**: Pre-fill your company details
- **Additional Features**: Export/import settings

## API Costs

Gemini API pricing (as of 2026):
- **Gemini 1.5 Flash**: Free up to 15 requests/min
- **Gemini 1.5 Pro**: $0.00025 per 1K characters

Estimated cost: ~$0.001 per email generation

## Customization

### Update Colors/Theme
Edit `tailwind.config.js` and `src/popup/styles/globals.css` to match your brand colors.

### Modify Prompts
Edit `src/shared/prompts.ts` to customize AI prompt templates.

### Add Custom Features
- Create new tabs in `src/popup/tabs/`
- Add new components in `src/popup/components/`
- Update navigation in `src/shared/constants.ts`

## Troubleshooting

### Extension not loading
- Ensure you've run `npm run build` first
- Check Chrome DevTools for console errors
- Verify all dependencies are installed

### API errors
- Verify API key is correct in Settings
- Check API quota limits
- Ensure internet connection

### Content not captured
- Some websites block content scripts
- Try different scraping modes in Settings
- Check browser console for errors

## Security & Privacy

- API keys are stored locally using Chrome Storage API
- No data is sent to external servers except Gemini API
- All processing happens client-side
- Content script only reads page content (no modifications)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
- Check existing GitHub issues
- Create a new issue with details
- Include browser version and error messages

## Roadmap

- [ ] Multi-language support
- [ ] Custom prompt templates library
- [ ] Integration with popular CRMs
- [ ] A/B testing for generated content
- [ ] Team collaboration features
- [ ] Analytics dashboard

---

Built with ❤️ using React, TypeScript, Vite, and Tailwind CSS
