const RUNTIME_BALANCES_KEY = 'ufm:v5:runtime-balances';

type BalanceAdjustments = Record<string, number>;

let adjustmentsCache: BalanceAdjustments | null = null;

function readAdjustmentsFromStorage(): BalanceAdjustments {
  try {
    const raw = sessionStorage.getItem(RUNTIME_BALANCES_KEY);
    if (!raw) {
      return {};
    }
    return JSON.parse(raw) as BalanceAdjustments;
  } catch {
    return {};
  }
}

function writeAdjustments(adjustments: BalanceAdjustments): void {
  sessionStorage.setItem(RUNTIME_BALANCES_KEY, JSON.stringify(adjustments));
  adjustmentsCache = adjustments;
}

function getAdjustments(): BalanceAdjustments {
  if (!adjustmentsCache) {
    adjustmentsCache = readAdjustmentsFromStorage();
  }

  return adjustmentsCache;
}

export function getRuntimeBalanceAdjustment(userId: string): number {
  return getAdjustments()[userId] ?? 0;
}

export function applyRuntimeBalance(baseBalance: number, userId: string): number {
  return Math.max(0, baseBalance + getRuntimeBalanceAdjustment(userId));
}

export function applyTransferBalance(
  sourceUserId: string,
  recipientUserId: string,
  amount: number,
): void {
  if (amount <= 0 || sourceUserId === recipientUserId) {
    return;
  }

  const adjustments = { ...getAdjustments() };
  adjustments[sourceUserId] = (adjustments[sourceUserId] ?? 0) - amount;
  adjustments[recipientUserId] = (adjustments[recipientUserId] ?? 0) + amount;
  writeAdjustments(adjustments);
}

export function clearRuntimeBalances(): void {
  sessionStorage.removeItem(RUNTIME_BALANCES_KEY);
  adjustmentsCache = null;
}
