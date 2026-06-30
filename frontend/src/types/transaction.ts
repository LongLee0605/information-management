export type TransactionType = 'credit' | 'debit';
export type PaymentMethod = 'NAPAS' | 'Deposit' | 'Wire Transfer' | 'Chuyển khoản' | 'Tiền mặt';
export interface Transaction {
    id: string;
    userId: string;
    date: string;
    type: TransactionType;
    typeLabel?: string;
    amount: number;
    description: string;
    category: string;
    method: PaymentMethod;
}
export interface TransactionWithUser extends Transaction {
    userFullName: string;
}
