import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REQUIRED_KEYS = ['DB_HOST', 'DB_USER', 'DB_PASSWORD'];
export function getBackendRoot() {
    return path.resolve(__dirname, '..');
}
export function getAppEnv() {
    return process.env.APP_ENV === 'production' ? 'production' : 'development';
}
export function resolveEnvPath() {
    const root = getBackendRoot();
    const mode = getAppEnv();
    const modeFile = path.join(root, `.env.${mode}`);
    const legacyFile = path.join(root, '.env');
    if (fs.existsSync(modeFile))
        return modeFile;
    if (fs.existsSync(legacyFile))
        return legacyFile;
    return modeFile;
}
export function loadAppEnv() {
    const root = getBackendRoot();
    const mode = getAppEnv();
    const envPath = resolveEnvPath();
    const examplePath = path.join(root, `.env.${mode}.example`);
    if (!fs.existsSync(envPath) && fs.existsSync(examplePath)) {
        fs.copyFileSync(examplePath, envPath);
        console.log(`Đã tạo backend/.env.${mode} từ .env.${mode}.example`);
    }
    const result = dotenv.config({ path: envPath });
    if (result.error && !fs.existsSync(envPath)) {
        throw new Error(`Thiếu backend/.env.${mode}. Hãy copy backend/.env.${mode}.example`);
    }
    if (fs.existsSync(envPath)) {
        console.log(`Env [${mode}]: ${path.basename(envPath)}`);
    }
    return envPath;
}
export function validateBackendEnv() {
    const missing = REQUIRED_KEYS.filter((key) => !process.env[key]?.trim());
    if (missing.length > 0) {
        throw new Error(`Thiếu biến môi trường [${getAppEnv()}]: ${missing.join(', ')}`);
    }
}
export function parseCorsOrigins() {
    const fromEnv = (process.env.CORS_ORIGIN ?? '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
    const devDefaults = getAppEnv() === 'development'
        ? ['http://localhost:5173', 'http://127.0.0.1:5173']
        : [];
    return [...new Set([...fromEnv, ...devDefaults])];
}
function getTrustedHostnames() {
    const hostnames = new Set((process.env.CORS_ORIGIN_HOSTS ?? '')
        .split(',')
        .map((host) => host.trim().toLowerCase())
        .filter(Boolean));
    const dbHost = process.env.DB_HOST?.trim().toLowerCase();
    if (dbHost && dbHost !== 'localhost' && dbHost !== '127.0.0.1') {
        hostnames.add(dbHost);
    }
    for (const origin of parseCorsOrigins()) {
        try {
            hostnames.add(new URL(origin).hostname.toLowerCase());
        }
        catch {
        }
    }
    return hostnames;
}
export function isAllowedCorsOrigin(origin) {
    if (!origin)
        return true;
    if (parseCorsOrigins().includes(origin))
        return true;
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))
        return true;
    if (/^https?:\/\/(\d{1,3}\.){3}\d{1,3}(:\d+)?$/.test(origin))
        return true;
    try {
        const { hostname } = new URL(origin);
        if (getTrustedHostnames().has(hostname.toLowerCase()))
            return true;
    }
    catch {
    }
    return false;
}
