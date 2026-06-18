import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const envPath = path.join(rootDir, '.env');

console.log('');
console.log('='.repeat(56));
console.log('QLTT Setup');
console.log('='.repeat(56));

if (!fs.existsSync(envPath)) {
  const result = spawnSync(process.execPath, ['scripts/copy-env.js'], {
    cwd: rootDir,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
} else {
  console.log('✓ .env da san sang');
}

console.log('');
console.log('Lenh thuong dung:');
console.log('  npm run dev        Chay ca backend + frontend');
console.log('  npm run be         Chay rieng backend');
console.log('  npm run fe         Chay rieng frontend');
console.log('  npm run verify:db  Kiem tra SQL va API');
console.log('');
console.log('Neu dung SQL host UIT, hay cap nhat .env truoc khi chay.');
