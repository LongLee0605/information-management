import { useEffect, useMemo, useState } from 'react';
import { useActiveUserId } from '@/hooks';
import { MoneyFlowExplorer } from '@/components/organisms/MoneyFlowExplorer';
import { MoneyFlowFilter, type MoneyFlowFilterValues, } from '@/components/molecules/MoneyFlowFilter';
import { MoneyFlowStatsCards } from '@/components/molecules/MoneyFlowStats';
import { PageToolbar } from '@/components/molecules/PageToolbar';
import { Skeleton } from '@/components/atoms/Skeleton';
import { getCustomerBankAccountsByUserId, warmApiAccountCache } from '@/services/accountService';
import { getMoneyFlowTrace, searchMoneyFlow } from '@/services/moneyFlowService';
import { getEffectiveAppDateRange } from '@/constants';
import type { MoneyFlowSearchResult } from '@/types/moneyFlow';
import { getCifFromUserId } from '@/utils';
import { formatMoneyFlowPeriodLabel } from '@/utils/moneyFlowHelpers';
import { subscribeDataChange } from '@/utils/dataChangeBus';

const DEFAULT_DATES = getEffectiveAppDateRange();
const EMPTY_STATS = {
    relatedAccounts: 0,
    totalTransactions: 0,
    totalFlowAmount: 0,
    traceLevels: 0,
};

function pickPrimaryAccount(accounts: Awaited<ReturnType<typeof getCustomerBankAccountsByUserId>>) {
    return accounts.find((account) => account.accountType === 'payment' && account.status === 'active')
        ?? accounts.find((account) => account.status === 'active')
        ?? accounts[0]
        ?? null;
}

async function buildDefaultFilters(selectedUserId: string | null, rootAccount = ''): Promise<MoneyFlowFilterValues> {
    if (!selectedUserId) {
        return {
            cif: '',
            accountNumber: '',
            ...DEFAULT_DATES,
        };
    }

    await warmApiAccountCache();
    const accounts = await getCustomerBankAccountsByUserId(selectedUserId);
    const primaryAccount = pickPrimaryAccount(accounts);

    return {
        customerId: selectedUserId,
        cif: primaryAccount?.cif ?? getCifFromUserId(selectedUserId),
        accountNumber: rootAccount || primaryAccount?.accountNumber || '',
        ...DEFAULT_DATES,
    };
}

export default function MoneyFlowTracePage() {
    const selectedUserId = useActiveUserId();
    const [defaultFilters, setDefaultFilters] = useState<MoneyFlowFilterValues>(() => ({
        cif: '',
        accountNumber: '',
        ...DEFAULT_DATES,
    }));
    const [draftFilters, setDraftFilters] = useState<MoneyFlowFilterValues | null>(null);
    const [appliedFilters, setAppliedFilters] = useState<MoneyFlowFilterValues | null>(null);
    const [result, setResult] = useState<MoneyFlowSearchResult | null>(null);
    const [searching, setSearching] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [hasSearched, setHasSearched] = useState(false);
    const [flowRevision, setFlowRevision] = useState(0);
    const filtersDirty = useMemo(() => {
        if (!draftFilters || !appliedFilters) {
            return false;
        }
        return (draftFilters.cif !== appliedFilters.cif
            || draftFilters.accountNumber !== appliedFilters.accountNumber
            || draftFilters.fromDate !== appliedFilters.fromDate
            || draftFilters.toDate !== appliedFilters.toDate
            || draftFilters.customerId !== appliedFilters.customerId);
    }, [draftFilters, appliedFilters]);
    useEffect(() => {
        const unsubscribeTx = subscribeDataChange('transactions', () => {
            setFlowRevision((value) => value + 1);
        });
        const unsubscribeAccounts = subscribeDataChange('accounts', () => {
            setFlowRevision((value) => value + 1);
        });
        return () => {
            unsubscribeTx();
            unsubscribeAccounts();
        };
    }, []);
    const accountPlaceholder = useMemo(() => defaultFilters.accountNumber || 'Nhập số tài khoản F0', [defaultFilters.accountNumber]);
    useEffect(() => {
        let cancelled = false;
        async function initDefaults() {
            setInitializing(true);
            let rootAccount = '';
            if (selectedUserId) {
                const trace = await getMoneyFlowTrace(selectedUserId);
                rootAccount = trace?.root.accountNumber ?? '';
            }
            if (cancelled) {
                return;
            }
            const nextDefaults = await buildDefaultFilters(selectedUserId, rootAccount);
            setDefaultFilters(nextDefaults);
            setDraftFilters(nextDefaults);
            if (selectedUserId) {
                setAppliedFilters(nextDefaults);
            }
            else {
                setAppliedFilters(null);
                setResult(null);
                setHasSearched(false);
            }
            setInitializing(false);
        }
        void initDefaults();
        return () => {
            cancelled = true;
        };
    }, [selectedUserId]);
    useEffect(() => {
        if (!appliedFilters || initializing) {
            return;
        }
        let cancelled = false;
        async function loadResult() {
            if (!appliedFilters) {
                return;
            }
            const activeFilters = appliedFilters;
            setSearching(true);
            setHasSearched(true);
            try {
                const data = await searchMoneyFlow(activeFilters);
                if (!cancelled) {
                    setResult(data);
                }
            }
            catch {
                if (!cancelled) {
                    setResult({
                        trace: null,
                        stats: EMPTY_STATS,
                        error: 'Không thể tải dữ liệu truy vết.',
                    });
                }
            }
            finally {
                if (!cancelled) {
                    setSearching(false);
                }
            }
        }
        void loadResult();
        return () => {
            cancelled = true;
        };
    }, [appliedFilters, initializing, flowRevision]);
    function handleFilterChange(next: MoneyFlowFilterValues) {
        setDraftFilters((current) => {
            const datesChanged = current
                && (next.fromDate !== current.fromDate || next.toDate !== current.toDate);
            if (datesChanged) {
                setAppliedFilters({
                    ...next,
                    customerId: next.customerId ?? current.customerId ?? selectedUserId ?? undefined,
                });
            }
            return next;
        });
    }
    function handleSearch() {
        if (!draftFilters) {
            return;
        }
        setAppliedFilters({
            ...draftFilters,
            customerId: draftFilters.customerId ?? selectedUserId ?? undefined,
        });
    }
    const statsPeriodLabel = appliedFilters
        ? formatMoneyFlowPeriodLabel(appliedFilters.fromDate, appliedFilters.toDate)
        : undefined;
    function handleReset() {
        setDraftFilters({ ...defaultFilters });
        setAppliedFilters({ ...defaultFilters });
    }
    if (initializing || !draftFilters) {
        return (<div className="page-stack">
        <Skeleton className="h-24 w-full rounded-lg"/>
        <Skeleton className="h-32 w-full rounded-lg"/>
        <Skeleton className="h-96 w-full rounded-lg"/>
      </div>);
    }
    return (<div className="page-stack">
      <PageToolbar title="Truy Vết Dòng Tiền" subtitle={selectedUserId
            ? `Gợi ý CIF ${getCifFromUserId(selectedUserId)} · chuyển Sơ đồ / Bảng chi tiết để xem toàn bộ luồng`
            : 'Nhập CIF hoặc số tài khoản F0 · dùng Bảng chi tiết để xem nhanh toàn bộ tài khoản'}/>

      <MoneyFlowFilter defaultValues={defaultFilters} accountPlaceholder={accountPlaceholder} values={draftFilters} onChange={handleFilterChange} onSearch={handleSearch} onReset={handleReset} error={result?.error} dirty={filtersDirty}/>

      {searching ? (<Skeleton className="h-28 w-full rounded-lg"/>) : (<MoneyFlowStatsCards stats={result?.stats ?? EMPTY_STATS} periodLabel={statsPeriodLabel}/>)}

      {searching ? (<Skeleton className="h-[620px] w-full rounded-lg"/>) : result?.trace ? (<MoneyFlowExplorer key={result.trace.root.id} root={result.trace.root}/>) : (hasSearched && !result?.error && (<div className="dashboard-card p-6 text-center">
            <p className="text-base font-semibold text-foreground">Chưa có dữ liệu truy vết</p>
            <p className="mt-2 text-sm text-muted">
              Nhập CIF hoặc số tài khoản F0, chọn khoảng thời gian và bấm Tìm Kiếm.
            </p>
          </div>))}

      {result?.error && !result.trace && hasSearched && !searching && (<div className="dashboard-card border border-red-100 bg-red-50/60 p-6 text-center">
          <p className="text-sm font-medium text-red-700">{result.error}</p>
        </div>)}
    </div>);
}
