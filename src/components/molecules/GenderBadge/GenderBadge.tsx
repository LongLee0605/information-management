import { cn, formatGender } from '@/utils';
import type { Gender } from '@/types';

interface GenderBadgeProps {
  gender: Gender;
  className?: string;
}

export function GenderBadge({ gender, className }: GenderBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
        gender === 'male'
          ? 'bg-blue-100 text-blue-700'
          : 'bg-pink-100 text-rose-700',
        className,
      )}
    >
      {formatGender(gender)}
    </span>
  );
}
