import express from 'express';
import cors from 'cors';
import { getAppEnv, isAllowedCorsOrigin, loadAppEnv, parseCorsOrigins, validateBackendEnv, } from '../scripts/load-env.js';
import { getPool } from './db.js';
import customersRouter from './routes/customers.js';
import accountsRouter from './routes/accounts.js';
import transactionsRouter from './routes/transactions.js';
import reportsRouter from './routes/reports.js';
loadAppEnv();
validateBackendEnv();
const app = express();
const PORT = process.env.API_PORT || 3001;
const APP_ENV = getAppEnv();
const corsOrigins = parseCorsOrigins();
app.use(cors({
    origin(origin, callback) {
        if (!origin || isAllowedCorsOrigin(origin)) {
            callback(null, origin ?? true);
            return;
        }
        console.warn(`[CORS] Từ chối origin: ${origin} (thêm vào CORS_ORIGIN trong .env.${APP_ENV})`);
        callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    optionsSuccessStatus: 204,
}));
app.use(express.json());
const apiInfo = {
    name: 'QLTT Backend API',
    version: '1.0',
    env: APP_ENV,
    health: '/api/health',
    endpoints: {
        customers: '/api/customers',
        accounts: '/api/accounts',
        transactions: '/api/transactions',
        reports: '/api/reports',
    },
};
app.get('/', (_req, res) => {
    res.json(apiInfo);
});
app.get('/api', (_req, res) => {
    res.json(apiInfo);
});
app.use(async (req, _res, next) => {
    try {
        req.pool = await getPool();
        next();
    }
    catch (err) {
        next(err);
    }
});
app.get('/api/health', async (req, res) => {
    try {
        await req.pool.request().query('SELECT 1 AS ok');
        res.json({
            status: 'ok',
            env: APP_ENV,
            db: process.env.DB_HOST,
            database: process.env.DB_NAME || 'QLTT',
            port: Number(process.env.DB_PORT) || 1433,
            timestamp: new Date().toISOString(),
        });
    }
    catch (err) {
        res.status(503).json({
            status: 'error',
            env: APP_ENV,
            db: process.env.DB_HOST,
            message: err.message,
            timestamp: new Date().toISOString(),
        });
    }
});
app.use('/api/customers', customersRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/reports', reportsRouter);
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: err.message });
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`[QLTT] API [${APP_ENV}] http://0.0.0.0:${PORT}`);
    console.log(`[QLTT] DB  [${APP_ENV}] ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
    console.log(`[QLTT] CORS allowed: ${corsOrigins.join(', ')} (+ localhost + LAN IP)`);
});
