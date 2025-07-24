import { Pool } from 'pg';
import { logger } from '../utils/logger';

const pool = new Pool({
  host: process.env.DB_HOST || 'tms-postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'tms_spr',
  user: process.env.DB_USER || 'tms_user',
  password: process.env.DB_PASSWORD || 'tms_password',
  ssl: false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const connectDB = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    logger.info('✅ Подключение к базе данных установлено');
    client.release();
  } catch (error) {
    logger.error('❌ Ошибка подключения к базе данных:', error);
    throw error;
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