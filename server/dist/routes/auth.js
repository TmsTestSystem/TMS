"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const database_1 = require("../config/database");
const router = express_1.default.Router();
router.post('/register', [
    (0, express_validator_1.body)('username').isLength({ min: 3 }).trim().escape(),
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 6 }),
    (0, express_validator_1.body)('firstName').trim().escape(),
    (0, express_validator_1.body)('lastName').trim().escape()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { username, email, password, firstName, lastName } = req.body;
        const existingUser = await (0, database_1.query)('SELECT id FROM users WHERE username = $1 OR email = $2', [username, email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Пользователь уже существует' });
        }
        const saltRounds = 10;
        const passwordHash = await bcryptjs_1.default.hash(password, saltRounds);
        const result = await (0, database_1.query)('INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, first_name, last_name, role', [username, email, passwordHash, firstName, lastName]);
        const user = result.rows[0];
        const token = jsonwebtoken_1.default.sign({ userId: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '24h' });
        res.status(201).json({
            message: 'Пользователь успешно создан',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role
            },
            token
        });
        return;
    }
    catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
        return;
    }
});
router.post('/login', [
    (0, express_validator_1.body)('username').trim().escape(),
    (0, express_validator_1.body)('password').notEmpty()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { username, password } = req.body;
        const result = await (0, database_1.query)('SELECT * FROM users WHERE username = $1 OR email = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Неверные учетные данные' });
        }
        const user = result.rows[0];
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Неверные учетные данные' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '24h' });
        res.json({
            message: 'Успешный вход',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role
            },
            token
        });
        return;
    }
    catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
        return;
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map