import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useCanonicalUserRoute, useUser, useUserFinance } from '@/hooks';
import { useSelectedUserContext } from '@/context';
import { LineChartPanel } from '@/components/organisms/LineChartPanel';
import { PieChartPanel } from '@/components/organisms/PieChartPanel';
import { TabList } from '@/components/molecules/TabList';
import { ReportDateFilter } from '@/components/molecules/ReportDateFilter';
import { UserPageShell } from '@/components/templates/UserPageShell';
import { getEffectiveAppDateRange, REPORT_TABS, PIE_COLORS, type ReportTab } from '@/constants';
import { calculateFinanceSummary, filterMonthlyByDateRange, formatDateRangeLabel, transformBreakdownToPieChart, transformMonthlyToLineChart, } from '@/utils/chartTransformers';
import { formatCitizenId } from '@/utils';
const DEFAULT_RANGE = getEffectiveAppDateRange();
const DEFAULT_FROM = DEFAULT_RANGE.fromDate;
const DEFAULT_TO = DEFAULT_RANGE.toDate;
function isValidReportTab(tab: string | null): tab is ReportTab {
    return tab === 'charts' || tab === 'sources';
}
export default function ReportsPage() {
    const { id } = useParams<{
        id: string;
    }>();
    const { setContextUserId } = useSelectedUserContext();
    const [searchParams, setSearchParams] = useSearchParams();
    const [fromDate, setFromDate] = useState<string>(DEFAULT_FROM);
    const [toDate, setToDate] = useState<string>(DEFAULT_TO);
    const tabParam = searchParams.get('tab');
    const activeTab: ReportTab = isValidReportTab(tabParam) ? tabParam : 'charts';
    useCanonicalUserRoute();
    const { user, userId, loading: userLoading, error: userError, notFound, refetch } = useUser(id);
    const dateRange = useMemo(() => ({ fromDate, toDate }), [fromDate, toDate]);
    const { monthly, breakdown, loading: financeLoading, error: financeError, refetch: refetchFinance, } = useUserFinance(id, { dateRange });
    const filteredMonthly = useMemo(() => filterMonthlyByDateRange(monthly, fromDate, toDate), [monthly, fromDate, toDate]);
    const lineChartData = useMemo(() => transformMonthlyToLineChart(filteredMonthly), [filteredMonthly]);
    const incomePieData = useMemo(() => transformBreakdownToPieChart(breakdown, 'income', PIE_COLORS), [breakdown]);
    const expensePieData = useMemo(() => transformBreakdownToPieChart(breakdown, 'expense', PIE_COLORS), [breakdown]);
    const filteredSummary = useMemo(() => calculateFinanceSummary(filteredMonthly), [filteredMonthly]);
    const periodLabel = formatDateRangeLabel(fromDate, toDate);
    useEffect(() => {
        if (userId) {
            setContextUserId(userId);
        }
    }, [userId, setContextUserId]);
    const handleApplyDateFilter = useCallback((nextFrom: string, nextTo: string) => {
        setFromDate(nextFrom);
        setToDate(nextTo);
    }, []);
    const handleTabChange = useCallback((tab: ReportTab) => {
        setSearchParams(tab === 'charts' ? {} : { tab });
    }, [setSearchParams]);
    return (<UserPageShell user={user} loading={userLoading || financeLoading} notFound={notFound} error={userError ?? financeError} title="Tổng Quan Thu Chi" subtitle={user
            ? `Nguồn thu chi riêng · ${user.fullName} · không gộp với khách hàng khác`
            : undefined} summary={filteredSummary} summaryPeriodLabel={periodLabel} beforeSummary={user ? (<ReportDateFilter key={`${fromDate}-${toDate}`} citizenId={formatCitizenId(user.citizenId)} fromDate={fromDate} toDate={toDate} onApply={handleApplyDateFilter}/>) : undefined} onRetry={() => {
            refetch();
            refetchFinance();
        }}>
      <TabList tabs={REPORT_TABS} activeTab={activeTab} onTabChange={handleTabChange}/>

      <div role="tabpanel">
        {activeTab === 'charts' ? (<LineChartPanel data={lineChartData} periodLabel={periodLabel}/>) : (<PieChartPanel incomeData={incomePieData} expenseData={expensePieData} periodLabel={periodLabel}/>)}
      </div>
    </UserPageShell>);
}
