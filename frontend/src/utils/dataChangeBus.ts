export type DataTopic = 'users' | 'accounts' | 'transactions';

const listeners = new Map<DataTopic, Set<() => void>>();

export function subscribeDataChange(topic: DataTopic, listener: () => void): () => void {
  if (!listeners.has(topic)) {
    listeners.set(topic, new Set());
  }
  listeners.get(topic)!.add(listener);
  return () => {
    listeners.get(topic)?.delete(listener);
  };
}

export function notifyDataChange(topic: DataTopic): void {
  for (const listener of listeners.get(topic) ?? []) {
    listener();
  }
}

export function notifyDataChanges(...topics: DataTopic[]): void {
  for (const topic of topics) {
    notifyDataChange(topic);
  }
}
