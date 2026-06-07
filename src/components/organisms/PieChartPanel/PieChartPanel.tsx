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
    <div className="rounded-lg border border-border bg-white px-3 py-2 shadow-lg">
      <p className="text-sm font-medium text-slate-900">{item.name}</p>
      <p className="text-sm font-semibold text-primary-700">
        {formatCurrency(value)}
      </p>
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
    <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-2">
      {data.map((item) => {
        const percent = total > 0 ? ((item.value / total) * 100).toFixed(0) : '0';

        return (
          <li
            key={item.name}
            className="flex min-w-0 items-start gap-2 text-sm text-slate-700"
          >
            <span
              className="mt-1 h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: item.fill }}
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1 leading-snug">{item.name}</span>
            <span className="shrink-0 font-semibold tabular-nums text-slate-900">
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
      <div className="rounded-2xl border border-border bg-white p-4 sm:p-6">
        <Text as="h3" variant="h3" className="mb-4">
          {title}
        </Text>
        <Text variant="body">Không có dữ liệu.</Text>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-4 sm:p-6">
      <Text as="h3" variant="h3" className="mb-4">
        {title}
      </Text>

      <div className="mx-auto w-full max-w-md">
        <div className="aspect-square max-h-64 w-full sm:max-h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius="80%"
                paddingAngle={2}
                stroke="#fff"
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
        'grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6',
        className,
      )}
    >
      <SinglePie title="Thu theo nguồn" data={incomeData} />
      <SinglePie title="Chi theo hạng mục" data={expenseData} />
    </div>
  );
});
