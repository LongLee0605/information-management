import { clsx, type ClassValue } from 'clsx';
import { formatDemoDateLabel } from './demoDate';

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatVndInput(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) {
    return '';
  }

  return new Intl.NumberFormat('vi-VN').format(Number(digits));
}

export function parseVndInput(value: string): number {
  const digits = value.replace(/\D/g, '');
  if (!digits) {
    return 0;
  }

  return Number(digits);
}

export function formatCompactCurrency(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)} tỷ`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)} tr`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}K`;
  }
  return formatCurrency(amount);
}

export function formatDate(dateString: string): string {
  return formatDemoDateLabel(dateString);
}

export function formatMonthLabel(month: string): string {
  const [, monthNum] = month.split('-');
  return `T${monthNum}`;
}

export function formatCitizenId(citizenId: string): string {
  return citizenId.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
}

export function formatGender(gender: 'male' | 'female'): string {
  return gender === 'male' ? 'Nam' : 'Nữ';
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function getAvatarUrl(seed: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

export {
  getAccountByCif,
  getAccountByNumber,
  getAccountByUserId,
  getAllUserAccounts,
  getCifFromUserId,
  getUserIdFromCif,
  formatAccountNumberDisplay,
} from './accountRegistry';
export {
  isDateInRange,
  APP_DATE_RANGE,
} from './demoDate';
export { syncBreakdownWithMonthly, calculateMonthlyIncomeAverage } from './financeSync';

export function enrichColor(hex: string, intensity = 1.25): string {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return hex;

  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);

  const boost = (channel: number) =>
    Math.min(255, Math.round(channel * intensity));

  return `#${boost(r).toString(16).padStart(2, '0')}${boost(g).toString(16).padStart(2, '0')}${boost(b).toString(16).padStart(2, '0')}`;
}
