import { memo, useCallback, useMemo, useState } from 'react';
import { Pie, PieChart, ResponsiveContainer, Sector, Tooltip, } from 'recharts';
import type { PieSectorShapeProps } from 'recharts';
import { Text } from '@/components/atoms/Text';
import { enrichColor, formatCurrency } from '@/utils';
import type { PieChartPoint } from '@/utils/chartTransformers';
import { cn } from '@/utils';
interface PieChartTooltipProps {
    active?: boolean;
    payload?: {
        name?: string;
        value?: number;
    }[];
    total: number;
}
function PieChartTooltip({ active, payload, total }: PieChartTooltipProps) {
    if (!active || !payload?.length)
        return null;
    const item = payload[0];
    const value = item.value ?? 0;
    const percent = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
    return (<div className="rounded-md border border-border bg-white px-3 py-2 shadow-lg">
      <p className="text-sm font-medium text-foreground">{item.name}</p>
      <p className="text-sm font-bold text-primary-700">{formatCurrency(value)}</p>
      <p className="text-xs text-muted">{percent}% tổng</p>
    </div>);
}
interface PieLegendProps {
    data: PieChartPoint[];
    activeIndex: number | null;
    onItemHover: (index: number | null) => void;
    onItemClick: (index: number) => void;
}
function PieLegend({ data, activeIndex, onItemHover, onItemClick }: PieLegendProps) {
    const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);
    return (<ul className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-x-4">
      {data.map((item, index) => {
            const percent = total > 0 ? ((item.value / total) * 100).toFixed(0) : '0';
            const isActive = activeIndex === index;
            return (<li key={item.name} onMouseEnter={() => onItemHover(index)} onMouseLeave={() => onItemHover(null)} onClick={() => onItemClick(index)} className={cn('flex min-w-0 cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2 text-sm transition-all duration-200', isActive
                    ? 'scale-[1.02] border-primary-500 bg-balance-bg shadow-sm'
                    : 'border-border bg-table-stripe hover:border-border-strong hover:bg-white')}>
            <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white/10 transition-transform duration-200', isActive && 'scale-125')} style={{ backgroundColor: isActive ? enrichColor(item.fill) : item.fill }} aria-hidden="true"/>
            <span className={cn('min-w-0 flex-1 truncate transition-colors', isActive ? 'font-medium text-foreground' : 'text-foreground-soft')}>
              {item.name}
            </span>
            <span className={cn('shrink-0 font-bold tabular-nums transition-colors', isActive ? 'text-primary-700' : 'text-muted')}>
              {percent}%
            </span>
          </li>);
        })}
    </ul>);
}
function createSectorShape(data: PieChartPoint[], activeIndex: number | null) {
    return function PieSectorShape(props: PieSectorShapeProps, index: number) {
        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, isActive: isHovered, } = props;
        const isHighlighted = activeIndex === index || isHovered;
        const isDimmed = activeIndex !== null && activeIndex !== index && !isHovered;
        const baseFill = data[index]?.fill ?? fill ?? '#8884d8';
        if (isHighlighted) {
            return (<Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={Number(outerRadius) + 12} startAngle={startAngle} endAngle={endAngle} fill={enrichColor(baseFill, 1.3)} stroke="#ffffff" strokeWidth={2} style={{
                    filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.45))',
                    cursor: 'pointer',
                    outline: 'none',
                }}/>);
        }
        return (<Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} startAngle={startAngle} endAngle={endAngle} fill={baseFill} stroke="#ffffff" strokeWidth={2} opacity={isDimmed ? 0.4 : 1} style={{
                cursor: 'pointer',
                outline: 'none',
                transition: 'opacity 0.25s ease',
            }}/>);
    };
}
interface SinglePieProps {
    title: string;
    data: PieChartPoint[];
}
function SinglePie({ title, data }: SinglePieProps) {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const [pinnedIndex, setPinnedIndex] = useState<number | null>(null);
    const activeIndex = pinnedIndex ?? hoverIndex;
    const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);
    const sectorShape = useMemo(() => createSectorShape(data, activeIndex), [data, activeIndex]);
    const handleLegendClick = useCallback((index: number) => {
        setPinnedIndex((current) => (current === index ? null : index));
    }, []);
    const handlePieEnter = useCallback((_: unknown, index: number) => {
        setHoverIndex(index);
    }, []);
    const handlePieLeave = useCallback(() => {
        setHoverIndex(null);
    }, []);
    const handlePieClick = useCallback((_: unknown, index: number) => {
        setPinnedIndex((current) => (current === index ? null : index));
    }, []);
    const handleLegendHover = useCallback((index: number | null) => {
        setHoverIndex(index);
    }, []);
    if (!data.length) {
        return (<div className="dashboard-card rounded-2xl p-5 sm:p-7">
        <Text as="h3" variant="h3" className="mb-4">
          {title}
        </Text>
        <Text variant="body">Không có dữ liệu.</Text>
      </div>);
    }
    return (<div className="dashboard-card rounded-2xl p-5 sm:p-7">
      <Text as="h3" variant="h3" className="mb-1">
        {title}
      </Text>
      <Text variant="caption" className="mb-5">
        Phân bổ theo tỷ lệ phần trăm · Hover hoặc click để xem chi tiết
      </Text>

      <div className="mx-auto w-full max-w-md">
        <div className="chart-interactive aspect-square max-h-60 w-full sm:max-h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="45%" outerRadius="78%" paddingAngle={3} stroke="#ffffff" strokeWidth={2} label={false} labelLine={false} shape={sectorShape} rootTabIndex={-1} onMouseEnter={handlePieEnter} onMouseLeave={handlePieLeave} onClick={handlePieClick} isAnimationActive animationDuration={300} animationEasing="ease-out"/>
              <Tooltip content={<PieChartTooltip total={total}/>}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <PieLegend data={data} activeIndex={activeIndex} onItemHover={handleLegendHover} onItemClick={handleLegendClick}/>
      </div>
    </div>);
}
interface PieChartPanelProps {
    incomeData: PieChartPoint[];
    expenseData: PieChartPoint[];
    className?: string;
    periodLabel?: string;
}
export const PieChartPanel = memo(function PieChartPanel({ incomeData, expenseData, className, periodLabel, }: PieChartPanelProps) {
    return (<div className={className}>
      {periodLabel && (<p className="mb-4 text-xs text-muted">
          Khoảng thời gian: <span className="font-medium text-foreground-soft">{periodLabel}</span>
        </p>)}
      <div className={cn('grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6')}>
        <SinglePie title="Nguồn thu cá nhân" data={incomeData}/>
        <SinglePie title="Hạng mục chi cá nhân" data={expenseData}/>
      </div>
    </div>);
});
