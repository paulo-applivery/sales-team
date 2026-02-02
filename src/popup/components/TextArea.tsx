interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export default function TextArea({ 
  label, 
  error, 
  helperText,
  className = '',
  ...props 
}: TextAreaProps) {
  return (
    <div className="mb-4">
      <label className="label">
        {label}
      </label>
      <textarea
        className={`input-field resize-none ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
        rows={3}
        {...props}
      />
      {error && <p className="error-text">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-secondary-500 mt-1">{helperText}</p>
      )}
    </div>
  );
}
