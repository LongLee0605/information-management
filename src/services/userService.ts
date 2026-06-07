import financeData from '@/data/finance.json';
import usersData from '@/data/users.json';
import type { User, UserFinance } from '@/types';
import { MOCK_DELAY_MS } from '@/constants';
import { calculateMonthlyIncomeAverage, expandMonthlyToAppYears } from '@/utils/financeSync';
import { delay } from '@/utils';

const users = usersData as User[];
const finances = financeData as UserFinance[];
const financeByUserId = new Map(finances.map((item) => [item.userId, item]));

function enrichUser(user: User): User {
  const finance = financeByUserId.get(user.id);
  const monthly = expandMonthlyToAppYears(finance?.monthly ?? []);
  if (!monthly.length) {
    return user;
  }

  return {
    ...user,
    monthlyIncomeAvg: calculateMonthlyIncomeAverage(monthly),
  };
}

export async function getUsers(): Promise<User[]> {
  await delay(MOCK_DELAY_MS);
  return users.map(enrichUser);
}

export async function getUserById(id: string): Promise<User | null> {
  await delay(MOCK_DELAY_MS);
  const user = users.find((item) => item.id === id);
  return user ? enrichUser(user) : null;
}
