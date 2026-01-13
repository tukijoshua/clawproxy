import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-brand-white font-semibold mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full bg-brand-gray-800 text-brand-white rounded-lg p-4 border-2
            ${error ? 'border-red-500' : 'border-brand-gray-700'}
            focus:border-brand-blue outline-none transition-colors
            placeholder:text-brand-gray-500
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-sm text-brand-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
