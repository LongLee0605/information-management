import { Select, type SelectOption } from '@/components/atoms/Select';
import type { SourceAccount } from '@/utils/transferAccounts';
import { formatCurrency } from '@/utils';

interface SourceAccountSelectProps {
  accounts: SourceAccount[];
  value: string;
  onChange: (userId: string) => void;
}

export function SourceAccountSelect({
  accounts,
  value,
  onChange,
}: SourceAccountSelectProps) {
  const selected = accounts.find((account) => account.userId === value);

  const options: SelectOption[] = accounts.map((account) => ({
    value: account.userId,
    label: `${account.accountNumber} — ${account.fullName}`,
  }));

  return (
    <div>
      <label htmlFor="source-account" className="mb-2 block text-sm font-semibold text-foreground">
        Tài khoản chuyển
      </label>

      <Select
        id="source-account"
        value={value}
        onChange={onChange}
        options={options}
        aria-label="Tài khoản chuyển"
      />

      {selected && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-primary-600">
            {selected.accountNumber}
          </span>
          <span className="rounded-md bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
            Số dư khả dụng: {formatCurrency(selected.balance)}
          </span>
        </div>
      )}
    </div>
  );
}
