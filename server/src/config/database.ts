import { Pool } from 'pg';
import { logger } from '../utils/logger';

const pool = new Pool({
  host: process.env.DB_HOST || 'tms-postgres',
  port: parseInt(process.env.DB_PORT || '55432'),
  database: process.env.DB_NAME || 'tms',
  user: process.env.DB_USER || 'tms_user',
  password: process.env.DB_PASSWORD || 'tms_password',
  ssl: false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Увеличиваем до 10 секунд
});

export const connectDB = async (): Promise<void> => {
  const maxRetries = 10;
  const retryDelay = 2000; // 2 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const client = await pool.connect();
      logger.info('✅ Подключение к базе данных установлено');
      client.release();
      return;
    } catch (error) {
      logger.warn(`❌ Попытка подключения к БД ${attempt}/${maxRetries} не удалась:`, error);
      
      if (attempt === maxRetries) {
        logger.error('❌ Все попытки подключения к базе данных исчерпаны');
        throw error;
      }
      
      // Ждем перед следующей попыткой
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
};

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Выполнен SQL запрос', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error('Ошибка SQL запроса:', error);
    throw error;
  }
};

export default pool; 