import financeData from '@/data/finance.json';
import usersData from '@/data/users.json';
import type { CreateUserInput, User, UserFinance } from '@/types';
import { MOCK_DELAY_MS } from '@/constants';
import customerBankAccountsData from '@/data/customerBankAccounts.json';
import type { CustomerBankAccount } from '@/types';
import { invalidateAccountRegistryCache } from '@/utils/accountRegistry';
import { parseBirthDateFromCitizenId } from '@/utils/avatar';
import {
  appendRuntimeCustomerBankAccounts,
  loadRuntimeCustomerBankAccounts,
} from '@/utils/customerAccountRuntimeStore';
import { calculateMonthlyIncomeAverage, expandMonthlyToAppYears } from '@/utils/financeSync';
import { markUserDeleted, isUserDeleted } from '@/utils/deletedUsersRuntimeStore';
import { removeRuntimeAccountsByUserId } from '@/utils/customerAccountRuntimeStore';
import {
  appendRuntimeUser,
  loadRuntimeUsers,
  notifyUserChange,
  removeRuntimeUser,
  subscribeUserChange,
} from '@/utils/userRuntimeStore';
import { syncBirthDateFromCitizenId } from '@/utils/userBirthDate';
import {
  collectExistingAccountNumbers,
  generateUniqueAccountNumber,
  nextUniqueCif,
} from '@/utils/accountNumber';
import { createUniqueAvatarUrl, delay, getAvatarUrl } from '@/utils';
import type { CreateUserResult } from '@/types';

const baseUsers = syncUsersBirthDatesFromJson(usersData as User[]);
const finances = financeData as UserFinance[];
const baseAccounts = customerBankAccountsData as CustomerBankAccount[];
const financeByUserId = new Map(finances.map((item) => [item.userId, item]));

let usersListCache: User[] | null = null;
const usersByIdCache = new Map<string, User>();

function syncUsersBirthDatesFromJson(users: User[]): User[] {
  return users.map(syncBirthDateFromCitizenId);
}

function invalidateUsersCache(): void {
  usersListCache = null;
  usersByIdCache.clear();
}

subscribeUserChange(invalidateUsersCache);

function getAllUsersRaw(): User[] {
  if (usersListCache) {
    return usersListCache;
  }

  usersListCache = [...baseUsers, ...loadRuntimeUsers()]
    .filter((user) => !isUserDeleted(user.id))
    .map(syncBirthDateFromCitizenId);

  for (const user of usersListCache) {
    usersByIdCache.set(user.id, user);
  }

  return usersListCache;
}

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

function nextUserId(existingUsers: User[]): string {
  const max = existingUsers.reduce((currentMax, user) => {
    const value = Number.parseInt(user.id.replace(/\D/g, ''), 10);
    return value > currentMax ? value : currentMax;
  }, 0);

  return `u${String(max + 1).padStart(3, '0')}`;
}

export async function getUsers(): Promise<User[]> {
  await delay(MOCK_DELAY_MS);
  return getAllUsersRaw().map(enrichUser);
}

export async function getUserById(id: string): Promise<User | null> {
  await delay(MOCK_DELAY_MS);
  const user = usersByIdCache.get(id) ?? getAllUsersRaw().find((item) => item.id === id);
  return user ? enrichUser(user) : null;
}

export async function createUser(input: CreateUserInput): Promise<CreateUserResult> {
  await delay(MOCK_DELAY_MS);

  const allUsers = getAllUsersRaw();
  if (allUsers.some((user) => user.citizenId === input.citizenId)) {
    throw new Error('Số Căn cước công dân đã tồn tại');
  }

  const id = nextUserId(allUsers);
  const existingAccounts = [
    ...baseAccounts,
    ...loadRuntimeCustomerBankAccounts(),
  ];
  const cif = nextUniqueCif(existingAccounts);
  const avatar = createUniqueAvatarUrl({
    fullName: input.fullName,
    gender: input.gender,
    userId: id,
    citizenId: input.citizenId,
    existingAvatars: allUsers.map((user) => user.avatar).filter(Boolean),
  }) || getAvatarUrl(`${id}-${input.citizenId}`, input.gender);
  const dateOfBirth = parseBirthDateFromCitizenId(input.citizenId) ?? input.dateOfBirth;
  const user: User = {
    id,
    avatar,
    fullName: input.fullName,
    citizenId: input.citizenId,
    dateOfBirth,
    gender: input.gender,
    phone: '',
    email: '',
    address: input.address,
    workplace: '—',
    maritalStatus: '—',
    education: '—',
    monthlyIncomeAvg: 0,
  };

  appendRuntimeUser(user);
  invalidateUsersCache();

  const existingNumbers = collectExistingAccountNumbers(baseAccounts);

  const paymentNumber = generateUniqueAccountNumber(existingNumbers);
  existingNumbers.add(paymentNumber);
  const savingsNumber = generateUniqueAccountNumber(existingNumbers);
  existingNumbers.add(savingsNumber);
  const debitNumber = generateUniqueAccountNumber(existingNumbers);

  appendRuntimeCustomerBankAccounts([
    {
      id: `acc-${id}-payment`,
      userId: id,
      cif,
      accountNumber: paymentNumber,
      accountType: 'payment',
      accountTypeLabel: 'Tài khoản thanh toán',
      balance: 10_000_000,
      frozenBalance: 0,
      status: 'active',
      bank: 'OCB',
      bankBadgeClass: 'bg-orange-500 text-white',
      isPrimary: true,
    },
    {
      id: `acc-${id}-savings`,
      userId: id,
      cif,
      accountNumber: savingsNumber,
      accountType: 'savings',
      accountTypeLabel: 'Tài khoản tiết kiệm',
      balance: 0,
      frozenBalance: 0,
      status: 'active',
      bank: 'OCB',
      bankBadgeClass: 'bg-orange-500 text-white',
    },
    {
      id: `acc-${id}-debit`,
      userId: id,
      cif,
      accountNumber: debitNumber,
      accountType: 'debit',
      accountTypeLabel: 'Tài khoản ghi nợ',
      balance: 0,
      frozenBalance: 0,
      status: 'active',
      bank: 'OCB',
      bankBadgeClass: 'bg-orange-500 text-white',
    },
  ]);

  invalidateAccountRegistryCache();
  notifyUserChange();

  return { user: enrichUser(user), cif };
}

export async function deleteUser(userId: string): Promise<void> {
  await delay(MOCK_DELAY_MS);

  if (isUserDeleted(userId)) {
    throw new Error('Không tìm thấy khách hàng.');
  }

  const user = baseUsers.find((item) => item.id === userId)
    ?? loadRuntimeUsers().find((item) => item.id === userId);

  if (!user) {
    throw new Error('Không tìm thấy khách hàng.');
  }

  const isRuntimeUser = loadRuntimeUsers().some((item) => item.id === userId);
  if (isRuntimeUser) {
    removeRuntimeUser(userId);
  }

  removeRuntimeAccountsByUserId(userId);
  markUserDeleted(userId);
  invalidateUsersCache();
  invalidateAccountRegistryCache();
  notifyUserChange();
}
