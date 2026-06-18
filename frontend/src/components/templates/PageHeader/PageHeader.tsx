import { Text } from '@/components/atoms/Text';
import { cn } from '@/utils';
interface PageHeaderProps {
    title: string;
    description?: string;
    className?: string;
    badge?: string;
}
export function PageHeader({ title, description, className, badge }: PageHeaderProps) {
    return (<header className={cn('mb-8 sm:mb-10', className)}>
      <div className="accent-line mb-4"/>
      {badge && (<span className="mb-3 inline-flex rounded-full border border-accent/20 bg-accent-muted px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-light">
          {badge}
        </span>)}
      <Text as="h1" variant="h1" className="gradient-text max-w-3xl">
        {title}
      </Text>
      {description && (<Text variant="body" className="mt-3 max-w-2xl text-foreground-soft">
          {description}
        </Text>)}
    </header>);
}
