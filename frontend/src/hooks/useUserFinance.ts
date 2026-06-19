import { useCallback, useEffect, useMemo, useState } from 'react';
import { getUserFinance, type FinanceDateRange } from '@/services/financeService';
import type { MonthlyFinance, SourceBreakdown } from '@/types';
import { calculateFinanceSummary, transformBreakdownToPieChart, transformMonthlyToLineChart, } from '@/utils/chartTransformers';
import { useRouteUserId } from '@/hooks/useRouteUserId';
import { subscribeDataChange } from '@/utils/dataChangeBus';
import { getEffectiveAppDateRange } from '@/utils/demoDate';
import { PIE_COLORS } from '@/constants';

interface UseUserFinanceOptions {
    dateRange?: FinanceDateRange;
}

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

function resolveDateRange(options?: UseUserFinanceOptions): FinanceDateRange {
    if (options?.dateRange) {
        return options.dateRange;
    }
    const range = getEffectiveAppDateRange();
    return { fromDate: range.fromDate, toDate: range.toDate };
}

export function useUserFinance(routeParam: string | undefined, options?: UseUserFinanceOptions): UseUserFinanceResult {
    const { userId, resolving } = useRouteUserId(routeParam);
    const dateRange = useMemo(() => resolveDateRange(options), [options?.dateRange?.fromDate, options?.dateRange?.toDate]);
    const [monthly, setMonthly] = useState<MonthlyFinance[]>([]);
    const [breakdown, setBreakdown] = useState<SourceBreakdown[]>([]);
    const [loading, setLoading] = useState(Boolean(routeParam));
    const [error, setError] = useState<string | null>(null);
    const [fetchKey, setFetchKey] = useState(0);
    const refetch = useCallback(() => {
        setFetchKey((key) => key + 1);
    }, []);
    useEffect(() => {
        const unsubscribeTx = subscribeDataChange('transactions', refetch);
        const unsubscribeAccounts = subscribeDataChange('accounts', refetch);
        return () => {
            unsubscribeTx();
            unsubscribeAccounts();
        };
    }, [refetch]);
    useEffect(() => {
        if (!userId) {
            setLoading(resolving);
            return;
        }
        const activeUserId = userId;
        const activeRange = dateRange;
        let cancelled = false;
        async function fetchFinance() {
            setLoading(true);
            setError(null);
            try {
                const data = await getUserFinance(activeUserId, activeRange);
                if (!cancelled) {
                    setMonthly(data.monthly);
                    setBreakdown(data.breakdown);
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
    }, [userId, fetchKey, dateRange.fromDate, dateRange.toDate]);
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
        loading: Boolean(routeParam && (resolving || (userId && loading))),
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
        resolving,
        loading,
        error,
        refetch,
    ]);
}
