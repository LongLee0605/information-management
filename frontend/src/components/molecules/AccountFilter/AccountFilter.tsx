import { Button } from '@/components/atoms/Button';
import { Select } from '@/components/atoms/Select';
import { ACCOUNT_STATUS_FILTER_OPTIONS, ACCOUNT_TYPE_FILTER_OPTIONS, type AccountFilterValues, } from '@/utils/accountFilter';
import { cn } from '@/utils';
interface AccountFilterProps {
    values: AccountFilterValues;
    onChange: (values: AccountFilterValues) => void;
    onSearch: () => void;
    onClear?: () => void;
    className?: string;
}
function SearchIcon({ className }: {
    className?: string;
}) {
    return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/>
      <path d="M21 21l-4.35-4.35"/>
    </svg>);
}
export function AccountFilter({ values, onChange, onSearch, onClear, className, }: AccountFilterProps) {
    function updateField<K extends keyof AccountFilterValues>(key: K, value: AccountFilterValues[K]) {
        onChange({ ...values, [key]: value });
    }
    function handleKeyDown(event: React.KeyboardEvent) {
        if (event.key === 'Enter') {
            onSearch();
        }
    }
    return (<div className={cn('border-b border-border px-6 py-4', className)}>
      <div className="flex flex-wrap items-center gap-3">
        <input type="text" value={values.cif} onChange={(event) => updateField('cif', event.target.value.toUpperCase())} onKeyDown={handleKeyDown} placeholder="Số CIF" className="form-input min-w-[120px] flex-1 uppercase"/>

        <input type="text" inputMode="numeric" value={values.accountNumber} onChange={(event) => updateField('accountNumber', event.target.value.replace(/\D/g, ''))} onKeyDown={handleKeyDown} placeholder="Số tài khoản" className="form-input min-w-[160px] flex-1"/>

        <Select value={values.accountType} onChange={(value) => updateField('accountType', value as AccountFilterValues['accountType'])} options={[
            { value: '', label: 'Tất cả loại TK' },
            ...ACCOUNT_TYPE_FILTER_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
            })),
        ]} aria-label="Loại tài khoản" className="min-w-[180px] flex-1"/>

        <Select value={values.status} onChange={(value) => updateField('status', value as AccountFilterValues['status'])} options={[
            { value: '', label: 'Tất cả trạng thái' },
            ...ACCOUNT_STATUS_FILTER_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
            })),
        ]} aria-label="Tình trạng tài khoản" className="min-w-[160px] flex-1 sm:max-w-[200px]"/>

        <Button variant="primary" type="button" className="shrink-0 px-4" aria-label="Tìm kiếm" onClick={onSearch}>
          <SearchIcon className="h-4 w-4"/>
        </Button>

        {onClear && (<Button variant="secondary" type="button" className="shrink-0" onClick={onClear}>
            Xóa bộ lọc
          </Button>)}
      </div>
    </div>);
}
