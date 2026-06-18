import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const envPath = path.join(rootDir, '.env');
const examplePath = path.join(rootDir, '.env.example');

function log(message = '') {
  console.log(message);
}

if (!fs.existsSync(examplePath)) {
  console.error('x Khong tim thay .env.example o thu muc goc.');
  process.exit(1);
}

if (fs.existsSync(envPath)) {
  log('i File .env da ton tai, giu nguyen cau hinh hien tai.');
  log(`  ${envPath}`);
  process.exit(0);
}

fs.copyFileSync(examplePath, envPath);
log('✓ Da tao .env tu .env.example');
log(`  ${envPath}`);
log('');
log('Buoc tiep theo: mo .env va cap nhat DB_HOST / DB_PASSWORD neu can.');
