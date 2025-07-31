"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../config/database");
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    try {
        const result = await (0, database_1.query)('SELECT * FROM projects ORDER BY id DESC');
        return res.json(result.rows);
    }
    catch (error) {
        return res.status(500).json({ error: 'Ошибка получения проектов' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, database_1.query)('SELECT * FROM projects WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Проект не найден' });
        }
        return res.json(result.rows[0]);
    }
    catch (error) {
        return res.status(500).json({ error: 'Ошибка получения проекта' });
    }
});
router.post('/', async (req, res) => {
    console.log('POST /api/projects', req.body);
    try {
        const { name, description, gitRepoUrl } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Название проекта обязательно' });
        }
        const nameCheck = await (0, database_1.query)('SELECT id FROM projects WHERE name = $1', [name]);
        if (nameCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Проект с таким именем уже существует' });
        }
        if (gitRepoUrl) {
            const repoCheck = await (0, database_1.query)('SELECT id FROM projects WHERE git_repo_url = $1', [gitRepoUrl]);
            if (repoCheck.rows.length > 0) {
                return res.status(400).json({ error: 'Проект с таким репозиторием уже существует' });
            }
        }
        const result = await (0, database_1.query)('INSERT INTO projects (name, description, git_repo_url, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *', [name, description, gitRepoUrl]);
        return res.status(201).json(result.rows[0]);
    }
    catch (error) {
        return res.status(500).json({ error: 'Ошибка создания проекта' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, gitRepoUrl } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Название проекта обязательно' });
        }
        const result = await (0, database_1.query)('UPDATE projects SET name = $1, description = $2, git_repo_url = $3, updated_at = NOW() WHERE id = $4 RETURNING *', [name, description, gitRepoUrl, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Проект не найден' });
        }
        return res.json(result.rows[0]);
    }
    catch (error) {
        return res.status(500).json({ error: 'Ошибка обновления проекта' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, database_1.query)('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Проект не найден' });
        }
        return res.json({ message: 'Проект успешно удален' });
    }
    catch (error) {
        return res.status(500).json({ error: 'Ошибка удаления проекта' });
    }
});
exports.default = router;
//# sourceMappingURL=projects.js.map