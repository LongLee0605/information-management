import { formatCurrency } from '@/utils';

interface ChartTooltipPayloadItem {
  name?: string;
  value?: number;
  color?: string;
  dataKey?: string | number;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipPayloadItem[];
  label?: string;
}

const LINE_LABELS: Record<string, string> = {
  income: 'Thu',
  expense: 'Chi',
};

function getDisplayName(entry: ChartTooltipPayloadItem): string {
  const key = String(entry.dataKey ?? entry.name ?? '');
  return LINE_LABELS[key] ?? entry.name ?? key;
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-border-strong bg-surface-elevated px-4 py-3 shadow-xl backdrop-blur-xl">
      {label && (
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
          Tháng {label}
        </p>
      )}
      <ul className="space-y-2">
        {payload.map((entry) => (
          <li
            key={String(entry.dataKey ?? entry.name)}
            className="flex items-center gap-2 text-sm text-foreground"
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-foreground-soft">{getDisplayName(entry)}:</span>
            <span className="font-bold text-accent-light">
              {formatCurrency(entry.value ?? 0)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
