import React from 'react';

const Card = ({ children, className = '', hover = true, gradient = false, ...props }) => {
  const baseStyles = `
    rounded-2xl p-6 backdrop-blur-sm
    ${gradient ? 'bg-gradient-to-br from-white/80 to-slate-50/80' : 'bg-white/80'}
    border border-white/20 shadow-sm
    ${hover ? 'hover:shadow-xl hover:border-cyan-200/50 transition-all duration-300' : ''}
    dark:bg-slate-800/80 dark:border-slate-700/30
  `;

  return (
    <div className={`${baseStyles} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
