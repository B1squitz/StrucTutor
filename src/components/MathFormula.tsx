import React from 'react';

interface MathFractionProps {
  lhs?: string;
  num: React.ReactNode;
  den: React.ReactNode;
  rhs?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const MathFraction: React.FC<MathFractionProps> = ({
  lhs,
  num,
  den,
  rhs,
  size = 'md',
}) => {
  const sizeClasses =
    size === 'lg'
      ? 'text-lg sm:text-xl px-4 py-2.5'
      : size === 'sm'
      ? 'text-xs px-2.5 py-1'
      : 'text-sm sm:text-base px-3.5 py-2';

  return (
    <span
      className={`inline-flex items-center gap-2.5 font-mono bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg ${sizeClasses} tabular-nums shadow-2xs`}
    >
      {lhs && <span className="font-semibold italic text-blue-700 dark:text-sky-300">{lhs} =</span>}
      <span className="inline-flex flex-col items-center justify-center leading-tight">
        <span className="px-1.5 pb-0.5 font-semibold text-slate-900 dark:text-white">
          {num}
        </span>
        <span className="w-full border-t border-slate-400 dark:border-slate-400 my-0.5" />
        <span className="px-1.5 pt-0.5 font-semibold text-emerald-700 dark:text-emerald-300">
          {den}
        </span>
      </span>
      {rhs && <span className="font-semibold text-slate-800 dark:text-slate-200">= {rhs}</span>}
    </span>
  );
};

export const UnitBadge: React.FC<{ unit: string }> = ({ unit }) => {
  return (
    <span className="inline-flex items-center font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 tabular-nums">
      {unit}
    </span>
  );
};
