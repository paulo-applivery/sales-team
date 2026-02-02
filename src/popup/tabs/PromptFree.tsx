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

  const isFormValid = customPrompt.trim().length > 0;

  return (
    <div className="p-4 space-y-4">
      {/* Info Banner */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
        <p className="text-sm font-medium text-primary-900">
          ✨ Free-form AI Assistant
        </p>
        <p className="text-xs text-primary-700 mt-1">
          Ask anything! Your business context will be automatically included.
        </p>
      </div>

      {/* Context Toggle */}
      <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
        <div>
          <p className="text-sm font-medium text-secondary-900">
            Include Screen Context
          </p>
          <p className="text-xs text-secondary-600 mt-0.5">
            Add webpage data to your prompt
          </p>
        </div>
        <button
          onClick={() => setIncludeContext(!includeContext)}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${includeContext ? 'bg-primary-600' : 'bg-secondary-300'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${includeContext ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>

      {/* Screen Context Preview */}
      {includeContext && screenContext && (
        <div className="bg-secondary-50 rounded-lg p-3">
          <p className="text-xs font-medium text-secondary-900 mb-2">
            📄 Current Context:
          </p>
          <p className="text-xs text-secondary-700 line-clamp-2">
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
      <div className="space-y-2">
        <p className="text-xs font-medium text-secondary-700">Quick Examples:</p>
        <div className="flex flex-wrap gap-2">
          {[
            'Write a follow-up email',
            'Create a meeting agenda',
            'Draft a value proposition',
            'Write a product description',
          ].map((example) => (
            <button
              key={example}
              onClick={() => setCustomPrompt(example)}
              className="px-3 py-1 text-xs bg-secondary-100 text-secondary-700 rounded-full hover:bg-secondary-200 transition-colors"
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
        disabled={!isFormValid || isLoading}
        className="w-full"
      >
        Generate Content
      </Button>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{error}</p>
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
