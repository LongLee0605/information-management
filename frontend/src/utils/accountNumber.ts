import type { CustomerBankAccount } from '@/types';

export function normalizePhoneDigits(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 9 && digits.startsWith('9')) {
    return `0${digits}`;
  }

  if (digits.length === 11 && digits.startsWith('84')) {
    return `0${digits.slice(2)}`;
  }

  if (digits.length >= 10) {
    return digits.slice(-10);
  }

  return digits.padStart(10, '0');
}

export function formatPhoneDisplay(phone: string): string {
  const digits = normalizePhoneDigits(phone);
  if (digits.length !== 10) {
    return phone.trim() || '—';
  }

  return `${digits.slice(0, 4)}.${digits.slice(4, 7)}.${digits.slice(7)}`;
}

export function formatAccountNumberDisplay(accountNumber: string): string {
  const digits = accountNumber.replace(/\D/g, '');
  if (digits.length <= 4) {
    return digits;
  }

  const head = digits.slice(0, 4);
  const tail = digits.slice(4).replace(/(\d{3})(?=\d)/g, '$1.');
  return tail ? `${head}.${tail}` : head;
}

export function collectExistingAccountNumbers(
  extraAccounts: CustomerBankAccount[] = [],
): Set<string> {
  return new Set(
    extraAccounts
      .map((account) => account.accountNumber.replace(/\D/g, ''))
      .filter(Boolean),
  );
}
