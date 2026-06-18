import { cn } from '@/utils';

type TextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';

interface TextProps {
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'dt' | 'dd';
  variant?: TextVariant;
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<TextVariant, string> = {
  h1: 'text-2xl font-bold text-foreground sm:text-3xl',
  h2: 'text-xl font-bold text-foreground',
  h3: 'text-lg font-semibold text-foreground',
  body: 'text-sm text-foreground-soft leading-relaxed',
  caption: 'text-xs text-muted',
  label: 'text-xs font-semibold uppercase tracking-wide text-muted',
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
