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
  rows = 3,
  ...props 
}: TextAreaProps) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <textarea
        className={className}
        rows={rows}
        {...props}
      />
      {error && <p className="error-message">{error}</p>}
      {helperText && !error && (
        <p className="helper-text">{helperText}</p>
      )}
    </div>
  );
}
