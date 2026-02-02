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
    <div className="card animate-slide-in-up">
      {/* Variant Selector */}
      {variants.length > 1 && (
        <div className="flex gap-2 mb-3">
          {variants.map((_, index) => (
            <button
              key={index}
              onClick={() => onVariantChange?.(index)}
              className={`
                px-3 py-1 text-sm rounded-md transition-colors
                ${
                  selectedVariant === index
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-200 text-secondary-700 hover:bg-secondary-300'
                }
              `}
            >
              Variant {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* Content Display */}
      <div className="bg-secondary-50 rounded-lg p-4 mb-3">
        <pre className="whitespace-pre-wrap text-sm text-secondary-900 font-sans">
          {content}
        </pre>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
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
