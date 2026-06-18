import { useApiStatus } from '@/context/apiStatusContext';
import { cn } from '@/utils';
export function ApiStatusBanner() {
    const { status, message, checking, recheck } = useApiStatus();
    if (checking && status === 'checking') {
        return null;
    }
    if (status === 'online') {
        return null;
    }
    const isDegraded = status === 'degraded';
    return (<div className={cn('flex flex-wrap items-center justify-between gap-3 border-b px-4 py-2.5 text-sm', isDegraded
            ? 'border-amber-200 bg-amber-50 text-amber-900'
            : 'border-red-200 bg-red-50 text-red-800')} role="status">
      <p>
        {isDegraded ? (<>
            <span className="font-semibold">API hoạt động nhưng database lỗi.</span>
            {message ? ` ${message}` : null}
          </>) : (<>
            <span className="font-semibold">Không kết nối được API.</span>
            {message ? ` ${message}` : null}
            {' '}
            Chạy{' '}
            <code className="rounded bg-black/5 px-1.5 py-0.5 text-xs">cd backend && npm run be</code>
          </>)}
      </p>

      <button type="button" onClick={() => void recheck()} className={cn('shrink-0 rounded-md border px-3 py-1 text-xs font-medium transition-colors', isDegraded
            ? 'border-amber-300 bg-white hover:bg-amber-100'
            : 'border-red-300 bg-white hover:bg-red-100')}>
        Thử lại
      </button>
    </div>);
}
