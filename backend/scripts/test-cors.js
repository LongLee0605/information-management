// scripts/test-cors.js — Kiểm tra CORS preflight (production origins)
// Usage: npm run test:cors

import { getAppEnv, loadAppEnv } from './load-env.js';

loadAppEnv();

const PORT = process.env.API_PORT || 3001;
const BASE = `http://localhost:${PORT}`;
const mode = getAppEnv();

const testOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://157.10.198.41:5173',
  'http://evil.example.com:5173',
];

async function testOrigin(origin) {
  const response = await fetch(`${BASE}/api/health`, {
    method: 'OPTIONS',
    headers: {
      Origin: origin,
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'Content-Type',
    },
  });

  const allowOrigin = response.headers.get('access-control-allow-origin');
  const allowed = allowOrigin === origin || (origin && allowOrigin === origin);

  return {
    origin,
    status: response.status,
    allowOrigin,
    allowed: Boolean(allowOrigin) && (allowOrigin === '*' || allowOrigin === origin),
  };
}

async function main() {
  console.log(`\nCORS preflight [${mode}] → ${BASE}\n`);

  let failed = 0;

  for (const origin of testOrigins) {
    try {
      const result = await testOrigin(origin);
      const expectAllow = origin !== 'http://evil.example.com:5173';
      const ok = result.allowed === expectAllow;
      const icon = ok ? '✓' : '✗';

      console.log(`${icon} ${origin}`);
      console.log(`  Allow-Origin: ${result.allowOrigin ?? '(none)'}\n`);

      if (!ok) failed += 1;
    } catch (error) {
      console.log(`✗ ${origin}`);
      console.log(`  ${error instanceof Error ? error.message : error}\n`);
      failed += 1;
    }
  }

  if (failed > 0) {
    console.error(`CORS test thất bại: ${failed}/${testOrigins.length}`);
    process.exit(1);
  }

  console.log('CORS hoạt động đúng.');
}

main();
