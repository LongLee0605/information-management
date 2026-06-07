import { Text } from '@/components/atoms/Text';
import { cn } from '@/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <header className={cn('mb-6 sm:mb-8', className)}>
      <Text as="h1" variant="h1">
        {title}
      </Text>
      {description && (
        <Text variant="body" className="mt-2 max-w-2xl">
          {description}
        </Text>
      )}
    </header>
  );
}
