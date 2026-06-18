import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getPool } from './db.js';

import customersRouter    from './routes/customers.js';
import accountsRouter     from './routes/accounts.js';
import transactionsRouter from './routes/transactions.js';
import reportsRouter      from './routes/reports.js';

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

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
app.get('/api/health', (req, res) => {
  req.pool.request().query('SELECT 1')
    .then(() => res.json({ status: 'ok', db: process.env.DB_HOST }))
    .catch((err) => res.status(503).json({ status: 'error', message: err.message }));
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
});
