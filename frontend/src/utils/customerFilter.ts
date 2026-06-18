import type { User } from '@/types';
import { getApiCifFromUserId } from '@/utils/apiAccountCache';

export interface CustomerFilterValues {
  cif: string;
  citizenId: string;
  fullName: string;
  birthYear: string;
}

export const EMPTY_CUSTOMER_FILTER: CustomerFilterValues = {
  cif: '',
  citizenId: '',
  fullName: '',
  birthYear: '',
};

export function filterCustomers(users: User[], filters: CustomerFilterValues): User[] {
  const cif = filters.cif.trim().toUpperCase();
  const citizenId = filters.citizenId.replace(/\D/g, '');
  const fullName = filters.fullName.trim().toLowerCase();
  const birthYear = filters.birthYear.replace(/\D/g, '');

  if (!cif && !citizenId && !fullName && !birthYear) {
    return users;
  }

  const cifByUserId = cif
    ? new Map(users.map((user) => [user.id, getApiCifFromUserId(user.id) ?? user.id]))
    : null;

  return users.filter((user) => {
    if (cif && !cifByUserId!.get(user.id)!.toUpperCase().includes(cif)) {
      return false;
    }
    if (citizenId && !user.citizenId.includes(citizenId)) {
      return false;
    }
    if (fullName && !user.fullName.toLowerCase().includes(fullName)) {
      return false;
    }
    if (birthYear && !user.dateOfBirth.startsWith(birthYear)) {
      return false;
    }
    return true;
  });
}

export function parseVnDateInput(value: string): string | null {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) {
    return null;
  }

  const iso = `${match[3]}-${match[2]}-${match[1]}`;
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  if (
    date.getFullYear() !== year
    || date.getMonth() + 1 !== month
    || date.getDate() !== day
  ) {
    return null;
  }

  return iso;
}
