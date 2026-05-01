import React, { useState } from 'react';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  className = '',
  floatingLabel = true,
  ...props
}) => {
  const [focused, setFocused] = useState(false);

  const baseStyles = `
    w-full px-4 py-3 rounded-lg
    bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-600
    transition-all duration-300
    focus:bg-white dark:focus:bg-slate-800 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-200/50 dark:focus:ring-cyan-600/30
    disabled:bg-slate-100 dark:disabled:bg-slate-700/50 disabled:cursor-not-allowed disabled:text-slate-500 dark:disabled:text-slate-400
  `;

  const errorStyles = error ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-200/50' : '';

  return (
    <div className="relative w-full">
      {label && !floatingLabel && (
        <label className="block text-sm font-semibold text-slate-700 mb-2 dark:text-slate-300">
          {label}
        </label>
      )}

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        className={`${baseStyles} ${errorStyles} ${className}`}
        {...props}
      />

      {floatingLabel && label && (
        <label
          className={`
            absolute left-4 pointer-events-none
            transition-all duration-300
            ${focused || value ? 'top-1 text-xs text-cyan-600 font-semibold' : 'top-3.5 text-slate-500'}
          `}
        >
          {label}
        </label>
      )}

      {error && (
        <p className="text-xs text-rose-500 mt-1.5 font-medium">{error}</p>
      )}
    </div>
  );
};

export default Input;
