export function PageLoading() {
  return (
    <div
      className="flex flex-col items-center justify-center py-24"
      role="status"
      aria-live="polite"
    >
      <div className="relative">
        <div className="h-14 w-14 animate-spin rounded-full border-2 border-border border-t-accent" />
        <div className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-b-primary-500 [animation-direction:reverse] [animation-duration:1.5s]" />
      </div>
      <p className="mt-6 text-sm font-medium text-muted">Đang tải...</p>
      <span className="sr-only">Đang tải nội dung</span>
    </div>
  );
}
