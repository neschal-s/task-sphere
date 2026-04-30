import React from 'react';

const Skeleton = ({ width = 'w-full', height = 'h-4', className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`
            ${width} ${height} ${className}
            bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200
            rounded-lg animate-pulse
            dark:from-slate-700 dark:via-slate-600 dark:to-slate-700
          `}
        />
      ))}
    </>
  );
};

const SkeletonCard = ({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="p-6 bg-white/80 rounded-2xl border border-white/20">
        <Skeleton height="h-6" className="mb-4" />
        <Skeleton height="h-4" className="mb-3" width="w-3/4" />
        <Skeleton height="h-4" className="mb-3" width="w-1/2" />
        <Skeleton height="h-8" className="mt-6" />
      </div>
    ))}
  </div>
);

export { SkeletonCard };
export default Skeleton;
