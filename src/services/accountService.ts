import customerBankAccountsData from '@/data/customerBankAccounts.json';
import { MOCK_DELAY_MS } from '@/constants';
import { getCustomerBankOption } from '@/constants/banks';
import type {
  CifVerificationResult,
  CreateBankAccountInput,
  CustomerBankAccount,
  EnrichedBankAccount,
} from '@/types';
import { ACCOUNT_TYPE_FILTER_OPTIONS } from '@/utils/accountFilter';
import {
  getAccountsByUserId,
  getAllBankAccounts,
  getUserIdFromCif,
  invalidateAccountRegistryCache,
} from '@/utils/accountRegistry';
import {
  appendRuntimeCustomerBankAccounts,
  loadRuntimeCustomerBankAccounts,
  removeRuntimeAccountById,
} from '@/utils/customerAccountRuntimeStore';
import { isAccountDeleted, markAccountDeleted } from '@/utils/deletedAccountsRuntimeStore';
import { isUserDeleted } from '@/utils/deletedUsersRuntimeStore';
import { getUserById } from '@/services/userService';
import { delay } from '@/utils';

const baseAccounts = customerBankAccountsData as CustomerBankAccount[];

function generateAccountNumber(existingNumbers: Set<string>): string {
  let candidate = String(Math.floor(10_000_000_000 + Math.random() * 90_000_000_000));
  while (existingNumbers.has(candidate)) {
    candidate = String(Math.floor(10_000_000_000 + Math.random() * 90_000_000_000));
  }
  return candidate;
}

export async function getCustomerBankAccountsByUserId(
  userId: string,
): Promise<EnrichedBankAccount[]> {
  await delay(MOCK_DELAY_MS);
  return getAccountsByUserId(userId);
}

export async function getAllCustomerBankAccounts(): Promise<EnrichedBankAccount[]> {
  await delay(MOCK_DELAY_MS);
  return getAllBankAccounts();
}

export async function verifyCif(cif: string): Promise<CifVerificationResult> {
  await delay(MOCK_DELAY_MS);

  const trimmedCif = cif.trim();
  const userId = getUserIdFromCif(trimmedCif);

  if (!userId || isUserDeleted(userId)) {
    throw new Error('Không tìm thấy khách hàng với số CIF này.');
  }

  const user = await getUserById(userId);
  if (!user) {
    throw new Error('Không tìm thấy khách hàng với số CIF này.');
  }

  const accounts = getAccountsByUserId(userId);
  const canonicalCif = accounts[0]?.cif ?? trimmedCif;

  return {
    userId,
    cif: canonicalCif,
    fullName: user.fullName,
  };
}

export async function createBankAccount(input: CreateBankAccountInput): Promise<EnrichedBankAccount> {
  await delay(MOCK_DELAY_MS);

  const verification = await verifyCif(input.cif);
  const bank = getCustomerBankOption(input.bankId);

  if (!bank) {
    throw new Error('Ngân hàng không hợp lệ.');
  }

  const accountTypeLabel = ACCOUNT_TYPE_FILTER_OPTIONS.find(
    (option) => option.value === input.accountType,
  )?.label;

  if (!accountTypeLabel) {
    throw new Error('Loại tài khoản không hợp lệ.');
  }

  const existingAccounts = [
    ...baseAccounts,
    ...loadRuntimeCustomerBankAccounts(),
  ].filter((account) => account.userId === verification.userId);

  const existingNumbers = new Set([
    ...baseAccounts.map((account) => account.accountNumber),
    ...loadRuntimeCustomerBankAccounts().map((account) => account.accountNumber),
  ]);

  const accountNumber = generateAccountNumber(existingNumbers);
  const hasPrimaryPayment = existingAccounts.some(
    (account) => account.accountType === 'payment' && account.isPrimary,
  );

  const account: CustomerBankAccount = {
    id: `acc-${verification.userId}-${input.accountType}-${Date.now()}`,
    userId: verification.userId,
    cif: verification.cif,
    accountNumber,
    accountType: input.accountType,
    accountTypeLabel,
    balance: input.accountType === 'payment' ? 10_000_000 : 0,
    frozenBalance: 0,
    status: 'active',
    bank: bank.name,
    bankBadgeClass: bank.badgeClass,
    isPrimary: input.accountType === 'payment' && !hasPrimaryPayment ? true : undefined,
  };

  appendRuntimeCustomerBankAccounts([account]);

  const enriched = getAccountsByUserId(verification.userId).find((item) => item.id === account.id);
  if (!enriched) {
    throw new Error('Không thể tạo tài khoản. Vui lòng thử lại.');
  }

  return enriched;
}

export async function deleteBankAccount(accountId: string): Promise<void> {
  await delay(MOCK_DELAY_MS);

  if (isAccountDeleted(accountId)) {
    throw new Error('Không tìm thấy tài khoản.');
  }

  const account = getAllBankAccounts().find((item) => item.id === accountId);
  if (!account) {
    throw new Error('Không tìm thấy tài khoản.');
  }

  const isRuntimeAccount = loadRuntimeCustomerBankAccounts().some((item) => item.id === accountId);
  if (isRuntimeAccount) {
    removeRuntimeAccountById(accountId);
  }

  markAccountDeleted(accountId);
  invalidateAccountRegistryCache();
}
