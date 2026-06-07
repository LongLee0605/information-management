import { cn } from '@/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('shimmer rounded-xl bg-surface-elevated', className)}
      aria-hidden="true"
    />
  );
}
