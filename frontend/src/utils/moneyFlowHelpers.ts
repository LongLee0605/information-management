import { formatDemoDateLabel } from '@/utils/demoDate';

export function formatFlowAmount(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)} Tỷ`;
  }
  if (amount >= 1_000_000) {
    return `${Math.round(amount / 1_000_000)} Triệu`;
  }
  return new Intl.NumberFormat('vi-VN').format(amount);
}

export function formatMoneyFlowPeriodLabel(fromDate: string, toDate: string): string {
  return `${formatDemoDateLabel(fromDate)} – ${formatDemoDateLabel(toDate)}`;
}

export { getCifFromUserId, getUserIdFromCif } from '@/utils/accountRegistry';
