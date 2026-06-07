import type { MonthlyFinance, UserFinance } from '@/types';
import type { PaymentMethod, Transaction } from '@/types/transaction';
import { getAccountByUserId, getCifFromUserId } from '@/utils/accountRegistry';
import { distributeDemoDates, getDemoToday } from '@/utils/demoDate';
import { expandMonthlyToAppYears, syncBreakdownWithMonthly } from '@/utils/financeSync';
import { getMoneyFlowEdges, type MoneyFlowEdge } from '@/utils/moneyFlowTraceBuilder';

const PAYMENT_METHODS: PaymentMethod[] = [
  'NAPAS',
  'Deposit',
  'Wire Transfer',
  'Chuyển khoản',
  'Tiền mặt',
];

function pickMethod(seed: number): PaymentMethod {
  return PAYMENT_METHODS[seed % PAYMENT_METHODS.length] ?? 'NAPAS';
}

function splitAmount(total: number, count: number): number[] {
  if (count <= 1) {
    return [total];
  }

  const base = Math.floor(total / count);
  const amounts = Array.from({ length: count }, () => base);
  amounts[amounts.length - 1] = total - base * (count - 1);
  return amounts;
}

function distributeDates(dateFrom: string, dateTo: string, count: number): string[] {
  return distributeDemoDates(dateFrom, dateTo, count);
}

function buildMonthlyTransactions(
  userId: string,
  cif: string,
  monthly: MonthlyFinance[],
  breakdown: UserFinance['breakdown'],
  counter: { value: number },
): Transaction[] {
  const syncedBreakdown = syncBreakdownWithMonthly(breakdown, monthly);
  const incomeSources = syncedBreakdown.filter((item) => item.type === 'income');
  const expenseSources = syncedBreakdown.filter((item) => item.type === 'expense');
  const transactions: Transaction[] = [];
  const today = getDemoToday();
  const todayMonth = today.slice(0, 7);

  for (const monthItem of monthly) {
    if (monthItem.month > todayMonth) {
      continue;
    }

    const monthLabel = monthItem.month.slice(5);
    const incomeDate = `${monthItem.month}-05`;
    const expenseDate = `${monthItem.month}-15`;

    if (monthItem.income > 0 && incomeDate <= today) {
      transactions.push({
        id: `${cif}-TXN${String(counter.value++).padStart(4, '0')}`,
        userId,
        date: incomeDate,
        type: 'credit',
        amount: monthItem.income,
        description: `Tổng thu nhập tháng ${monthLabel}`,
        category: incomeSources[0]?.source ?? 'Thu nhập',
        method: pickMethod(counter.value),
      });
    }

    if (monthItem.expense > 0 && expenseDate <= today) {
      transactions.push({
        id: `${cif}-TXN${String(counter.value++).padStart(4, '0')}`,
        userId,
        date: expenseDate,
        type: 'debit',
        amount: monthItem.expense,
        description: `Tổng chi tiêu tháng ${monthLabel}`,
        category: expenseSources[0]?.source ?? 'Chi tiêu',
        method: pickMethod(counter.value + 1),
      });
    }
  }

  return transactions;
}

function buildEdgeTransactions(
  userId: string,
  cif: string,
  edge: MoneyFlowEdge,
  role: 'debit' | 'credit',
  counter: { value: number },
): Transaction[] {
  const fromAccount = getAccountByUserId(edge.fromUserId);
  const toAccount = getAccountByUserId(edge.toUserId);

  if (!fromAccount || !toAccount) {
    return [];
  }

  const today = getDemoToday();
  if (edge.dateFrom > today) {
    return [];
  }

  const effectiveDateTo = edge.dateTo > today ? today : edge.dateTo;
  const amounts = splitAmount(edge.amount, edge.transactionCount);
  const dates = distributeDates(edge.dateFrom, effectiveDateTo, edge.transactionCount);
  const transactions: Transaction[] = [];

  for (let index = 0; index < edge.transactionCount; index += 1) {
    const date = dates[index] ?? edge.dateFrom;
    if (date > today) {
      continue;
    }

    const isDebit = role === 'debit';
    transactions.push({
      id: `${cif}-TR${String(counter.value++).padStart(4, '0')}`,
      userId,
      date,
      type: role,
      amount: amounts[index] ?? edge.amount,
      description: isDebit
        ? `Chuyển khoản đến ${toAccount.fullName} (${toAccount.accountNumber})`
        : `Nhận chuyển khoản từ ${fromAccount.fullName} (${fromAccount.accountNumber})`,
      category: 'Chuyển khoản',
      method: 'Chuyển khoản',
    });
  }

  return transactions;
}

function buildFlowTransactions(userId: string, cif: string, counter: { value: number }): Transaction[] {
  const transactions: Transaction[] = [];

  for (const edge of getMoneyFlowEdges()) {
    if (edge.traceDepth === 'leaf') {
      continue;
    }

    if (edge.fromUserId === userId) {
      transactions.push(...buildEdgeTransactions(userId, cif, edge, 'debit', counter));
    }

    if (edge.toUserId === userId) {
      transactions.push(...buildEdgeTransactions(userId, cif, edge, 'credit', counter));
    }
  }

  return transactions;
}

export function generateTransactionsFromFinance(
  userId: string,
  finance: UserFinance,
): Transaction[] {
  const cif = getCifFromUserId(userId);
  const counter = { value: 1 };

  const transactions = [
    ...buildMonthlyTransactions(
      userId,
      cif,
      expandMonthlyToAppYears(finance.monthly),
      finance.breakdown,
      counter,
    ),
    ...buildFlowTransactions(userId, cif, counter),
  ];

  return transactions
    .filter((transaction) => transaction.date <= getDemoToday())
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}
