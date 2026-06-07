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
  compact?: boolean;
  periodLabel?: string;
}

export const LineChartPanel = memo(function LineChartPanel({
  data,
  className,
  compact = false,
  periodLabel = 'Năm 2025',
}: LineChartPanelProps) {
  const isMobile = useIsMobile();

  if (!data.length) {
    return (
      <div className={cn('dashboard-card p-6', className)}>
        <Text variant="body">Không có dữ liệu thu chi.</Text>
      </div>
    );
  }

  return (
    <div className={cn('dashboard-card p-5 sm:p-6', className)}>
      <Text as="h3" variant="h3" className="text-base">
        Biểu Đồ Thu / Chi Theo Tháng
      </Text>
      <Text variant="caption" className="mt-1">
        Khoảng thời gian: {periodLabel}
      </Text>

      <div className={cn('mt-4', compact ? 'h-64' : 'h-72 sm:h-80')}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: isMobile ? 11 : 12, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatCompactCurrency}
              tick={{ fontSize: isMobile ? 11 : 12, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              width={isMobile ? 48 : 56}
            />
            <Tooltip content={<ChartTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: isMobile ? 12 : 13 }}
              formatter={(value) => (value === 'income' ? 'Thu' : 'Chi')}
            />
            <Line
              type="monotone"
              dataKey="income"
              name="income"
              stroke={CHART_COLORS.income}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2, fill: CHART_COLORS.income }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="expense"
              name="expense"
              stroke={CHART_COLORS.expense}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2, fill: CHART_COLORS.expense }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
