import { Skeleton } from '@/components/atoms/Skeleton';

export function PageLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-20" role="status" aria-live="polite">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      <Skeleton className="mt-4 h-4 w-32" />
      <span className="sr-only">Đang tải...</span>
    </div>
  );
}
