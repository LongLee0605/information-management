import financeData from '@/data/finance.json';
import type { MonthlyFinance, SourceBreakdown, UserFinance } from '@/types';
import { MOCK_DELAY_MS } from '@/constants';
import { delay } from '@/utils';

const finances = financeData as UserFinance[];

export async function getMonthlyFinance(userId: string): Promise<MonthlyFinance[]> {
  await delay(MOCK_DELAY_MS);
  const record = finances.find((item) => item.userId === userId);
  return record?.monthly ?? [];
}

export async function getSourceBreakdown(userId: string): Promise<SourceBreakdown[]> {
  await delay(MOCK_DELAY_MS);
  const record = finances.find((item) => item.userId === userId);
  return record?.breakdown ?? [];
}

export async function getUserFinance(userId: string): Promise<UserFinance | null> {
  await delay(MOCK_DELAY_MS);
  return finances.find((item) => item.userId === userId) ?? null;
}
