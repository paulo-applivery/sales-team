interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  children: React.ReactNode;
}

export default function Button({ 
  variant = 'primary', 
  loading = false, 
  children, 
  className = '',
  disabled,
  ...props 
}: ButtonProps) {
  const variantClass = variant === 'secondary' ? 'secondary' : '';

  return (
    <button
      className={`${variantClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="loading-spinner" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}
