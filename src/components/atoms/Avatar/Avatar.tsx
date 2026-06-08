import { useMemo, useState } from 'react';
import type { Gender } from '@/types';
import { cn, getAvatarUrl } from '@/utils';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: AvatarSize;
  className?: string;
  ring?: boolean;
  gender?: Gender;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-20 w-20',
};

export function Avatar({
  src,
  alt,
  size = 'md',
  className,
  ring = false,
  gender = 'male',
}: AvatarProps) {
  const fallbackSrc = useMemo(() => getAvatarUrl(alt, gender), [alt, gender]);
  const preferredSrc = src?.trim() ? src : fallbackSrc;
  const [brokenSrc, setBrokenSrc] = useState<string | null>(null);
  const resolvedSrc = brokenSrc === preferredSrc ? fallbackSrc : preferredSrc;

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setBrokenSrc(preferredSrc)}
      className={cn(
        'avatar-image rounded-full bg-table-stripe object-cover',
        ring && (gender === 'female' ? 'avatar-ring--female' : 'avatar-ring--male'),
        !ring && 'border border-border',
        sizeClasses[size],
        className,
      )}
    />
  );
}
