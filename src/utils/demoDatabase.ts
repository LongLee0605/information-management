import { reloadMoneyFlowEdgesFromBase } from '@/utils/moneyFlowTraceBuilder';
import { clearRuntimeStore } from '@/utils/transferRuntimeStore';

const DEMO_DB_VERSION_KEY = 'ufm:demo-db-version';
const DEMO_DB_VERSION = '2026-06-07-customers-v2';

export function migrateDemoDatabase(): void {
  if (typeof sessionStorage === 'undefined') {
    return;
  }

  const currentVersion = sessionStorage.getItem(DEMO_DB_VERSION_KEY);
  if (currentVersion === DEMO_DB_VERSION) {
    return;
  }

  clearRuntimeStore();
  reloadMoneyFlowEdgesFromBase();
  sessionStorage.setItem(DEMO_DB_VERSION_KEY, DEMO_DB_VERSION);
}

export function resetDemoDatabase(): void {
  if (typeof sessionStorage === 'undefined') {
    return;
  }

  sessionStorage.removeItem(DEMO_DB_VERSION_KEY);
  migrateDemoDatabase();
}
