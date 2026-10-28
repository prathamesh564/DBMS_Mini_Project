const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Import Routes
const authRoutes = require('./routes/auth.routes');
const womenRoutes = require('./routes/women.routes');
const skillsRoutes = require('./routes/skills.routes');
const trainingRoutes = require('./routes/training.routes');
const enrollmentRoutes = require('./routes/enrollment.routes');
const employersRoutes = require('./routes/employers.routes');
const jobsRoutes = require('./routes/jobs.routes');
const applicationsRoutes = require('./routes/applications.routes');
const interviewsRoutes = require('./routes/interviews.routes');
const certificationsRoutes = require('./routes/certifications.routes');
const employmentRoutes = require('./routes/employment.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Middlewares
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
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
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Women Skill Development & Employment Portal API',
  });
});

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Women Skill Development & Employment Portal Backend API',
    docs: '/api/v1/health',
    version: '1.0.0',
  });
});

// Mount API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/women', womenRoutes);
app.use('/api/v1/skills', skillsRoutes);
app.use('/api/v1/training', trainingRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/employers', employersRoutes);
app.use('/api/v1/jobs', jobsRoutes);
app.use('/api/v1/applications', applicationsRoutes);
app.use('/api/v1/interviews', interviewsRoutes);
app.use('/api/v1/certifications', certificationsRoutes);
app.use('/api/v1/employment', employmentRoutes);
app.use('/api/v1/admin', adminRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' not found on this server.`,
  });
});

// Global Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]:', err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Specific PostgreSQL error code handling
  if (err.code === '23505') {
    // Unique violation
    return res.status(409).json({
      success: false,
      message: 'Conflict: A record with this unique identifier or key already exists.',
      detail: err.detail,
    });
  }

  if (err.code === '23503') {
    // Foreign key violation
    return res.status(400).json({
      success: false,
      message: 'Referential integrity violation: Referenced record does not exist or has active dependencies.',
      detail: err.detail,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;
