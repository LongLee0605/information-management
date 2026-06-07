import { memo, useMemo } from 'react';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Text } from '@/components/atoms/Text';
import { formatCurrency } from '@/utils';
import type { PieChartPoint } from '@/utils/chartTransformers';
import { cn } from '@/utils';

interface PieChartTooltipProps {
  active?: boolean;
  payload?: { name?: string; value?: number }[];
  total: number;
}

function PieChartTooltip({ active, payload, total }: PieChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const item = payload[0];
  const value = item.value ?? 0;
  const percent = total > 0 ? ((value / total) * 100).toFixed(1) : '0';

  return (
    <div className="rounded-xl border border-border-strong bg-surface-elevated px-4 py-3 shadow-xl backdrop-blur-xl">
      <p className="text-sm font-medium text-foreground">{item.name}</p>
      <p className="text-sm font-bold text-accent-light">{formatCurrency(value)}</p>
      <p className="text-xs text-muted">{percent}% tổng</p>
    </div>
  );
}

interface PieLegendProps {
  data: PieChartPoint[];
}

function PieLegend({ data }: PieLegendProps) {
  const total = useMemo(
    () => data.reduce((sum, item) => sum + item.value, 0),
    [data],
  );

  return (
    <ul className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-x-4">
      {data.map((item) => {
        const percent = total > 0 ? ((item.value / total) * 100).toFixed(0) : '0';

        return (
          <li
            key={item.name}
            className="flex min-w-0 items-center gap-2.5 rounded-xl border border-border bg-surface/50 px-3 py-2 text-sm"
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white/10"
              style={{ backgroundColor: item.fill }}
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1 truncate text-foreground-soft">{item.name}</span>
            <span className="shrink-0 font-bold tabular-nums text-accent-light">
              {percent}%
            </span>
          </li>
        );
      })}
    </ul>
  );
}

interface SinglePieProps {
  title: string;
  data: PieChartPoint[];
}

function SinglePie({ title, data }: SinglePieProps) {
  const total = useMemo(
    () => data.reduce((sum, item) => sum + item.value, 0),
    [data],
  );

  if (!data.length) {
    return (
      <div className="glass-card rounded-2xl p-5 sm:p-7">
        <Text as="h3" variant="h3" className="mb-4">
          {title}
        </Text>
        <Text variant="body">Không có dữ liệu.</Text>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-7">
      <Text as="h3" variant="h3" className="mb-1">
        {title}
      </Text>
      <Text variant="caption" className="mb-5">
        Phân bổ theo tỷ lệ phần trăm
      </Text>

      <div className="mx-auto w-full max-w-md">
        <div className="aspect-square max-h-60 w-full sm:max-h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="45%"
                outerRadius="80%"
                paddingAngle={3}
                stroke="#111827"
                strokeWidth={2}
                label={false}
                labelLine={false}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<PieChartTooltip total={total} />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <PieLegend data={data} />
      </div>
    </div>
  );
}

interface PieChartPanelProps {
  incomeData: PieChartPoint[];
  expenseData: PieChartPoint[];
  className?: string;
}

export const PieChartPanel = memo(function PieChartPanel({
  incomeData,
  expenseData,
  className,
}: PieChartPanelProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6',
        className,
      )}
    >
      <SinglePie title="Thu theo nguồn" data={incomeData} />
      <SinglePie title="Chi theo hạng mục" data={expenseData} />
    </div>
  );
});
