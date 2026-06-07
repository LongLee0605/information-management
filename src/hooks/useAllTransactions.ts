import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAllTransactions } from '@/services';
import type { TransactionWithUser } from '@/types';
import { subscribeTransactionChange } from '@/utils/transferRuntimeStore';
interface UseAllTransactionsResult {
  transactions: TransactionWithUser[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAllTransactions(): UseAllTransactionsResult {
  const [transactions, setTransactions] = useState<TransactionWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  const refetch = useCallback(() => {
    setFetchKey((key) => key + 1);
  }, []);

  useEffect(() => {
    return subscribeTransactionChange(refetch);
  }, [refetch]);

  useEffect(() => {
    let cancelled = false;

    async function fetchTransactions() {
      setLoading(true);
      setError(null);

      try {
        const data = await getAllTransactions();
        if (!cancelled) {
          setTransactions(data);
        }
      } catch {
        if (!cancelled) {
          setError('Không thể tải danh sách giao dịch.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchTransactions();

    return () => {
      cancelled = true;
    };
  }, [fetchKey]);

  return useMemo(
    () => ({
      transactions,
      loading,
      error,
      refetch,
    }),
    [transactions, loading, error, refetch],
  );
}
