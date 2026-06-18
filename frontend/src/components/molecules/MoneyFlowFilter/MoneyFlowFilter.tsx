import { Button } from '@/components/atoms/Button';
import { DEMO_DATE_RANGE, getEffectiveAppDateRange } from '@/constants';
import { cn } from '@/utils';

export interface MoneyFlowFilterValues {
  cif: string;
  accountNumber: string;
  fromDate: string;
  toDate: string;
}

interface MoneyFlowFilterProps {
  defaultValues: MoneyFlowFilterValues;
  accountPlaceholder?: string;
  values: MoneyFlowFilterValues;
  onChange: (values: MoneyFlowFilterValues) => void;
  onSearch: () => void;
  onReset: () => void;
  error?: string | null;
  dirty?: boolean;
  className?: string;
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function getDatePresets(toDate: string) {
  const end = new Date(`${toDate}T00:00:00`);
  const shiftDays = (days: number) => {
    const next = new Date(end);
    next.setDate(next.getDate() - days + 1);
    return next.toISOString().slice(0, 10);
  };

  return [
    { label: '30 ngày', fromDate: shiftDays(30) },
    { label: '90 ngày', fromDate: shiftDays(90) },
    { label: '6 tháng', fromDate: shiftDays(180) },
    { label: 'Cả năm', fromDate: DEMO_DATE_RANGE.fromDate },
  ] as const;
}

export function MoneyFlowFilter({
  defaultValues,
  accountPlaceholder = 'Nhập số tài khoản F0',
  values,
  onChange,
  onSearch,
  onReset,
  error,
  dirty = false,
  className,
}: MoneyFlowFilterProps) {
  const effectiveRange = getEffectiveAppDateRange();
  const presets = getDatePresets(values.toDate);

  function updateField<K extends keyof MoneyFlowFilterValues>(
    key: K,
    value: MoneyFlowFilterValues[K],
  ) {
    onChange({ ...values, [key]: value });
  }

  function handleReset() {
    onChange({ ...defaultValues });
    onReset();
  }

  function applyPreset(fromDate: string) {
    onChange({
      ...values,
      fromDate: fromDate < DEMO_DATE_RANGE.fromDate ? DEMO_DATE_RANGE.fromDate : fromDate,
      toDate: values.toDate,
    });
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      onSearch();
    }
  }

  return (
    <div className={cn('dashboard-card space-y-3 p-4', className)} onKeyDown={handleKeyDown}>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-[120px] flex-1 flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Số CIF</span>
          <input
            type="text"
            value={values.cif}
            onChange={(event) => updateField('cif', event.target.value.toUpperCase())}
            placeholder="26410060"
            className="form-input uppercase"
          />
        </label>

        <label className="flex min-w-[160px] flex-1 flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Số tài khoản</span>
          <input
            type="text"
            inputMode="numeric"
            value={values.accountNumber}
            onChange={(event) => updateField('accountNumber', event.target.value.replace(/\D/g, ''))}
            placeholder={accountPlaceholder}
            className="form-input"
          />
        </label>

        <label className="flex w-full flex-col gap-1.5 sm:w-40">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Từ ngày</span>
          <input
            type="date"
            value={values.fromDate}
            min={DEMO_DATE_RANGE.fromDate}
            max={effectiveRange.toDate}
            onChange={(event) => updateField('fromDate', event.target.value)}
            className="form-input"
          />
        </label>

        <label className="flex w-full flex-col gap-1.5 sm:w-40">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Đến ngày</span>
          <input
            type="date"
            value={values.toDate}
            min={DEMO_DATE_RANGE.fromDate}
            max={effectiveRange.toDate}
            onChange={(event) => updateField('toDate', event.target.value)}
            className="form-input"
          />
        </label>

        <Button variant="primary" type="button" className="shrink-0" onClick={onSearch}>
          <SearchIcon className="h-4 w-4" />
          Tìm Kiếm
        </Button>

        <Button variant="secondary" type="button" className="shrink-0" onClick={handleReset}>
          Đặt lại
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted">Nhanh:</span>
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => applyPreset(preset.fromDate)}
            className={cn(
              'filter-chip font-medium',
              values.fromDate === preset.fromDate
                ? 'border-primary-300 bg-primary-50 text-primary-700'
                : 'border-border bg-white text-muted hover:border-primary-200 hover:text-foreground',
            )}
          >
            {preset.label}
          </button>
        ))}
        {dirty && (
          <span className="ml-auto text-xs font-medium text-amber-700">
            Bộ lọc đã thay đổi — bấm Tìm Kiếm để cập nhật
          </span>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
