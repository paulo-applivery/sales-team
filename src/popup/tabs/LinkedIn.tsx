import { useState } from 'react';
import { useStore } from '../store';
import { generateLinkedInPrompt } from '@shared/prompts';
import { generateId, countCharacters } from '@shared/utils';
import InputField from '../components/InputField';
import TextArea from '../components/TextArea';
import Button from '../components/Button';
import OutputDisplay from '../components/OutputDisplay';
import LoadingSpinner from '../components/LoadingSpinner';

export default function LinkedIn() {
  const {
    formData,
    setFormData,
    screenContext,
    isLoading,
    error,
    generatedContent,
    variants,
    selectedVariant,
    setSelectedVariant,
    generateContent,
    addToHistory,
  } = useStore();

  const [tone, setTone] = useState('professional');

  const handleGenerate = async () => {
    const prompt = generateLinkedInPrompt(formData, screenContext || undefined, tone);
    await generateContent(prompt);

    // Save to history
    if (generatedContent) {
      await addToHistory({
        id: generateId(),
        type: 'linkedin',
        content: generatedContent,
        variants,
        timestamp: Date.now(),
        formData,
        screenContext: screenContext || undefined,
      });
    }
  };

  const isFormValid = formData.companyName && formData.valueProposition;
  const charCount = countCharacters(generatedContent);

  return (
    <div className="p-4 space-y-4">
      {/* LinkedIn Context Indicator */}
      {screenContext?.url?.includes('linkedin.com') && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs font-medium text-blue-900">
            💼 LinkedIn profile detected
          </p>
          <p className="text-xs text-blue-700 mt-1">
            Message will be optimized for LinkedIn format
          </p>
        </div>
      )}

      {/* Form Fields - Same as Email but condensed */}
      <InputField
        label="Company/Product Name *"
        placeholder="e.g., Acme Corp"
        value={formData.companyName}
        onChange={(e) => setFormData({ companyName: e.target.value })}
      />

      <TextArea
        label="Value Proposition *"
        placeholder="Keep it brief for LinkedIn"
        value={formData.valueProposition}
        onChange={(e) => setFormData({ valueProposition: e.target.value })}
        rows={2}
      />

      <TextArea
        label="Customer Pain Points"
        placeholder="Key problems you solve"
        value={formData.painPoints}
        onChange={(e) => setFormData({ painPoints: e.target.value })}
        rows={2}
      />

      <TextArea
        label="Call-to-Action"
        placeholder="e.g., Would you be open to a quick chat?"
        value={formData.callToAction}
        onChange={(e) => setFormData({ callToAction: e.target.value })}
        rows={2}
      />

      {/* Tone Selector */}
      <div className="mb-4">
        <label className="label">Tone</label>
        <div className="flex gap-2">
          {['professional', 'casual', 'friendly'].map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={`
                px-3 py-2 text-sm rounded-md transition-colors capitalize
                ${
                  tone === t
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-200 text-secondary-700 hover:bg-secondary-300'
                }
              `}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* LinkedIn Character Limit Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-xs text-yellow-800">
          ℹ️ LinkedIn messages have a 2,000 character limit
        </p>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        loading={isLoading}
        disabled={!isFormValid || isLoading}
        className="w-full"
      >
        Generate LinkedIn Message
      </Button>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && <LoadingSpinner />}

      {/* Output Display with Character Count */}
      {!isLoading && generatedContent && (
        <>
          <div className="flex justify-between items-center px-2">
            <span className="text-xs text-secondary-600">
              {charCount} / 2,000 characters
            </span>
            {charCount > 2000 && (
              <span className="text-xs text-red-600 font-medium">
                ⚠️ Exceeds limit
              </span>
            )}
          </div>
          <OutputDisplay
            content={variants[selectedVariant] || generatedContent}
            variants={variants}
            selectedVariant={selectedVariant}
            onVariantChange={setSelectedVariant}
          />
        </>
      )}
    </div>
  );
}
