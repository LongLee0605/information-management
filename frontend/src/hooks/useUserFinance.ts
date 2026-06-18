import { useCallback, useEffect, useMemo, useState } from 'react';
import { getUserFinance } from '@/services';
import type { MonthlyFinance, SourceBreakdown } from '@/types';
import { calculateFinanceSummary, transformBreakdownToPieChart, transformMonthlyToLineChart, } from '@/utils/chartTransformers';
import { subscribeDataChange } from '@/utils/dataChangeBus';
import { PIE_COLORS } from '@/constants';
import { resolveUserIdFromRouteParam } from '@/utils/userRoute';
interface UseUserFinanceResult {
    monthly: MonthlyFinance[];
    breakdown: SourceBreakdown[];
    lineChartData: ReturnType<typeof transformMonthlyToLineChart>;
    incomePieData: ReturnType<typeof transformBreakdownToPieChart>;
    expensePieData: ReturnType<typeof transformBreakdownToPieChart>;
    summary: ReturnType<typeof calculateFinanceSummary>;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}
const EMPTY_SUMMARY = calculateFinanceSummary([]);
export function useUserFinance(routeParam: string | undefined): UseUserFinanceResult {
    const userId = useMemo(() => resolveUserIdFromRouteParam(routeParam), [routeParam]);
    const [monthly, setMonthly] = useState<MonthlyFinance[]>([]);
    const [breakdown, setBreakdown] = useState<SourceBreakdown[]>([]);
    const [loading, setLoading] = useState(Boolean(userId));
    const [error, setError] = useState<string | null>(null);
    const [fetchKey, setFetchKey] = useState(0);
    const refetch = useCallback(() => {
        setFetchKey((key) => key + 1);
    }, []);
    useEffect(() => {
        return subscribeDataChange('transactions', refetch);
    }, [refetch]);
    useEffect(() => {
        if (!userId) {
            return;
        }
        const activeUserId = userId;
        let cancelled = false;
        async function fetchFinance() {
            setLoading(true);
            setError(null);
            try {
                const data = await getUserFinance(activeUserId);
                if (!cancelled) {
                    setMonthly(data?.monthly ?? []);
                    setBreakdown(data?.breakdown ?? []);
                }
            }
            catch {
                if (!cancelled) {
                    setError('Không thể tải dữ liệu thu chi.');
                }
            }
            finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }
        void fetchFinance();
        return () => {
            cancelled = true;
        };
    }, [userId, fetchKey]);
    const activeMonthly = useMemo(() => (userId ? monthly : []), [userId, monthly]);
    const activeBreakdown = useMemo(() => (userId ? breakdown : []), [userId, breakdown]);
    const lineChartData = useMemo(() => transformMonthlyToLineChart(activeMonthly), [activeMonthly]);
    const incomePieData = useMemo(() => transformBreakdownToPieChart(activeBreakdown, 'income', PIE_COLORS), [activeBreakdown]);
    const expensePieData = useMemo(() => transformBreakdownToPieChart(activeBreakdown, 'expense', PIE_COLORS), [activeBreakdown]);
    const summary = useMemo(() => {
        if (!userId) {
            return EMPTY_SUMMARY;
        }
        return calculateFinanceSummary(activeMonthly);
    }, [userId, activeMonthly]);
    return useMemo(() => ({
        monthly: activeMonthly,
        breakdown: activeBreakdown,
        lineChartData,
        incomePieData,
        expensePieData,
        summary,
        loading: userId ? loading : false,
        error: userId ? error : null,
        refetch,
    }), [
        activeMonthly,
        activeBreakdown,
        lineChartData,
        incomePieData,
        expensePieData,
        summary,
        userId,
        loading,
        error,
        refetch,
    ]);
}
