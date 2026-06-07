import { memo } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Text } from '@/components/atoms/Text';
import { ChartTooltip } from '@/components/molecules/ChartTooltip';
import { CHART_COLORS } from '@/constants';
import { useIsMobile } from '@/hooks';
import { formatCompactCurrency } from '@/utils';
import type { LineChartPoint } from '@/utils/chartTransformers';
import { cn } from '@/utils';

interface LineChartPanelProps {
  data: LineChartPoint[];
  className?: string;
}

export const LineChartPanel = memo(function LineChartPanel({
  data,
  className,
}: LineChartPanelProps) {
  const isMobile = useIsMobile();

  if (!data.length) {
    return (
      <div className={cn('rounded-2xl border border-border bg-white p-6', className)}>
        <Text variant="body">Không có dữ liệu thu chi.</Text>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-white p-4 sm:p-6',
        className,
      )}
    >
      <Text as="h3" variant="h3" className="mb-4">
        Biểu đồ thu chi theo tháng (2025)
      </Text>
      <div className="h-72 sm:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: isMobile ? 11 : 12 }}
              stroke="#64748b"
            />
            <YAxis
              tickFormatter={formatCompactCurrency}
              tick={{ fontSize: isMobile ? 11 : 12 }}
              stroke="#64748b"
              width={isMobile ? 48 : 56}
            />
            <Tooltip content={<ChartTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: isMobile ? 12 : 14 }}
              formatter={(value) => (value === 'income' ? 'Thu' : 'Chi')}
            />
            <Line
              type="monotone"
              dataKey="income"
              name="income"
              stroke={CHART_COLORS.income}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="expense"
              name="expense"
              stroke={CHART_COLORS.expense}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
