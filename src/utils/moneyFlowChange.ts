type MoneyFlowChangeListener = () => void;

const listeners = new Set<MoneyFlowChangeListener>();

export function subscribeMoneyFlowChange(listener: MoneyFlowChangeListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyMoneyFlowChange(): void {
  for (const listener of listeners) {
    listener();
  }
}
