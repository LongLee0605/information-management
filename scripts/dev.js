import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const envPath = path.join(rootDir, '.env');

console.log('');
console.log('='.repeat(56));
console.log('QLTT Dev');
console.log('='.repeat(56));
console.log(`Root: ${rootDir}`);
console.log(`Env : ${fs.existsSync(envPath) ? '.env found' : '.env missing'}`);
console.log('Apps: API http://localhost:3001  |  WEB http://localhost:5173');
console.log('');

if (!fs.existsSync(envPath)) {
  console.log('Chua co .env. Chay truoc: npm run env:copy');
  process.exit(1);
}

const child = spawn('npm run dev:services', {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
