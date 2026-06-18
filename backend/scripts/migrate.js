import { loadAppEnv } from './load-env.js';
import sql from 'mssql';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
loadAppEnv();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SQL_DIR = path.join(__dirname, '..', 'sql');
const baseConfig = {
    server: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 1433,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERT !== 'false',
        connectTimeout: 30000,
    },
};
function sortByVersion(files) {
    return files.sort((a, b) => {
        const vA = parseInt(a.match(/^V(\d+)/i)?.[1] ?? '0', 10);
        const vB = parseInt(b.match(/^V(\d+)/i)?.[1] ?? '0', 10);
        return vA - vB;
    });
}
async function runScript(pool, filePath) {
    const fileName = path.basename(filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    const batches = content.split(/^\s*GO\s*$/im).filter((b) => b.trim().length > 0);
    for (const batch of batches) {
        await pool.request().query(batch);
    }
    console.log(`  ✓ ${fileName}`);
}
async function migrate() {
    const allFiles = sortByVersion(fs.readdirSync(SQL_DIR).filter((f) => f.endsWith('.sql')));
    console.log(`\nKết nối tới ${baseConfig.server}:${baseConfig.port}...`);
    let pool;
    try {
        pool = await sql.connect({ ...baseConfig, database: 'master' });
        console.log('Kết nối thành công.\n');
        const [v1File, ...rest] = allFiles;
        console.log(`Chạy V1 trên master:`);
        await runScript(pool, path.join(SQL_DIR, v1File));
        await pool.close();
        pool = null;
        const dbName = process.env.DB_NAME || 'QLTT';
        pool = await sql.connect({ ...baseConfig, database: dbName });
        console.log(`\nChạy ${rest.length} scripts trên ${dbName}:\n`);
        for (const file of rest) {
            await runScript(pool, path.join(SQL_DIR, file));
        }
        console.log(`\nHoàn thành migration (${allFiles.length} files).`);
    }
    catch (err) {
        console.error('\nLỗi migration:', err.message);
        process.exit(1);
    }
    finally {
        if (pool)
            await pool.close();
    }
}
migrate();
