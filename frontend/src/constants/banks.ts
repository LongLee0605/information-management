export const CUSTOMER_BANK_OPTIONS = [
    {
        id: 'ocb',
        name: 'OCB',
        badgeClass: 'bg-orange-500 text-white',
    },
    {
        id: 'tpbank',
        name: 'TPBank',
        badgeClass: 'bg-red-600 text-white',
    },
    {
        id: 'vietcombank',
        name: 'Vietcombank',
        badgeClass: 'bg-green-700 text-white',
    },
    {
        id: 'bidv',
        name: 'BIDV',
        badgeClass: 'bg-teal-700 text-white',
    },
    {
        id: 'msb',
        name: 'MSB',
        badgeClass: 'bg-blue-800 text-white',
    },
    {
        id: 'vpbank',
        name: 'VPBank',
        badgeClass: 'bg-green-600 text-white',
    },
] as const;
export type CustomerBankId = (typeof CUSTOMER_BANK_OPTIONS)[number]['id'];
export function getCustomerBankOption(bankId: string) {
    return CUSTOMER_BANK_OPTIONS.find((bank) => bank.id === bankId);
}
