export function UserGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="glass-card flex flex-col items-center rounded-2xl p-6"
        >
          <div className="h-20 w-20 shimmer rounded-full bg-surface-elevated" />
          <div className="mt-5 h-5 w-32 shimmer rounded-lg bg-surface-elevated" />
          <div className="mt-2 h-4 w-40 shimmer rounded-lg bg-surface-elevated" />
          <div className="mt-4 h-6 w-24 shimmer rounded-full bg-surface-elevated" />
          <div className="mt-4 h-4 w-28 shimmer rounded-lg bg-surface-elevated" />
        </div>
      ))}
    </div>
  );
}
