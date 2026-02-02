interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export default function InputField({ 
  label, 
  error, 
  helperText,
  className = '',
  ...props 
}: InputFieldProps) {
  return (
    <div className="mb-4">
      <label className="label">
        {label}
      </label>
      <input
        className={`input-field ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="error-text">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-secondary-500 mt-1">{helperText}</p>
      )}
    </div>
  );
}
