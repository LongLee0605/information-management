import { cn } from '@/utils';

type TextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';

interface TextProps {
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'dt' | 'dd';
  variant?: TextVariant;
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<TextVariant, string> = {
  h1: 'text-2xl sm:text-3xl font-bold text-slate-900',
  h2: 'text-xl sm:text-2xl font-semibold text-slate-900',
  h3: 'text-lg font-semibold text-slate-900',
  body: 'text-sm sm:text-base text-slate-700',
  caption: 'text-xs sm:text-sm text-muted',
  label: 'text-xs font-medium uppercase tracking-wide text-muted',
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
