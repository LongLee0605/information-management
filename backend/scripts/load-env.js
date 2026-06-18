// Tải .env từ thư mục gốc monorepo (ưu tiên), fallback backend/.env
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getBackendRoot() {
  return path.resolve(__dirname, '..');
}

export function getMonorepoRoot() {
  return path.resolve(__dirname, '../..');
}

export function resolveEnvPath() {
  const candidates = [
    path.join(getMonorepoRoot(), '.env'),
    path.join(getBackendRoot(), '.env'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return path.join(getMonorepoRoot(), '.env');
}

export function loadAppEnv() {
  const envPath = resolveEnvPath();
  const examplePath = path.join(getMonorepoRoot(), '.env.example');

  if (!fs.existsSync(envPath) && fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, envPath);
    console.log(`Đã tạo .env từ .env.example tại ${envPath}`);
  }

  const result = dotenv.config({ path: envPath });
  if (result.error && !fs.existsSync(envPath)) {
    throw new Error(
      `Thiếu file .env. Hãy copy .env.example thành .env tại thư mục gốc project.`,
    );
  }

  return envPath;
}
