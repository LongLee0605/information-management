export function PageLoading() {
    return (<div className="flex flex-col items-center justify-center py-24" role="status" aria-live="polite">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary-600"/>
      <p className="mt-4 text-sm text-muted">Đang tải...</p>
      <span className="sr-only">Đang tải nội dung</span>
    </div>);
}
