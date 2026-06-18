import { useApiStatus } from '@/context/apiStatusContext';
import { cn } from '@/utils';

export function ApiStatusIndicator() {
  const { status, dbHost, latencyMs, checking, recheck } = useApiStatus();

  const label =
    checking && status === 'checking'
      ? 'Đang kiểm tra API…'
      : status === 'offline'
        ? 'API offline'
        : status === 'degraded'
          ? 'API · DB lỗi'
          : 'API · SQL Server';

  const dotClass =
    checking && status === 'checking'
      ? 'bg-slate-400 animate-pulse'
      : status === 'offline'
        ? 'bg-red-400'
        : status === 'degraded'
          ? 'bg-amber-400'
          : 'bg-emerald-400';

  return (
    <button
      type="button"
      onClick={() => void recheck()}
      title={
        status === 'online'
          ? `Kết nối API OK${dbHost ? ` · ${dbHost}` : ''}${latencyMs ? ` · ${latencyMs}ms` : ''}`
          : 'Bấm để kiểm tra lại kết nối API'
      }
      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[11px] text-sidebar-muted transition-colors hover:bg-sidebar-hover hover:text-sidebar-text"
    >
      <span className={cn('h-2 w-2 shrink-0 rounded-full', dotClass)} />
      <span className="truncate">{label}</span>
    </button>
  );
}
