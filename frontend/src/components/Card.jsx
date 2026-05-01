import React from 'react';

const Card = ({ children, className = '', hover = true, gradient = false, ...props }) => {
  const baseStyles = `
    rounded-2xl p-6 backdrop-blur-sm
    ${gradient ? 'bg-gradient-to-br from-white/80 to-blue-50/80 dark:from-slate-800/80 dark:to-slate-900/80' : 'bg-white/80 dark:bg-slate-800/80'}
    border border-slate-200/50 dark:border-slate-700/30 shadow-sm
    ${hover ? 'hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300' : ''}
  `;

  return (
    <div className={`${baseStyles} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
