import express from 'express';
import cors from 'cors';
import { getPool } from './db.js';

import customersRouter    from './routes/customers.js';
import accountsRouter     from './routes/accounts.js';
import transactionsRouter from './routes/transactions.js';
import reportsRouter      from './routes/reports.js';

const app = express();
const PORT = process.env.API_PORT || 3001;

const corsOrigins = [
  process.env.CORS_ORIGIN,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (
      corsOrigins.includes(origin)
      || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
    ) {
      callback(null, true);
      return;
    }

    callback(null, false);
  },
}));
app.use(express.json());

const apiInfo = {
  name: 'QLTT Backend API',
  version: '1.0',
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

// Singleton pool middleware — init once, attach to req for all routes
app.use(async (req, _res, next) => {
  try {
    req.pool = await getPool();
    next();
  } catch (err) {
    next(err);
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await req.pool.request().query('SELECT 1 AS ok');
    res.json({
      status: 'ok',
      db: process.env.DB_HOST,
      database: process.env.DB_NAME || 'QLTT',
      port: Number(process.env.DB_PORT) || 1433,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      db: process.env.DB_HOST,
      message: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

app.use('/api/customers',    customersRouter);
app.use('/api/accounts',     accountsRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/reports',      reportsRouter);

// 404
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
  console.log(`DB: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  console.log(`CORS: ${corsOrigins.join(', ') || 'localhost ports'}`);
});
