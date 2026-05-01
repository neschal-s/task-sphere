import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const EmptyState = ({
  title = 'No items found',
  description = 'Get started by creating your first item',
  action,
  actionLabel = 'Create Now'
}) => {
  const { isDark } = useContext(ThemeContext);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
        isDark
          ? 'bg-slate-800/50'
          : 'bg-blue-100/50'
      }`}>
        <svg className={`w-8 h-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
        {title}
      </h3>
      <p className={`mb-6 text-center max-w-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
        {description}
      </p>
      {action && (
        <button
          onClick={action}
          className={`px-6 py-3 rounded-lg font-semibold transition-all active:scale-95 ${
            isDark
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/50'
              : 'bg-gradient-to-r from-blue-400 to-blue-500 text-white hover:shadow-lg hover:shadow-blue-400/50'
          }`}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
