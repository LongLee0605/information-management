import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const envPath = path.join(rootDir, '.env');

console.log('');
console.log('='.repeat(56));
console.log('QLTT dependencies installed');
console.log('='.repeat(56));
console.log('Next steps:');
console.log(`  ${fs.existsSync(envPath) ? '1. .env da ton tai' : '1. npm run env:copy'}`);
console.log('  2. Chinh sua .env neu can');
console.log('  3. npm run dev');
