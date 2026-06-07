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
        'dashboard-card flex flex-col items-center justify-center px-6 py-12 text-center',
        className,
      )}
      role="alert"
    >
      <Text as="h2" variant="h3" className="text-expense">
        {title}
      </Text>
      <Text variant="body" className="mt-2 max-w-md">
        {message}
      </Text>
      {onRetry && (
        <Button variant="primary" className="mt-6" onClick={onRetry}>
          Thử lại
        </Button>
      )}
    </div>
  );
}
