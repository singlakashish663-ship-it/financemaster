const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');

const app = express();

// ---- Security headers ----
app.use(helmet({
  contentSecurityPolicy: false, // Allow Vite dev server assets
}));

// ---- CORS ----
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'https://client-taupe-five-76.vercel.app',
  /\.vercel\.app$/,  // Allow all Vercel deployments
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') return allowed === origin;
      if (allowed instanceof RegExp) return allowed.test(origin);
      return false;
    });
    if (isAllowed) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ---- Rate limiting ----
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX || '200'),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});
app.use('/api', limiter);

// Stricter limit on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many authentication attempts. Please try again later.' },
});

// ---- Body parsing ----
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ---- Logging ----
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (msg) => logger.http(msg.trim()) },
  }));
}

// ---- Health check ----
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// ---- API routes ----
const v1 = require('./routes/v1');
app.use('/api/v1', v1);

// ---- 404 handler ----
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// ---- Error handler ----
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const isDev = process.env.NODE_ENV === 'development';

  logger.error({
    message: err.message,
    stack: isDev ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  res.status(status).json({
    error: status < 500 ? err.message : 'An internal error occurred.',
    ...(isDev && { stack: err.stack }),
  });
});

module.exports = app;
