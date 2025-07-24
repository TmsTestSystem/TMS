import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { connectDB } from './config/database';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import testCaseRoutes from './routes/testCases';
import testPlanRoutes from './routes/testPlans';
import testRunRoutes from './routes/testRuns';
import checklistRoutes from './routes/checklists';
import gitRoutes from './routes/git';
import testCaseSectionRoutes from './routes/testCaseSections';
import dbRoutes from './routes/db';

dotenv.config();

const app = express();
app.set('trust proxy', 1); // Доверять первому прокси (nginx)
const PORT = process.env.PORT || 5000;

// Middleware безопасности
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 минут
  max: 1000 // максимум 1000 запросов с одного IP
});
app.use(limiter);

// Middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Статические файлы
app.use('/uploads', express.static('uploads'));

// Маршруты API
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/test-cases', testCaseRoutes);
app.use('/api/test-plans', testPlanRoutes);
app.use('/api/test-runs', testRunRoutes);
app.use('/api/checklists', checklistRoutes);
app.use('/api/git', gitRoutes);
app.use('/api/test-case-sections', testCaseSectionRoutes);
app.use('/api/db', dbRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Обработка ошибок
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`🚀 ТМС для СПР сервер запущен на порту ${PORT}`);
      logger.info(`📊 Режим: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Ошибка запуска сервера:', error);
    process.exit(1);
  }
}

startServer(); 