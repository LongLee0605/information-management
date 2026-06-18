import { cn } from '@/utils';
export interface SelectOption {
    value: string;
    label: string;
    description?: string;
}
interface SelectProps {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    'aria-label'?: string;
}
function ChevronDownIcon({ className }: {
    className?: string;
}) {
    return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9l6 6 6-6"/>
    </svg>);
}
export function Select({ id, value, onChange, options, placeholder = 'Chọn...', className, disabled, 'aria-label': ariaLabel, }: SelectProps) {
    const selected = options.find((option) => option.value === value);
    return (<div className={cn('relative', className)}>
      <select id={id} value={value} disabled={disabled} aria-label={ariaLabel} onChange={(event) => onChange(event.target.value)} className={cn('form-select w-full appearance-none pr-10', !value && 'text-muted')}>
        {placeholder && !options.some((option) => option.value === '') && (<option value="" disabled hidden>
            {placeholder}
          </option>)}
        {options.map((option) => (<option key={option.value} value={option.value}>
            {option.description ? `${option.label} — ${option.description}` : option.label}
          </option>))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"/>

      {selected?.description && (<p className="mt-1.5 text-xs text-muted">{selected.description}</p>)}
    </div>);
}
