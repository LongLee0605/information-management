import { cn } from '@/utils';

type TextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';

interface TextProps {
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'dt' | 'dd';
  variant?: TextVariant;
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<TextVariant, string> = {
  h1: 'text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground',
  h2: 'text-xl sm:text-2xl font-bold tracking-tight text-foreground',
  h3: 'text-lg font-semibold tracking-tight text-foreground',
  body: 'text-sm sm:text-base text-foreground-soft leading-relaxed',
  caption: 'text-xs sm:text-sm text-muted',
  label: 'text-[11px] font-semibold uppercase tracking-[0.15em] text-muted',
};

export function Text({
  as: Component = 'p',
  variant = 'body',
  className,
  children,
}: TextProps) {
  return (
    <Component className={cn(variantClasses[variant], className)}>
      {children}
    </Component>
  );
}
