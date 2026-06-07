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
    <div className="rounded-lg border border-border bg-white px-3 py-2 shadow-lg">
      {label && (
        <p className="mb-1 text-xs font-medium text-muted">Tháng {label}</p>
      )}
      <ul className="space-y-1">
        {payload.map((entry) => (
          <li
            key={String(entry.dataKey ?? entry.name)}
            className="flex items-center gap-2 text-sm text-slate-800"
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span>{getDisplayName(entry)}:</span>
            <span className="font-semibold">
              {formatCurrency(entry.value ?? 0)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
