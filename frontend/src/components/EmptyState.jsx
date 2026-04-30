import React from 'react';
import Button from './Button';

const EmptyState = ({
  icon = '📭',
  title = 'No items found',
  description = 'Get started by creating your first item',
  action,
  actionLabel = 'Create Now'
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-6xl mb-4 opacity-50">{icon}</div>
      <h3 className="text-2xl font-bold text-slate-900 mb-2 dark:text-white">{title}</h3>
      <p className="text-slate-600 mb-6 text-center max-w-sm dark:text-slate-400">{description}</p>
      {action && (
        <Button onClick={action} size="lg">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
