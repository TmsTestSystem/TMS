"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("./utils/logger");
const database_1 = require("./config/database");
const auth_1 = __importDefault(require("./routes/auth"));
const projects_1 = __importDefault(require("./routes/projects"));
const testCases_1 = __importDefault(require("./routes/testCases"));
const testPlans_1 = __importDefault(require("./routes/testPlans"));
const testRuns_1 = __importDefault(require("./routes/testRuns"));
const checklists_1 = __importDefault(require("./routes/checklists"));
const git_1 = __importDefault(require("./routes/git"));
const testCaseSections_1 = __importDefault(require("./routes/testCaseSections"));
const db_1 = __importDefault(require("./routes/db"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000,
    max: 1000
});
app.use(limiter);
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/uploads', express_1.default.static('uploads'));
app.use('/api/auth', auth_1.default);
app.use('/api/projects', projects_1.default);
app.use('/api/test-cases', testCases_1.default);
app.use('/api/test-plans', testPlans_1.default);
app.use('/api/test-runs', testRuns_1.default);
app.use('/api/checklists', checklists_1.default);
app.use('/api/git', git_1.default);
app.use('/api/test-case-sections', testCaseSections_1.default);
app.use('/api/db', db_1.default);
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
app.use((err, req, res, next) => {
    logger_1.logger.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
async function startServer() {
    try {
        await (0, database_1.connectDB)();
        app.listen(PORT, () => {
            logger_1.logger.info(`🚀 ТМС для СПР сервер запущен на порту ${PORT}`);
            logger_1.logger.info(`📊 Режим: ${process.env.NODE_ENV || 'development'}`);
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка запуска сервера:', error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=server.js.map