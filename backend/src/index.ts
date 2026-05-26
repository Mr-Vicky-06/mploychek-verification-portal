import express from 'express';
import cors from 'cors';
import { environment } from './config/environment';
import { connectDatabase } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import verificationRoutes from './routes/verificationRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

const app = express();

/* ──────────────────────────────────────────────
 *  Middleware
 * ────────────────────────────────────────────── */
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ──────────────────────────────────────────────
 *  API Routes
 * ────────────────────────────────────────────── */
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/verifications', verificationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'MPloyChek API is running',
    timestamp: new Date().toISOString(),
    environment: environment.nodeEnv,
  });
});

/* ──────────────────────────────────────────────
 *  Error handling
 * ────────────────────────────────────────────── */
app.use(notFoundHandler);
app.use(errorHandler);

/* ──────────────────────────────────────────────
 *  Server bootstrap
 * ────────────────────────────────────────────── */
const startServer = async () => {
  // Attempt DB connection (falls back to mock data gracefully)
  await connectDatabase();

  app.listen(environment.port, () => {
    console.log(`
╔══════════════════════════════════════════════╗
║   MPloyChek Verification API                 ║
║   Port: ${environment.port}                              ║
║   Env:  ${environment.nodeEnv.padEnd(20)}         ║
╚══════════════════════════════════════════════╝
    `);
  });
};

startServer();
