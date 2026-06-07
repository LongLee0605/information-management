import { cn } from '@/utils';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src: string;
  alt: string;
  size?: AvatarSize;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'h-10 w-10',
  md: 'h-14 w-14',
  lg: 'h-20 w-20',
  xl: 'h-28 w-28',
};

export function Avatar({ src, alt, size = 'md', className }: AvatarProps) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn(
        'rounded-full border-2 border-white bg-slate-100 object-cover shadow-sm',
        sizeClasses[size],
        className,
      )}
    />
  );
}
