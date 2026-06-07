import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/atoms/Text';
import { cn } from '@/utils';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Đã xảy ra lỗi',
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'glass-card flex flex-col items-center justify-center rounded-2xl border-expense/20 bg-expense-muted px-6 py-14 text-center',
        className,
      )}
      role="alert"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-expense/20 text-expense">
        !
      </div>
      <Text as="h2" variant="h3" className="text-expense">
        {title}
      </Text>
      <Text variant="body" className="mt-2 max-w-md text-foreground-soft">
        {message}
      </Text>
      {onRetry && (
        <Button variant="secondary" className="mt-6" onClick={onRetry}>
          Thử lại
        </Button>
      )}
    </div>
  );
}
