import type { Gender } from '@/types';
import { cn, formatGender } from '@/utils';

interface GenderBadgeProps {
  gender: Gender;
  className?: string;
}

export function GenderBadge({ gender, className }: GenderBadgeProps) {
  return (
    <span
      className={cn(
        'gender-badge',
        gender === 'male' ? 'gender-badge--male' : 'gender-badge--female',
        className,
      )}
    >
      {formatGender(gender)}
    </span>
  );
}
