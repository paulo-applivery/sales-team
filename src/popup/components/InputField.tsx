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
    <div className="form-group">
      <label>{label}</label>
      <input
        className={className}
        {...props}
      />
      {error && <p className="error-message">{error}</p>}
      {helperText && !error && (
        <p className="helper-text">{helperText}</p>
      )}
    </div>
  );
}
