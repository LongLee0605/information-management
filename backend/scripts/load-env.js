import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getBackendRoot() {
  return path.resolve(__dirname, '..');
}

export function resolveEnvPath() {
  return path.join(getBackendRoot(), '.env');
}

export function loadAppEnv() {
  const envPath = resolveEnvPath();
  const examplePath = path.join(getBackendRoot(), '.env.example');

  if (!fs.existsSync(envPath) && fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, envPath);
    console.log(`Đã tạo backend/.env từ .env.example`);
  }

  const result = dotenv.config({ path: envPath });
  if (result.error && !fs.existsSync(envPath)) {
    throw new Error(
      'Thiếu file backend/.env. Hãy copy backend/.env.example thành backend/.env.',
    );
  }

  return envPath;
}
