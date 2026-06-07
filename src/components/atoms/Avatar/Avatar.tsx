import { cn } from '@/utils';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src: string;
  alt: string;
  size?: AvatarSize;
  className?: string;
  ring?: boolean;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'h-10 w-10',
  md: 'h-14 w-14',
  lg: 'h-20 w-20',
  xl: 'h-28 w-28',
};

export function Avatar({ src, alt, size = 'md', className, ring = true }: AvatarProps) {
  const image = (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn(
        'h-full w-full rounded-full bg-surface-elevated object-cover',
        className,
      )}
    />
  );

  if (!ring) {
    return (
      <div
        className={cn(
          'shrink-0 overflow-hidden rounded-full border border-border',
          sizeClasses[size],
        )}
      >
        {image}
      </div>
    );
  }

  return (
    <div className={cn('avatar-ring shrink-0', sizeClasses[size])}>
      {image}
    </div>
  );
}
