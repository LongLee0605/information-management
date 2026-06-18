export type BankAccountType = 'payment' | 'savings' | 'debit' | 'overdraft';

export type BankAccountStatus = 'active' | 'inactive';

export interface CustomerBankAccount {
  id: string;
  userId: string;
  cif: string;
  accountNumber: string;
  accountType: BankAccountType;
  accountTypeLabel: string;
  balance: number;
  frozenBalance: number;
  status: BankAccountStatus;
  bank: string;
  bankBadgeClass: string;
  isPrimary?: boolean;
}

export interface EnrichedBankAccount extends CustomerBankAccount {
  fullName: string;
  avatar: string;
  availableBalance: number;
}

export interface CreateBankAccountInput {
  cif: string;
  accountType: BankAccountType;
  bankId?: string;
}

export interface CifVerificationResult {
  userId: string;
  cif: string;
  fullName: string;
  phone: string;
}
