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

const CHART_THEME = {
  grid: 'rgba(255, 255, 255, 0.06)',
  axis: '#64748b',
  legend: '#94a3b8',
};

export const LineChartPanel = memo(function LineChartPanel({
  data,
  className,
}: LineChartPanelProps) {
  const isMobile = useIsMobile();

  if (!data.length) {
    return (
      <div className={cn('glass-card rounded-2xl p-6', className)}>
        <Text variant="body">Không có dữ liệu thu chi.</Text>
      </div>
    );
  }

  return (
    <div className={cn('glass-card rounded-2xl p-5 sm:p-7', className)}>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <Text as="h3" variant="h3">
            Biểu đồ thu chi theo tháng
          </Text>
          <Text variant="caption" className="mt-1">
            Dữ liệu năm 2025
          </Text>
        </div>
        <div className="hidden items-center gap-4 sm:flex">
          <span className="flex items-center gap-2 text-xs text-muted">
            <span className="h-2 w-6 rounded-full bg-income" />
            Thu
          </span>
          <span className="flex items-center gap-2 text-xs text-muted">
            <span className="h-2 w-6 rounded-full bg-expense" />
            Chi
          </span>
        </div>
      </div>

      <div className="h-72 sm:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: isMobile ? 11 : 12, fill: CHART_THEME.axis }}
              axisLine={{ stroke: CHART_THEME.grid }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatCompactCurrency}
              tick={{ fontSize: isMobile ? 11 : 12, fill: CHART_THEME.axis }}
              axisLine={false}
              tickLine={false}
              width={isMobile ? 48 : 56}
            />
            <Tooltip content={<ChartTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: isMobile ? 12 : 13, color: CHART_THEME.legend }}
              formatter={(value) => (value === 'income' ? 'Thu' : 'Chi')}
            />
            <Line
              type="monotone"
              dataKey="income"
              name="income"
              stroke={CHART_COLORS.income}
              strokeWidth={2.5}
              dot={{ r: 4, strokeWidth: 2, fill: CHART_COLORS.income }}
              activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="expense"
              name="expense"
              stroke={CHART_COLORS.expense}
              strokeWidth={2.5}
              dot={{ r: 4, strokeWidth: 2, fill: CHART_COLORS.expense }}
              activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
