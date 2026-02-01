import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import polRoutes from './routes/pol.routes';
import productionRoutes from './routes/production.routes';
import alertRoutes from './routes/alert.routes';
import reportRoutes from './routes/report.routes';
import logbookRoutes from './routes/logbook.routes';
import revisionRoutes from './routes/revision.routes';
import productRoutes from './routes/product.routes';
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/error.middleware';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(morgan(process.env.LOG_FORMAT || 'dev'));
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/pols', polRoutes);
app.use('/api/v1/production', productionRoutes);
app.use('/api/v1/alerts', alertRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/logbook', logbookRoutes);
app.use('/api/v1/revisions', revisionRoutes);
app.use('/api/v1/products', productRoutes);

// API documentation endpoint
app.get('/api', (_req, res) => {
  res.json({
    success: true,
    data: {
      name: 'ProdGantiNew API',
      version: '1.0.0',
      endpoints: {
        auth: '/api/v1/auth',
        pols: '/api/v1/pols',
        production: '/api/v1/production',
        alerts: '/api/v1/alerts',
        reports: '/api/v1/reports',
        logbook: '/api/v1/logbook',
        revisions: '/api/v1/revisions',
        products: '/api/v1/products',
      },
    },
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║           ProdGantiNew Production Tracking API          ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log(`║  🚀 Server running on port ${PORT}                            ║`);
  console.log(`║  🌐 Environment: ${(process.env.NODE_ENV || 'development').padEnd(27)}║`);
  console.log(`║  📝 API Base URL: http://localhost:${PORT}/api/v1          ║`);
  console.log(`║  🔗 Health Check: http://localhost:${PORT}/api/health      ║`);
  console.log('╚════════════════════════════════════════════════════════╝');
});

export default app;
