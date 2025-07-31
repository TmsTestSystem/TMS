"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.connectDB = void 0;
const pg_1 = require("pg");
const logger_1 = require("../utils/logger");
const pool = new pg_1.Pool({
    host: process.env.DB_HOST || 'tms-postgres',
    port: parseInt(process.env.DB_PORT || '55432'),
    database: process.env.DB_NAME || 'tms',
    user: process.env.DB_USER || 'tms_user',
    password: process.env.DB_PASSWORD || 'tms_password',
    ssl: false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});
const connectDB = async () => {
    const maxRetries = 10;
    const retryDelay = 2000;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const client = await pool.connect();
            logger_1.logger.info('✅ Подключение к базе данных установлено');
            client.release();
            return;
        }
        catch (error) {
            logger_1.logger.warn(`❌ Попытка подключения к БД ${attempt}/${maxRetries} не удалась:`, error);
            if (attempt === maxRetries) {
                logger_1.logger.error('❌ Все попытки подключения к базе данных исчерпаны');
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }
};
exports.connectDB = connectDB;
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        logger_1.logger.debug('Выполнен SQL запрос', { text, duration, rows: res.rowCount });
        return res;
    }
    catch (error) {
        logger_1.logger.error('Ошибка SQL запроса:', error);
        throw error;
    }
};
exports.query = query;
exports.default = pool;
//# sourceMappingURL=database.js.map