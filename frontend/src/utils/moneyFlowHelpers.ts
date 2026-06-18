import { formatDemoDateLabel } from '@/utils/demoDate';
export function formatFlowAmount(amount: number): string {
    if (amount >= 1000000000) {
        return `${(amount / 1000000000).toFixed(1)} Tỷ`;
    }
    if (amount >= 1000000) {
        return `${Math.round(amount / 1000000)} Triệu`;
    }
    return new Intl.NumberFormat('vi-VN').format(amount);
}
export function formatMoneyFlowPeriodLabel(fromDate: string, toDate: string): string {
    return `${formatDemoDateLabel(fromDate)} – ${formatDemoDateLabel(toDate)}`;
}
export { getCifFromUserId, getUserIdFromCif } from '@/utils/accountRegistry';
