import { useState } from 'react';
import { DEMO_DATE_RANGE, getEffectiveAppDateRange } from '@/constants';
import { Button } from '@/components/atoms/Button';
import { formatDateRangeLabel } from '@/utils/chartTransformers';
import { cn } from '@/utils';

interface ReportDateFilterProps {
  citizenId: string;
  fromDate: string;
  toDate: string;
  onApply: (fromDate: string, toDate: string) => void;
  className?: string;
}

export function ReportDateFilter({
  citizenId,
  fromDate,
  toDate,
  onApply,
  className,
}: ReportDateFilterProps) {
  const [draftFrom, setDraftFrom] = useState(fromDate);
  const [draftTo, setDraftTo] = useState(toDate);
  const [error, setError] = useState<string | null>(null);

  function handleSearch() {
    if (draftFrom > draftTo) {
      setError('Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.');
      return;
    }

    setError(null);
    onApply(draftFrom, draftTo);
  }

  function handleReset() {
    const range = getEffectiveAppDateRange();
    setDraftFrom(range.fromDate);
    setDraftTo(range.toDate);
    setError(null);
    onApply(range.fromDate, range.toDate);
  }

  const effectiveRange = getEffectiveAppDateRange();

  return (
    <div className={cn('dashboard-card space-y-3 p-4', className)}>
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-[140px] flex-1">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
            Số CCCD
          </span>
          <input
            readOnly
            value={citizenId}
            className="form-input bg-table-stripe"
          />
        </label>

        <label className="w-full sm:w-40">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
            Từ ngày
          </span>
          <input
            type="date"
            value={draftFrom}
            min={DEMO_DATE_RANGE.fromDate}
            max={effectiveRange.toDate}
            onChange={(event) => setDraftFrom(event.target.value)}
            className="form-input"
          />
        </label>

        <label className="w-full sm:w-40">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
            Đến ngày
          </span>
          <input
            type="date"
            value={draftTo}
            min={DEMO_DATE_RANGE.fromDate}
            max={effectiveRange.toDate}
            onChange={(event) => setDraftTo(event.target.value)}
            className="form-input"
          />
        </label>

        <Button variant="primary" type="button" className="shrink-0" onClick={handleSearch}>
          Tìm kiếm
        </Button>

        <Button variant="secondary" type="button" className="shrink-0" onClick={handleReset}>
          Đặt lại
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <p className="text-xs text-muted">
        Đang xem dữ liệu: <span className="font-medium text-foreground-soft">{formatDateRangeLabel(fromDate, toDate)}</span>
      </p>
    </div>
  );
}
