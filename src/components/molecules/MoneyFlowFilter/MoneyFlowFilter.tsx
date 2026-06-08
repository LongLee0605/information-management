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

export function MoneyFlowFilter({
  defaultValues,
  accountPlaceholder = 'Nhập số tài khoản F0',
  values,
  onChange,
  onSearch,
  onReset,
  error,
  className,
}: MoneyFlowFilterProps) {
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

  const effectiveRange = getEffectiveAppDateRange();

  return (
    <div className={cn('dashboard-card space-y-3 p-4', className)}>
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-[120px] flex-1">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Số CIF</span>
          <input
            type="text"
            value={values.cif}
            onChange={(event) => updateField('cif', event.target.value.toUpperCase())}
            placeholder="26410060"
            className="form-input uppercase"
          />
        </label>

        <label className="min-w-[160px] flex-1">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Số tài khoản</span>
          <input
            type="text"
            inputMode="numeric"
            value={values.accountNumber}
            onChange={(event) => updateField('accountNumber', event.target.value.replace(/\D/g, ''))}
            placeholder={accountPlaceholder}
            className="form-input"
          />
        </label>

        <label className="w-full sm:w-40">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Từ ngày</span>
          <input
            type="date"
            value={values.fromDate}
            min={DEMO_DATE_RANGE.fromDate}
            max={effectiveRange.toDate}
            onChange={(event) => updateField('fromDate', event.target.value)}
            className="form-input"
          />
        </label>

        <label className="w-full sm:w-40">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Đến ngày</span>
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

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
