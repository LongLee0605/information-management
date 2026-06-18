// server/db.js
// Connection pool singleton cho SQL Server

import 'dotenv/config';
import sql from 'mssql';

const config = {
  server: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME || 'QLTT',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERT !== 'false',
  },
};

let pool = null;

export async function getPool() {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}

export { sql };
