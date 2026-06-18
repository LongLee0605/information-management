import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const mode = process.argv[2];
const allowed = ['development', 'production'];
if (!allowed.includes(mode)) {
    console.error('Usage: node scripts/setup-env.js <development|production>');
    process.exit(1);
}
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, `.env.${mode}`);
const example = path.join(root, `.env.${mode}.example`);
if (fs.existsSync(target)) {
    console.log(`Đã có backend/.env.${mode} — không ghi đè.`);
    process.exit(0);
}
if (!fs.existsSync(example)) {
    console.error(`Thiếu backend/.env.${mode}.example`);
    process.exit(1);
}
fs.copyFileSync(example, target);
console.log(`Đã tạo backend/.env.${mode} từ .env.${mode}.example`);
console.log(`Chỉnh file này một lần, sau đó dùng npm run ${mode === 'production' ? 'be:prod' : 'be'}.`);
