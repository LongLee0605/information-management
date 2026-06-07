import type { MoneyFlowFilterParams, MoneyFlowSearchResult, MoneyFlowTrace } from '@/types/moneyFlow';
import { MOCK_DELAY_MS } from '@/constants';
import { delay } from '@/utils';
import { getAllMoneyFlowTraces } from '@/utils/moneyFlowTraceBuilder';
import { resolveTraceUserId, searchMoneyFlowTrace } from '@/utils/moneyFlowHelpers';

export async function getMoneyFlowTrace(userId: string): Promise<MoneyFlowTrace | null> {
  await delay(MOCK_DELAY_MS);
  return getAllMoneyFlowTraces()[userId] ?? null;
}

export async function searchMoneyFlow(
  filters: MoneyFlowFilterParams,
): Promise<MoneyFlowSearchResult> {
  await delay(MOCK_DELAY_MS);

  const normalizedCif = filters.cif.trim();
  const normalizedAccount = filters.accountNumber.trim();
  const traces = getAllMoneyFlowTraces();

  if (!normalizedCif && !normalizedAccount) {
    return {
      trace: null,
      stats: { relatedAccounts: 0, totalTransactions: 0, totalFlowAmount: 0, traceLevels: 0 },
      error: 'Vui lòng nhập Số CIF hoặc Số tài khoản.',
    };
  }

  const userId = resolveTraceUserId(traces, filters);

  if (!userId) {
    return {
      trace: null,
      stats: { relatedAccounts: 0, totalTransactions: 0, totalFlowAmount: 0, traceLevels: 0 },
      error: 'Không tìm thấy khách hàng với CIF hoặc số tài khoản đã nhập.',
    };
  }

  const source = traces[userId];
  if (!source) {
    return {
      trace: null,
      stats: { relatedAccounts: 0, totalTransactions: 0, totalFlowAmount: 0, traceLevels: 0 },
      error: 'Không có dữ liệu truy vết cho khách hàng này.',
    };
  }

  return searchMoneyFlowTrace(source, filters);
}
