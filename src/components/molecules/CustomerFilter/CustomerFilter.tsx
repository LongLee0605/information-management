import { Button } from '@/components/atoms/Button';
import type { CustomerFilterValues } from '@/utils/customerFilter';
import { cn } from '@/utils';

interface CustomerFilterProps {
  values: CustomerFilterValues;
  onChange: (values: CustomerFilterValues) => void;
  onSearch: () => void;
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

export function CustomerFilter({
  values,
  onChange,
  onSearch,
  className,
}: CustomerFilterProps) {
  function updateField<K extends keyof CustomerFilterValues>(
    key: K,
    value: CustomerFilterValues[K],
  ) {
    onChange({ ...values, [key]: value });
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Enter') {
      onSearch();
    }
  }

  return (
    <div className={cn('dashboard-card p-4', className)}>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={values.cif}
          onChange={(event) => updateField('cif', event.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          placeholder="Số CIF"
          className="form-input min-w-[120px] flex-1 uppercase"
        />

        <input
          type="text"
          inputMode="numeric"
          value={values.citizenId}
          onChange={(event) => updateField('citizenId', event.target.value.replace(/\D/g, ''))}
          onKeyDown={handleKeyDown}
          placeholder="Căn Cước Công Dân"
          className="form-input min-w-[160px] flex-1"
        />

        <input
          type="text"
          value={values.fullName}
          onChange={(event) => updateField('fullName', event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Họ và Tên"
          className="form-input min-w-[180px] flex-[1.5]"
        />

        <input
          type="text"
          inputMode="numeric"
          maxLength={4}
          value={values.birthYear}
          onChange={(event) => updateField('birthYear', event.target.value.replace(/\D/g, ''))}
          onKeyDown={handleKeyDown}
          placeholder="Năm Sinh"
          className="form-input w-full sm:w-32"
        />

        <Button
          variant="primary"
          type="button"
          className="shrink-0 px-4"
          aria-label="Tìm kiếm"
          onClick={onSearch}
        >
          <SearchIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
