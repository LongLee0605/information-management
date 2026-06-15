import { getLevelLabel } from '@/utils/moneyFlowTree';
import { cn } from '@/utils';

const LEVEL_BADGE_CLASS: Record<number, string> = {
  0: 'bg-primary-600 text-white ring-1 ring-primary-400/60',
  1: 'bg-emerald-600 text-white ring-1 ring-emerald-400/60',
  2: 'bg-violet-600 text-white ring-1 ring-violet-400/60',
  3: 'bg-amber-500 text-white ring-1 ring-amber-300/70',
};

const LEVEL_BADGE_ON_DARK_CLASS: Record<number, string> = {
  0: 'bg-white text-primary-700 ring-1 ring-white/80',
  1: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
  2: 'bg-violet-100 text-violet-800 ring-1 ring-violet-200',
  3: 'bg-amber-100 text-amber-900 ring-1 ring-amber-200',
};

const LEVEL_ROW_ACCENT_CLASS: Record<number, string> = {
  0: 'border-l-primary-600',
  1: 'border-l-emerald-500',
  2: 'border-l-violet-500',
  3: 'border-l-amber-500',
};

const LEVEL_FILTER_CLASS: Record<number, string> = {
  0: 'border-primary-300 bg-primary-50 text-primary-800',
  1: 'border-emerald-300 bg-emerald-50 text-emerald-800',
  2: 'border-violet-300 bg-violet-50 text-violet-800',
  3: 'border-amber-300 bg-amber-50 text-amber-900',
};

const LEVEL_FILTER_ACTIVE_CLASS: Record<number, string> = {
  0: 'border-primary-600 bg-primary-600 text-white',
  1: 'border-emerald-600 bg-emerald-600 text-white',
  2: 'border-violet-600 bg-violet-600 text-white',
  3: 'border-amber-500 bg-amber-500 text-white',
};

export function getLevelBadgeClass(level: number, onDark = false): string {
  const palette = onDark ? LEVEL_BADGE_ON_DARK_CLASS : LEVEL_BADGE_CLASS;
  return palette[level] ?? 'bg-slate-600 text-white';
}

export function getLevelRowAccentClass(level: number): string {
  return LEVEL_ROW_ACCENT_CLASS[level] ?? 'border-l-slate-400';
}

export function getLevelFilterClass(level: number, active: boolean): string {
  if (active) {
    return LEVEL_FILTER_ACTIVE_CLASS[level] ?? 'border-primary-600 bg-primary-600 text-white';
  }

  return LEVEL_FILTER_CLASS[level] ?? 'border-border bg-white text-muted';
}

interface MoneyFlowLevelBadgeProps {
  level: number;
  size?: 'xs' | 'sm';
  onDark?: boolean;
  className?: string;
}

export function MoneyFlowLevelBadge({
  level,
  size = 'xs',
  onDark = false,
  className,
}: MoneyFlowLevelBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-md font-extrabold uppercase leading-none tracking-wider',
        size === 'xs' ? 'min-w-[28px] px-1.5 py-0.5 text-[9px]' : 'min-w-[34px] px-2 py-1 text-[10px]',
        getLevelBadgeClass(level, onDark),
        className,
      )}
    >
      {getLevelLabel(level)}
    </span>
  );
}
