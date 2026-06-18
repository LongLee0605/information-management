import { useCallback, useEffect, useMemo, useState } from 'react';
import { getTransactionsByUserId } from '@/services';
import type { Transaction } from '@/types';
import { subscribeDataChange } from '@/utils/dataChangeBus';
import { resolveUserIdFromRouteParam } from '@/utils/userRoute';
interface UseTransactionsResult {
    transactions: Transaction[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}
export function useTransactions(routeParam: string | undefined): UseTransactionsResult {
    const userId = useMemo(() => resolveUserIdFromRouteParam(routeParam), [routeParam]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
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
        async function fetchTransactions() {
            setLoading(true);
            setError(null);
            try {
                const data = await getTransactionsByUserId(activeUserId);
                if (!cancelled) {
                    setTransactions(data);
                }
            }
            catch {
                if (!cancelled) {
                    setError('Không thể tải danh sách giao dịch.');
                }
            }
            finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }
        void fetchTransactions();
        return () => {
            cancelled = true;
        };
    }, [userId, fetchKey]);
    return useMemo(() => ({
        transactions: userId ? transactions : [],
        loading: userId ? loading : false,
        error: userId ? error : null,
        refetch,
    }), [userId, transactions, loading, error, refetch]);
}
