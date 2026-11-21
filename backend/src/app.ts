import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// Import Routes for the 8 Core Tables & 3 User Roles
import authRoutes from './routes/auth.routes';
import womenRoutes from './routes/women.routes';
import skillsRoutes from './routes/skills.routes';
import trainingRoutes from './routes/training.routes';
import enrollmentRoutes from './routes/enrollment.routes';
import jobsRoutes from './routes/jobs.routes';
import applicationsRoutes from './routes/applications.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

// Middlewares
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in development
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger (Development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Health Check
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'EmpowerHer Skills Portal API (Simplified 8-Table Architecture)',
  });
});

// Root Welcome Endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to EmpowerHer Skills Portal API',
    docs: '/api/v1/health',
    version: '2.0.0',
    tables: 8,
    roles: ['woman', 'training_provider', 'admin'],
  });
});

// Mount API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/women', womenRoutes);
app.use('/api/v1/skills', skillsRoutes);
app.use('/api/v1/training', trainingRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/jobs', jobsRoutes);
app.use('/api/v1/applications', applicationsRoutes);
app.use('/api/v1/admin', adminRoutes);

// 404 Route Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' not found on this server.`,
  });
});

// Global Centralized Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Unhandled Error]:', err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Specific PostgreSQL error code handling
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'Conflict: A record with this unique attribute already exists.',
      detail: err.detail,
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Foreign key constraint violation: referenced entity does not exist.',
      detail: err.detail,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
});

export default app;
