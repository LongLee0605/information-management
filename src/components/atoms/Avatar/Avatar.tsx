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
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-20 w-20',
};

export function Avatar({ src, alt, size = 'md', className, ring = false }: AvatarProps) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn(
        'rounded-full bg-table-stripe object-cover',
        ring ? 'ring-2 ring-primary-500 ring-offset-2' : 'border border-border',
        sizeClasses[size],
        className,
      )}
    />
  );
}
