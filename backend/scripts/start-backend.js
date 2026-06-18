import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sql from 'mssql';
import { getAppEnv, getBackendRoot, loadAppEnv, resolveEnvPath, } from './load-env.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = getBackendRoot();
const envPath = resolveEnvPath();
const SQL_CONTAINER = 'qltt-sqlserver';
function ensureEnvFile() {
    loadAppEnv();
    if (!fs.existsSync(envPath)) {
        const mode = getAppEnv();
        throw new Error(`Thiếu backend/.env.${mode}. Hãy copy backend/.env.${mode}.example`);
    }
    console.log(`[QLTT] Backend khởi động [${getAppEnv()}]`);
}
function runCommand(command, args, label, { shell } = {}) {
    const useShell = shell ?? false;
    return new Promise((resolve, reject) => {
        console.log(`\n▶ ${label}`);
        const child = spawn(command, args, {
            cwd: rootDir,
            stdio: 'inherit',
            shell: useShell,
            env: {
                ...process.env,
                APP_ENV: getAppEnv(),
            },
        });
        child.on('error', reject);
        child.on('exit', (code) => {
            if (code === 0) {
                resolve();
                return;
            }
            reject(new Error(`${label} thất bại (exit ${code ?? 'unknown'})`));
        });
    });
}
function dockerInspectContainer(name) {
    const result = spawnSync('docker', ['inspect', '-f', '{{.State.Running}}', name], { encoding: 'utf8', shell: process.platform === 'win32' });
    if (result.status !== 0) {
        return null;
    }
    return result.stdout.trim() === 'true';
}
async function ensureDockerSqlServer() {
    console.log('\n▶ Docker: sqlserver');
    const running = dockerInspectContainer(SQL_CONTAINER);
    if (running === true) {
        console.log(`✓ Container ${SQL_CONTAINER} đang chạy (tái sử dụng).`);
        return;
    }
    if (running === false) {
        console.log(`  Container ${SQL_CONTAINER} đã tồn tại — đang khởi động lại...`);
        await runCommand('docker', ['start', SQL_CONTAINER], `Docker: start ${SQL_CONTAINER}`, { shell: true });
        return;
    }
    console.log(`  Tạo container mới qua docker compose...`);
    await runCommand('docker', ['compose', 'up', '-d', 'sqlserver'], 'Docker: create sqlserver', { shell: true });
}
function getDbConfig() {
    return {
        server: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 1433,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: 'master',
        options: {
            encrypt: process.env.DB_ENCRYPT === 'true',
            trustServerCertificate: process.env.DB_TRUST_SERVER_CERT !== 'false',
            connectTimeout: 30000,
        },
    };
}
async function waitForDatabase(maxAttempts = 45) {
    const target = `${process.env.DB_HOST}:${process.env.DB_PORT || 1433}`;
    console.log(`\n⏳ Đợi SQL Server sẵn sàng tại ${target}...`);
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        let pool;
        try {
            pool = await sql.connect(getDbConfig());
            await pool.request().query('SELECT 1');
            console.log('✓ SQL Server đã sẵn sàng.');
            return;
        }
        catch {
            process.stdout.write(`  thử ${attempt}/${maxAttempts}...\r`);
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }
        finally {
            if (pool) {
                await pool.close();
            }
        }
    }
    throw new Error('SQL Server chưa sẵn sàng. Kiểm tra Docker Desktop đang chạy và mật khẩu DB_PASSWORD trong .env.');
}
async function isApiHealthy(port) {
    try {
        const response = await fetch(`http://localhost:${port}/api/health`, {
            signal: AbortSignal.timeout(2000),
        });
        return response.ok;
    }
    catch {
        return false;
    }
}
function isLocalDatabase() {
    const host = (process.env.DB_HOST || '').toLowerCase();
    return !host || host === 'localhost' || host === '127.0.0.1';
}
function killProcessOnPort(port) {
    if (process.platform === 'win32') {
        const result = spawnSync('netstat', ['-ano'], { encoding: 'utf8', shell: true });
        const pids = new Set();
        for (const line of result.stdout.split('\n')) {
            if (!line.includes('LISTENING') || !line.includes(`:${port}`)) {
                continue;
            }
            const pid = line.trim().split(/\s+/).at(-1);
            if (pid && /^\d+$/.test(pid) && pid !== '0') {
                pids.add(pid);
            }
        }
        for (const pid of pids) {
            console.log(`  Dừng process cũ trên :${port} (PID ${pid})...`);
            spawnSync('taskkill', ['/PID', pid, '/F'], { stdio: 'inherit', shell: true });
        }
        return;
    }
    const result = spawnSync('lsof', ['-ti', `tcp:${port}`, '-sTCP:LISTEN'], { encoding: 'utf8' });
    for (const pid of result.stdout.split('\n').map((v) => v.trim()).filter(Boolean)) {
        console.log(`  Dừng process cũ trên :${port} (PID ${pid})...`);
        spawnSync('kill', ['-9', pid], { stdio: 'inherit' });
    }
}
async function ensureFreshApiServer(port) {
    const reuse = process.env.BE_REUSE_API === '1' || process.env.BE_REUSE_API === 'true';
    if (await isApiHealthy(port)) {
        if (reuse) {
            console.log(`\n✓ API đã chạy tại http://localhost:${port} (BE_REUSE_API — giữ process cũ).`);
            return false;
        }
        console.log(`\n✓ API đã chạy tại http://localhost:${port} — đang khởi động lại để nạp code mới...`);
    }
    killProcessOnPort(port);
    for (let i = 0; i < 10; i += 1) {
        if (!(await isApiHealthy(port))) {
            break;
        }
        await new Promise((resolve) => setTimeout(resolve, 300));
    }
    return true;
}
async function startApiServer() {
    const port = Number(process.env.API_PORT) || 3001;
    const shouldStart = await ensureFreshApiServer(port);
    if (!shouldStart) {
        console.log('  Dùng npm run check:api để kiểm tra.');
        return;
    }
    console.log(`\n▶ Khởi động API server [${getAppEnv()}] tại http://localhost:${port} (Ctrl+C để dừng)`);
    const child = spawn('node', ['server/index.js'], {
        cwd: rootDir,
        stdio: 'inherit',
        shell: false,
        env: {
            ...process.env,
            APP_ENV: getAppEnv(),
        },
    });
    child.on('exit', (code) => {
        process.exit(code ?? 0);
    });
}
async function main() {
    ensureEnvFile();
    if (isLocalDatabase()) {
        await ensureDockerSqlServer();
    }
    else {
        console.log(`\n▶ DB remote: ${process.env.DB_HOST} — bỏ qua Docker local.`);
    }
    await waitForDatabase();
    await runCommand('node', ['scripts/migrate.js'], `Database migration [${getAppEnv()}]`, { shell: false });
    await startApiServer();
}
main().catch((error) => {
    console.error(`\n✗ ${error.message}`);
    process.exit(1);
});
