import { useState } from 'react';
import { useStore } from '../store';
import { buildEmailSystemInstruction, buildEmailUserMessage } from '@shared/prompts';
import { generateId } from '@shared/utils';
import Button from '../components/Button';
import OutputDisplay from '../components/OutputDisplay';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ColdEmail() {
  const {
    formData,
    screenContext,
    isLoading,
    error,
    generatedContent,
    generateContent,
    addToHistory,
    captureScreenContext,
    settings,
    adminSettings,
  } = useStore();

  const [tone] = useState('professional');
  const [selectedAngleId, setSelectedAngleId] = useState<string>('');

  const handleGenerate = async () => {
    const systemInstruction = buildEmailSystemInstruction(formData, tone, settings || undefined, selectedAngleId || undefined);
    const userMessage = buildEmailUserMessage(screenContext || undefined);
    await generateContent({ systemInstruction, userMessage });

    // Save to history
    if (generatedContent) {
      await addToHistory({
        id: generateId(),
        type: 'email',
        content: generatedContent,
        timestamp: Date.now(),
        formData,
        screenContext: screenContext || undefined,
      });
    }
  };

  const { isAuthenticated } = useStore();
  const hasBusinessInfo = !!formData.companyName && !!formData.valueProposition;
  const isConfigured = isAuthenticated && hasBusinessInfo;
  const businessWarning = adminSettings?.businessInfoWarning?.trim()
    || '⚠️ Please add your business information (Company Name & Value Proposition) in Settings';

  return (
    <div className="tabs-content active">
      {/* Screen Context Indicator */}
      {screenContext ? (
        <div className="info-banner primary" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: '0.813rem', margin: 0 }}>
              📄 Context captured from: <strong>{screenContext.title}</strong>
            </p>
            <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.8 }}>
              {screenContext.url}
            </p>
          </div>
          <button
            onClick={captureScreenContext}
            className="secondary"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', height: 'auto', whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="info-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'hsl(var(--muted) / 0.3)', borderColor: 'hsl(var(--border))' }}>
          <p style={{ fontSize: '0.813rem', margin: 0 }}>
            No page context detected
          </p>
          <button
            onClick={captureScreenContext}
            className="secondary"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', height: 'auto', whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            Capture
          </button>
        </div>
      )}

      {/* Configuration Warnings */}
      {!isAuthenticated && (
        <div className="info-banner warning">
          <p style={{ fontSize: '0.813rem', margin: 0 }}>
            ⚠️ Please sign in with Google in Settings to generate content
          </p>
        </div>
      )}
      {isAuthenticated && !hasBusinessInfo && (
        <div className="info-banner warning">
          <p style={{ fontSize: '0.813rem', margin: 0 }}>
            {businessWarning}
          </p>
        </div>
      )}

      {/* Angle Selector */}
      {settings?.angles && settings.angles.length > 0 ? (
        <div style={{ marginBottom: '1rem' }}>
          <label className="label">Message Angle *</label>
          <select
            value={selectedAngleId}
            onChange={(e) => setSelectedAngleId(e.target.value)}
            className="input-field"
          >
            <option value="">Select an approach...</option>
            {settings.angles.map((angle) => (
              <option key={angle.id} value={angle.id}>
                {angle.name}
              </option>
            ))}
          </select>
          {selectedAngleId && (
            <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.7 }}>
              {settings.angles.find(a => a.id === selectedAngleId)?.prompt}
            </p>
          )}
        </div>
      ) : (
        <div className="info-banner" style={{ marginBottom: '1rem', backgroundColor: 'hsl(var(--muted) / 0.3)', borderColor: 'hsl(var(--border))' }}>
          <p style={{ fontSize: '0.813rem', margin: 0 }}>
            💡 Configure message angles in Settings → Advanced Prompt Settings
          </p>
        </div>
      )}

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        loading={isLoading}
        disabled={!isConfigured || isLoading}
        style={{ width: '100%' }}
      >
        ✉️ Generate Cold Email
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
