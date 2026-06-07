import financeData from '@/data/finance.json';
import type { MonthlyFinance, SourceBreakdown, UserFinance } from '@/types';
import { MOCK_DELAY_MS } from '@/constants';
import { delay } from '@/utils';
import { expandMonthlyToAppYears, syncBreakdownWithMonthly } from '@/utils/financeSync';

const finances = financeData as UserFinance[];
const financeByUserId = new Map(finances.map((item) => [item.userId, item]));

function getFinanceRecord(userId: string): UserFinance | undefined {
  return financeByUserId.get(userId);
}

export async function getMonthlyFinance(userId: string): Promise<MonthlyFinance[]> {
  await delay(MOCK_DELAY_MS);
  const record = getFinanceRecord(userId);
  return expandMonthlyToAppYears(record?.monthly ?? []);
}

export async function getSourceBreakdown(userId: string): Promise<SourceBreakdown[]> {
  await delay(MOCK_DELAY_MS);
  const record = getFinanceRecord(userId);
  if (!record) {
    return [];
  }

  const monthly = expandMonthlyToAppYears(record.monthly);
  return syncBreakdownWithMonthly(record.breakdown, monthly);
}

export async function getUserFinance(userId: string): Promise<UserFinance | null> {
  await delay(MOCK_DELAY_MS);
  const record = getFinanceRecord(userId);
  if (!record) {
    return null;
  }

  const monthly = expandMonthlyToAppYears(record.monthly);

  return {
    ...record,
    monthly,
    breakdown: syncBreakdownWithMonthly(record.breakdown, monthly),
  };
}
