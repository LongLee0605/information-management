import type { BankAccountStatus, BankAccountType, EnrichedBankAccount } from '@/types';
export interface AccountFilterValues {
    cif: string;
    accountNumber: string;
    accountType: BankAccountType | '';
    status: BankAccountStatus | '';
}
export const EMPTY_ACCOUNT_FILTER: AccountFilterValues = {
    cif: '',
    accountNumber: '',
    accountType: '',
    status: '',
};
export const ACCOUNT_TYPE_FILTER_OPTIONS: {
    value: BankAccountType;
    label: string;
}[] = [
    { value: 'payment', label: 'Tài khoản thanh toán' },
    { value: 'savings', label: 'Tài khoản tiết kiệm' },
];
export const ACCOUNT_STATUS_FILTER_OPTIONS: {
    value: BankAccountStatus;
    label: string;
}[] = [
    { value: 'active', label: 'Hoạt động' },
    { value: 'inactive', label: 'Ngưng hoạt động' },
];
export function buildAccountFilterResetKey(filters: AccountFilterValues): string {
    return `${filters.cif}|${filters.accountNumber}|${filters.accountType}|${filters.status}`;
}
export function filterBankAccounts(accounts: EnrichedBankAccount[], filters: AccountFilterValues): EnrichedBankAccount[] {
    const cif = filters.cif.trim().toUpperCase();
    const accountNumber = filters.accountNumber.replace(/\D/g, '');
    if (!cif && !accountNumber && !filters.accountType && !filters.status) {
        return accounts;
    }
    return accounts.filter((account) => {
        if (cif && !account.cif.toUpperCase().includes(cif)) {
            return false;
        }
        if (accountNumber && !account.accountNumber.replace(/\D/g, '').includes(accountNumber)) {
            return false;
        }
        if (filters.accountType && account.accountType !== filters.accountType) {
            return false;
        }
        if (filters.status && account.status !== filters.status) {
            return false;
        }
        return true;
    });
}
