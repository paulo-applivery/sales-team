import { useState } from 'react';
import { copyToClipboard } from '@shared/utils';

interface OutputDisplayProps {
  content: string;
  variants?: string[];
  selectedVariant?: number;
  onVariantChange?: (index: number) => void;
}

export default function OutputDisplay({ 
  content, 
  variants = [], 
  selectedVariant = 0,
  onVariantChange 
}: OutputDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(content);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!content) {
    return null;
  }

  return (
    <div className="output-display">
      {/* Variant Selector */}
      {variants.length > 1 && (
        <div className="variant-buttons">
          {variants.map((_, index) => (
            <button
              key={index}
              onClick={() => onVariantChange?.(index)}
              className={`variant-button ${selectedVariant === index ? 'active' : ''}`}
            >
              Variant {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* Content Display */}
      <div className="card">
        <pre className="output-content">{content}</pre>
      </div>

      {/* Actions */}
      <div className="actions-row">
        <button onClick={handleCopy}>
          {copied ? (
            <>
              <span>✓</span>
              Copied!
            </>
          ) : (
            <>
              <span>📋</span>
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}
