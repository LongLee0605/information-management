import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { getUserFinance } from '@/services';
import type { MonthlyFinance, SourceBreakdown } from '@/types';
import { getRuntimeBalanceAdjustment } from '@/utils/accountRuntimeStore';
import {
  calculateFinanceSummary,
  transformBreakdownToPieChart,
  transformMonthlyToLineChart,
} from '@/utils/chartTransformers';
import { subscribeTransactionChange } from '@/utils/transferRuntimeStore';
import { PIE_COLORS } from '@/constants';

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

export function useUserFinance(userId: string | undefined): UseUserFinanceResult {
  const [monthly, setMonthly] = useState<MonthlyFinance[]>([]);
  const [breakdown, setBreakdown] = useState<SourceBreakdown[]>([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  const refetch = useCallback(() => {
    setFetchKey((key) => key + 1);
  }, []);

  const balanceAdjustment = useSyncExternalStore(
    subscribeTransactionChange,
    () => (userId ? getRuntimeBalanceAdjustment(userId) : 0),
    () => 0,
  );

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
      } catch {
        if (!cancelled) {
          setError('Không thể tải dữ liệu thu chi.');
        }
      } finally {
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

  const activeMonthly = useMemo(
    () => (userId ? monthly : []),
    [userId, monthly],
  );

  const activeBreakdown = useMemo(
    () => (userId ? breakdown : []),
    [userId, breakdown],
  );

  const lineChartData = useMemo(
    () => transformMonthlyToLineChart(activeMonthly),
    [activeMonthly],
  );

  const incomePieData = useMemo(
    () => transformBreakdownToPieChart(activeBreakdown, 'income', PIE_COLORS),
    [activeBreakdown],
  );

  const expensePieData = useMemo(
    () => transformBreakdownToPieChart(activeBreakdown, 'expense', PIE_COLORS),
    [activeBreakdown],
  );

  const summary = useMemo(() => {
    if (!userId) {
      return EMPTY_SUMMARY;
    }

    const base = calculateFinanceSummary(activeMonthly);

    return {
      ...base,
      balance: base.balance + balanceAdjustment,
    };
  }, [userId, activeMonthly, balanceAdjustment]);

  return useMemo(
    () => ({
      monthly: activeMonthly,
      breakdown: activeBreakdown,
      lineChartData,
      incomePieData,
      expensePieData,
      summary,
      loading: userId ? loading : false,
      error: userId ? error : null,
      refetch,
    }),
    [
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
    ],
  );
}
