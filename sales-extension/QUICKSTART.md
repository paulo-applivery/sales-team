# Quick Start Guide

## 🚀 Get Started in 3 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Build the Extension
```bash
npm run build
```

### Step 3: Load in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Select the `dist` folder

### Step 4: Get API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key

### Step 5: Configure Extension
1. Click the extension icon in Chrome
2. Go to "Settings" tab (⚙️)
3. Paste your API key
4. Fill in your company information
5. Click "Save Settings"

## ✅ You're Ready!

Now you can:
- Navigate to any webpage
- Click the extension
- Generate cold emails, LinkedIn messages, or custom content

## 🎯 Next Steps

### Customize Colors (from reference project)
Since the reference project `/Users/paulo/Documents/trae_projects/api-reference/` is outside the workspace, you'll need to manually:

1. Open the reference project
2. Extract color values from their CSS/config files
3. Update `tailwind.config.js`:
   ```javascript
   colors: {
     primary: {
       // Replace with reference project colors
     }
   }
   ```
4. Update `src/popup/styles/globals.css` with matching styles

### Customize Prompts
Edit `src/shared/prompts.ts` to adjust AI generation templates

### Add Features
- New tabs: Add to `src/popup/tabs/`
- New components: Add to `src/popup/components/`
- Update constants: Edit `src/shared/constants.ts`

## 🛠️ Development Commands

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📝 Testing the Extension

### Test Cold Email Tab
1. Navigate to a company website
2. Open extension
3. Go to "Cold Email" tab
4. Fill in form or use defaults
5. Click "Generate Cold Email"
6. Choose variant and copy

### Test LinkedIn Tab
1. Navigate to a LinkedIn profile
2. Open extension
3. Go to "LinkedIn" tab
4. Generate message
5. Verify it's under 2,000 characters

### Test Prompt Free Tab
1. Open extension
2. Go to "Prompt Free" tab
3. Enter custom prompt
4. Toggle context on/off
5. Generate content

## 🐛 Common Issues

### Build errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Extension not showing
- Ensure `npm run build` completed successfully
- Check `dist` folder exists
- Reload extension in Chrome

### API errors
- Verify API key is valid
- Check internet connection
- Review API quota limits

## 📚 Project Structure

```
sales-extension/
├── src/
│   ├── popup/          # Main UI (React)
│   ├── content/        # Screen scraping
│   ├── background/     # API & storage
│   └── shared/         # Utils & types
├── public/
│   ├── manifest.json   # Extension config
│   └── icons/          # Extension icons
└── dist/               # Built extension (load this in Chrome)
```

## 🎨 Customization Checklist

- [ ] Extract colors from reference project
- [ ] Update `tailwind.config.js`
- [ ] Update `src/popup/styles/globals.css`
- [ ] Customize AI prompts in `src/shared/prompts.ts`
- [ ] Replace placeholder icons in `public/icons/`
- [ ] Add company logo/branding
- [ ] Customize default settings

## 🚢 Deployment Checklist

Before publishing to Chrome Web Store:
- [ ] Test on multiple websites
- [ ] Verify all tabs work correctly
- [ ] Test with different API keys
- [ ] Check error handling
- [ ] Update icons (replace SVG placeholders)
- [ ] Write detailed store description
- [ ] Add screenshots
- [ ] Review privacy policy
- [ ] Test on fresh Chrome profile

## 💡 Tips

- Use Settings to save defaults and avoid re-typing
- Export settings to backup your configuration
- Check History tab (future feature) for past generations
- Adjust temperature for more/less creative outputs
- Use different models based on speed/quality needs

---

Happy selling! 🎉
