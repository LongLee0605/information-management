import type { CustomerBankAccount } from '@/types';
import { loadRuntimeCustomerBankAccounts } from '@/utils/customerAccountRuntimeStore';

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

export function collectExistingAccountNumbers(
  extraAccounts: CustomerBankAccount[] = [],
): Set<string> {
  return new Set(
    [...extraAccounts, ...loadRuntimeCustomerBankAccounts()]
      .map((account) => account.accountNumber.replace(/\D/g, ''))
      .filter(Boolean),
  );
}

export function generateUniqueAccountNumber(
  existingNumbers: Set<string>,
  preferredPhone = '',
): string {
  const normalizedPhone = normalizePhoneDigits(preferredPhone);
  const candidates: string[] = [];

  if (normalizedPhone.length === 10) {
    candidates.push(normalizedPhone);

    for (let suffix = 1; suffix <= 99; suffix += 1) {
      candidates.push(`${normalizedPhone.slice(0, 8)}${String(suffix).padStart(2, '0')}`);
    }
  }

  for (const candidate of candidates) {
    if (!existingNumbers.has(candidate)) {
      return candidate;
    }
  }

  let fallback = String(Math.floor(1_000_000_000 + Math.random() * 9_000_000_000));
  while (existingNumbers.has(fallback)) {
    fallback = String(Math.floor(1_000_000_000 + Math.random() * 9_000_000_000));
  }

  return fallback;
}

export function nextUniqueCif(existingAccounts: CustomerBankAccount[]): string {
  const used = new Set(
    existingAccounts
      .map((account) => account.cif.replace(/\D/g, ''))
      .filter(Boolean),
  );

  const values = [...used]
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => !Number.isNaN(value));

  const max = values.length > 0 ? Math.max(...values) : 26_410_000;
  let candidate = max + 1;

  while (used.has(String(candidate))) {
    candidate += 1;
  }

  return String(candidate);
}
