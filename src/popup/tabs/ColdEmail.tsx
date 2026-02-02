import { useState } from 'react';
import { useStore } from '../store';
import { generateEmailPrompt } from '@shared/prompts';
import { generateId } from '@shared/utils';
import InputField from '../components/InputField';
import TextArea from '../components/TextArea';
import Button from '../components/Button';
import OutputDisplay from '../components/OutputDisplay';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ColdEmail() {
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
    const prompt = generateEmailPrompt(formData, screenContext, tone);
    await generateContent(prompt);

    // Save to history
    if (generatedContent) {
      await addToHistory({
        id: generateId(),
        type: 'email',
        content: generatedContent,
        variants,
        timestamp: Date.now(),
        formData,
        screenContext: screenContext || undefined,
      });
    }
  };

  const isFormValid = formData.companyName && formData.valueProposition;

  return (
    <div className="p-4 space-y-4">
      {/* Screen Context Indicator */}
      {screenContext && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
          <p className="text-xs font-medium text-primary-900">
            📄 Context captured from: {screenContext.title}
          </p>
          <p className="text-xs text-primary-700 mt-1">
            {screenContext.url}
          </p>
        </div>
      )}

      {/* Form Fields */}
      <InputField
        label="Company/Product Name *"
        placeholder="e.g., Acme Corp"
        value={formData.companyName}
        onChange={(e) => setFormData({ companyName: e.target.value })}
      />

      <TextArea
        label="Value Proposition *"
        placeholder="What unique value do you offer?"
        value={formData.valueProposition}
        onChange={(e) => setFormData({ valueProposition: e.target.value })}
      />

      <TextArea
        label="Customer Pain Points"
        placeholder="What problems does your target customer face?"
        value={formData.painPoints}
        onChange={(e) => setFormData({ painPoints: e.target.value })}
        helperText="Helps create a more targeted message"
      />

      <TextArea
        label="Call-to-Action"
        placeholder="e.g., Schedule a 15-minute demo"
        value={formData.callToAction}
        onChange={(e) => setFormData({ callToAction: e.target.value })}
      />

      <TextArea
        label="Social Proof"
        placeholder="Testimonials, metrics, or case studies"
        value={formData.socialProof}
        onChange={(e) => setFormData({ socialProof: e.target.value })}
      />

      {/* Tone Selector */}
      <div className="mb-4">
        <label className="label">Tone</label>
        <div className="flex gap-2">
          {['professional', 'casual', 'urgent', 'friendly'].map((t) => (
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

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        loading={isLoading}
        disabled={!isFormValid || isLoading}
        className="w-full"
      >
        Generate Cold Email
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
        <OutputDisplay
          content={variants[selectedVariant] || generatedContent}
          variants={variants}
          selectedVariant={selectedVariant}
          onVariantChange={setSelectedVariant}
        />
      )}
    </div>
  );
}
