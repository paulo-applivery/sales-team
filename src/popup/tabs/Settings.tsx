import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { SCRAPING_MODES, MODEL_OPTIONS } from '@shared/constants';
import { isValidApiKey, maskApiKey } from '@shared/utils';
import InputField from '../components/InputField';
import TextArea from '../components/TextArea';
import Button from '../components/Button';

export default function Settings() {
  const { settings, setSettings, saveSettings, formData, setFormData } = useStore();
  
  const [localSettings, setLocalSettings] = useState(settings || {
    apiKey: '',
    model: 'gemini-1.5-pro',
    temperature: 0.7,
    maxTokens: 1000,
    scrapingMode: 'full' as const,
    theme: 'light' as const,
    autoSave: true,
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [apiKeyError, setApiKeyError] = useState('');

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    // Validate API key
    if (localSettings.apiKey && !isValidApiKey(localSettings.apiKey)) {
      setApiKeyError('Invalid API key format');
      return;
    }

    setSaveStatus('saving');
    setApiKeyError('');

    try {
      await saveSettings(localSettings);
      
      // Also save defaults
      await chrome.storage.local.set({ sales_ext_defaults: formData });
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleExportSettings = () => {
    const exportData = {
      settings: localSettings,
      defaults: formData,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-extension-settings-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-6">
      {/* API Configuration Section */}
      <section>
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">
          🔑 API Configuration
        </h2>

        <div className="space-y-4">
          <div>
            <label className="label">Gemini API Key *</label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                placeholder="Enter your Gemini API key"
                value={localSettings.apiKey}
                onChange={(e) => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
                className={`input-field pr-20 ${apiKeyError ? 'border-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-secondary-600 hover:text-secondary-900"
              >
                {showApiKey ? 'Hide' : 'Show'}
              </button>
            </div>
            {apiKeyError && <p className="error-text">{apiKeyError}</p>}
            <p className="text-xs text-secondary-500 mt-1">
              Get your API key from{' '}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          <div>
            <label className="label">Model</label>
            <select
              value={localSettings.model}
              onChange={(e) => setLocalSettings({ ...localSettings, model: e.target.value })}
              className="input-field"
            >
              {MODEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">
              Temperature (Creativity): {localSettings.temperature}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={localSettings.temperature}
              onChange={(e) => setLocalSettings({ ...localSettings, temperature: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-secondary-600 mt-1">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>

          <InputField
            label="Max Tokens"
            type="number"
            min="100"
            max="2000"
            value={localSettings.maxTokens}
            onChange={(e) => setLocalSettings({ ...localSettings, maxTokens: parseInt(e.target.value) })}
            helperText="Maximum length of generated content"
          />
        </div>
      </section>

      {/* Screen Context Configuration */}
      <section className="border-t border-secondary-200 pt-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">
          📄 Screen Context Settings
        </h2>

        <div>
          <label className="label">Scraping Mode</label>
          <select
            value={localSettings.scrapingMode}
            onChange={(e) => setLocalSettings({ ...localSettings, scrapingMode: e.target.value as any })}
            className="input-field"
          >
            {SCRAPING_MODES.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {mode.label} - {mode.description}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Default Business Information */}
      <section className="border-t border-secondary-200 pt-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">
          🏢 Default Business Information
        </h2>
        <p className="text-sm text-secondary-600 mb-4">
          These values will be pre-filled in all tabs
        </p>

        <div className="space-y-4">
          <InputField
            label="Company/Product Name"
            placeholder="Your company name"
            value={formData.companyName}
            onChange={(e) => setFormData({ companyName: e.target.value })}
          />

          <TextArea
            label="Company Overview"
            placeholder="Brief description of your company"
            value={formData.companyOverview}
            onChange={(e) => setFormData({ companyOverview: e.target.value })}
          />

          <TextArea
            label="Value Proposition"
            placeholder="What makes you unique?"
            value={formData.valueProposition}
            onChange={(e) => setFormData({ valueProposition: e.target.value })}
          />

          <TextArea
            label="Customer Pain Points"
            placeholder="Common problems your customers face"
            value={formData.painPoints}
            onChange={(e) => setFormData({ painPoints: e.target.value })}
          />

          <TextArea
            label="Social Proof"
            placeholder="Testimonials, case studies, metrics"
            value={formData.socialProof}
            onChange={(e) => setFormData({ socialProof: e.target.value })}
          />

          <TextArea
            label="Primary Competitors"
            placeholder="List your main competitors"
            value={formData.competitors}
            onChange={(e) => setFormData({ competitors: e.target.value })}
          />

          <TextArea
            label="Product Differentiators"
            placeholder="What sets you apart from competitors?"
            value={formData.differentiators}
            onChange={(e) => setFormData({ differentiators: e.target.value })}
          />
        </div>
      </section>

      {/* Additional Features */}
      <section className="border-t border-secondary-200 pt-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">
          ✨ Additional Features
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-secondary-900">Auto-save</p>
              <p className="text-xs text-secondary-600">Automatically save form data</p>
            </div>
            <button
              onClick={() => setLocalSettings({ ...localSettings, autoSave: !localSettings.autoSave })}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${localSettings.autoSave ? 'bg-primary-600' : 'bg-secondary-300'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${localSettings.autoSave ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          <Button
            variant="secondary"
            onClick={handleExportSettings}
            className="w-full"
          >
            📥 Export Settings
          </Button>
        </div>
      </section>

      {/* Save Button */}
      <div className="sticky bottom-0 bg-white pt-4 border-t border-secondary-200">
        <Button
          onClick={handleSaveSettings}
          loading={saveStatus === 'saving'}
          className="w-full"
        >
          {saveStatus === 'saved' ? '✓ Saved!' : 'Save Settings'}
        </Button>

        {saveStatus === 'error' && (
          <p className="text-sm text-red-600 mt-2 text-center">
            Failed to save settings. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}
