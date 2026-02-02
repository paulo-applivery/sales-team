import { useState } from 'react';
import { useStore } from '../store';
import { generateCustomPrompt } from '@shared/prompts';
import { generateId } from '@shared/utils';
import TextArea from '../components/TextArea';
import Button from '../components/Button';
import OutputDisplay from '../components/OutputDisplay';
import LoadingSpinner from '../components/LoadingSpinner';

export default function PromptFree() {
  const {
    formData,
    screenContext,
    isLoading,
    error,
    generatedContent,
    generateContent,
    addToHistory,
  } = useStore();

  const [customPrompt, setCustomPrompt] = useState('');
  const [includeContext, setIncludeContext] = useState(true);

  const handleGenerate = async () => {
    const prompt = generateCustomPrompt(customPrompt, formData, includeContext ? screenContext || undefined : undefined);
    await generateContent(prompt);

    // Save to history
    if (generatedContent) {
      await addToHistory({
        id: generateId(),
        type: 'custom',
        content: generatedContent,
        timestamp: Date.now(),
        formData,
        screenContext: includeContext ? (screenContext || undefined) : undefined,
      });
    }
  };

  const { isAuthenticated } = useStore();
  const isConfigured = isAuthenticated;
  const isFormValid = customPrompt.trim().length > 0;

  return (
    <div className="tabs-content active">
      {/* Info Banner */}
      <div className="info-banner primary">
        <p style={{ fontSize: '0.875rem', fontWeight: 500, margin: 0 }}>
          ✨ Free-form AI Assistant
        </p>
        <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.8 }}>
          Ask anything! Your business context will be automatically included.
        </p>
      </div>

      {/* Configuration Warning */}
      {!isConfigured && (
        <div className="info-banner warning">
          <p style={{ fontSize: '0.813rem', margin: 0 }}>
            ⚠️ Please sign in with Google in Settings to generate content
          </p>
        </div>
      )}

      {/* Context Toggle */}
      <div className="toggle-container">
        <div className="toggle-info">
          <div className="toggle-title">Include Screen Context</div>
          <div className="toggle-desc">Add webpage data to your prompt</div>
        </div>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={includeContext}
            onChange={(e) => setIncludeContext(e.target.checked)}
          />
          <span className="toggle-slider"></span>
        </label>
      </div>

      {/* Screen Context Preview */}
      {includeContext && screenContext && (
        <div className="card" style={{ padding: '0.75rem', marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 500, margin: 0, marginBottom: '0.5rem' }}>
            📄 Current Context:
          </p>
          <p style={{ fontSize: '0.75rem', opacity: 0.8, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {screenContext.title} - {screenContext.url}
          </p>
        </div>
      )}

      {/* Custom Prompt Input */}
      <TextArea
        label="Your Prompt"
        placeholder="e.g., Write a follow-up email for someone who didn't respond to my first message..."
        value={customPrompt}
        onChange={(e) => setCustomPrompt(e.target.value)}
        rows={6}
        helperText="Be specific about what you want the AI to generate"
      />

      {/* Example Prompts */}
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.5rem' }}>Quick Examples:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {[
            'Write a follow-up email',
            'Create a meeting agenda',
            'Draft a value proposition',
            'Write a product description',
          ].map((example) => (
            <button
              key={example}
              onClick={() => setCustomPrompt(example)}
              className="secondary"
              style={{ 
                padding: '0.375rem 0.75rem', 
                height: 'auto', 
                fontSize: '0.75rem',
                borderRadius: '9999px'
              }}
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        loading={isLoading}
        disabled={!isConfigured || !isFormValid || isLoading}
        style={{ width: '100%' }}
      >
        Generate Content
      </Button>

      {/* Error Display */}
      {error && (
        <div className="error-message" style={{ marginTop: '1rem' }}>
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && <LoadingSpinner />}

      {/* Output Display */}
      {!isLoading && generatedContent && (
        <OutputDisplay content={generatedContent} />
      )}
    </div>
  );
}
