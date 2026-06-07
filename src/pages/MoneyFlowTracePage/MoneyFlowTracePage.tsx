import { useEffect, useMemo, useState } from 'react';
import { useActiveUserId } from '@/hooks';
import { MoneyFlowDiagram } from '@/components/organisms/MoneyFlowDiagram';
import {
  MoneyFlowFilter,
  type MoneyFlowFilterValues,
} from '@/components/molecules/MoneyFlowFilter';
import { MoneyFlowStatsCards } from '@/components/molecules/MoneyFlowStats';
import { PageToolbar } from '@/components/molecules/PageToolbar';
import { Skeleton } from '@/components/atoms/Skeleton';
import { getMoneyFlowTrace, searchMoneyFlow } from '@/services/moneyFlowService';
import { getEffectiveAppDateRange } from '@/constants';
import type { MoneyFlowSearchResult } from '@/types/moneyFlow';
import { getCifFromUserId } from '@/utils';
import { subscribeMoneyFlowChange } from '@/utils/moneyFlowChange';

const DEFAULT_DATES = getEffectiveAppDateRange();

const EMPTY_STATS = {
  relatedAccounts: 0,
  totalTransactions: 0,
  totalFlowAmount: 0,
  traceLevels: 0,
};

function buildDefaultFilters(
  selectedUserId: string | null,
  rootAccount = '',
): MoneyFlowFilterValues {
  if (!selectedUserId) {
    return {
      cif: '',
      accountNumber: '',
      ...DEFAULT_DATES,
    };
  }

  return {
    cif: getCifFromUserId(selectedUserId),
    accountNumber: rootAccount,
    ...DEFAULT_DATES,
  };
}

export default function MoneyFlowTracePage() {
  const selectedUserId = useActiveUserId();

  const [defaultFilters, setDefaultFilters] = useState<MoneyFlowFilterValues>(() =>
    buildDefaultFilters(selectedUserId),
  );
  const [draftFilters, setDraftFilters] = useState<MoneyFlowFilterValues | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<MoneyFlowFilterValues | null>(null);
  const [result, setResult] = useState<MoneyFlowSearchResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [flowRevision, setFlowRevision] = useState(0);

  useEffect(() => {
    return subscribeMoneyFlowChange(() => {
      setFlowRevision((value) => value + 1);
    });
  }, []);

  const accountPlaceholder = useMemo(
    () => defaultFilters.accountNumber || 'Nhập số tài khoản F0',
    [defaultFilters.accountNumber],
  );

  useEffect(() => {
    let cancelled = false;

    async function initDefaults() {
      setInitializing(true);

      let rootAccount = '';
      if (selectedUserId) {
        const trace = await getMoneyFlowTrace(selectedUserId);
        rootAccount = trace?.root.accountNumber ?? '';
      }

      if (cancelled) return;

      const nextDefaults = buildDefaultFilters(selectedUserId, rootAccount);
      setDefaultFilters(nextDefaults);
      setDraftFilters(nextDefaults);
      if (selectedUserId) {
        setAppliedFilters(nextDefaults);
      } else {
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
    if (!appliedFilters || initializing) return;

    let cancelled = false;

    async function loadResult() {
      if (!appliedFilters) return;

      const activeFilters = appliedFilters;
      setSearching(true);
      setHasSearched(true);
      try {
        const data = await searchMoneyFlow(activeFilters);
        if (!cancelled) {
          setResult(data);
        }
      } catch {
        if (!cancelled) {
          setResult({
            trace: null,
            stats: EMPTY_STATS,
            error: 'Không thể tải dữ liệu truy vết.',
          });
        }
      } finally {
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

  function handleSearch() {
    if (!draftFilters) return;
    setAppliedFilters({ ...draftFilters });
  }

  function handleReset() {
    setDraftFilters({ ...defaultFilters });
    setAppliedFilters({ ...defaultFilters });
  }

  if (initializing || !draftFilters) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageToolbar
        title="Truy Vết Dòng Tiền"
        subtitle={
          selectedUserId
            ? `Đang gợi ý tài khoản ${getCifFromUserId(selectedUserId)} · có thể đổi CIF hoặc số tài khoản bất cứ lúc nào`
            : 'Nhập CIF hoặc số tài khoản F0 để truy vết — không cần chọn khách hàng trước'
        }
      />

      <MoneyFlowFilter
        defaultValues={defaultFilters}
        accountPlaceholder={accountPlaceholder}
        values={draftFilters}
        onChange={setDraftFilters}
        onSearch={handleSearch}
        onReset={handleReset}
        error={result?.error}
      />

      {searching ? (
        <Skeleton className="h-28 w-full rounded-lg" />
      ) : (
        <MoneyFlowStatsCards stats={result?.stats ?? EMPTY_STATS} />
      )}

      {searching ? (
        <Skeleton className="h-[520px] w-full rounded-lg" />
      ) : result?.trace ? (
        <MoneyFlowDiagram root={result.trace.root} />
      ) : (
        hasSearched && !result?.error && (
          <div className="dashboard-card p-8 text-center text-muted">
            Nhập bộ lọc và bấm Tìm Kiếm để xem sơ đồ dòng tiền.
          </div>
        )
      )}
    </div>
  );
}
