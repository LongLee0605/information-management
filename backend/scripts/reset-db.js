import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sql from 'mssql';
import { getAppEnv, getBackendRoot, loadAppEnv } from './load-env.js';

loadAppEnv();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = getBackendRoot();

function getMasterConfig() {
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

async function dropDatabase() {
    const dbName = process.env.DB_NAME || 'QLTT';
    const target = `${process.env.DB_HOST}:${process.env.DB_PORT || 1433}`;
    console.log(`\n▶ Reset DB [${getAppEnv()}]: DROP ${dbName} @ ${target}`);

    let pool;
    try {
        pool = await sql.connect(getMasterConfig());
        const exists = (await pool.request()
            .input('name', sql.NVarChar, dbName)
            .query('SELECT 1 AS ok FROM sys.databases WHERE name = @name')).recordset.length > 0;

        if (!exists) {
            console.log(`  Database ${dbName} chưa tồn tại — bỏ qua DROP, chạy migrate từ đầu.`);
            return;
        }

        await pool.request().query(`
      ALTER DATABASE [${dbName}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
      DROP DATABASE [${dbName}];
    `);
        console.log(`✓ Đã xóa database ${dbName}.`);
    }
    finally {
        if (pool) {
            await pool.close();
        }
    }
}

function runMigrate() {
    return new Promise((resolve, reject) => {
        console.log('\n▶ Chạy migrate từ đầu...\n');
        const child = spawn('node', [path.join(__dirname, 'migrate.js')], {
            cwd: rootDir,
            stdio: 'inherit',
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
            reject(new Error(`migrate thất bại (exit ${code ?? 'unknown'})`));
        });
    });
}

async function main() {
    await dropDatabase();
    await runMigrate();
    console.log('\n✓ db:reset hoàn thành.');
}

main().catch((error) => {
    console.error(`\n✗ ${error.message}`);
    process.exit(1);
});
