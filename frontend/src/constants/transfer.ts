export const RECIPIENT_BANKS = [
    {
        id: 'ocb',
        shortName: 'OCB',
        fullName: 'Ngân hàng TMCP Phương Đông',
        accentClass: 'border-orange-500 bg-orange-50',
        logoClass: 'bg-orange-500 text-white',
        logoText: 'OCB',
    },
    {
        id: 'tpbank',
        shortName: 'TPBank',
        fullName: 'Ngân hàng TP Bank',
        accentClass: 'border-border bg-white',
        logoClass: 'bg-red-600 text-white',
        logoText: 'TP',
    },
] as const;
export type RecipientBankId = (typeof RECIPIENT_BANKS)[number]['id'];
export const TRANSFER_STEPS = {
    FORM: 1,
    OTP: 2,
    SUCCESS: 3,
} as const;
export type TransferStep = (typeof TRANSFER_STEPS)[keyof typeof TRANSFER_STEPS];
