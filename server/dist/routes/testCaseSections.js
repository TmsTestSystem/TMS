"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../config/database");
const router = express_1.default.Router();
router.get('/project/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const result = await (0, database_1.query)('SELECT * FROM test_case_sections WHERE project_id = $1 ORDER BY order_index, id', [projectId]);
        return res.json(result.rows);
    }
    catch (error) {
        return res.status(500).json({ error: 'Ошибка получения разделов' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, database_1.query)('SELECT * FROM test_case_sections WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Раздел не найден' });
        }
        return res.json(result.rows[0]);
    }
    catch (error) {
        return res.status(500).json({ error: 'Ошибка получения раздела' });
    }
});
router.post('/', async (req, res) => {
    try {
        const { projectId, parentId, name, orderIndex } = req.body;
        if (!projectId || !name) {
            return res.status(400).json({ error: 'ID проекта и имя обязательны' });
        }
        const result = await (0, database_1.query)(`INSERT INTO test_case_sections (project_id, parent_id, name, order_index, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *`, [projectId, parentId || null, name, orderIndex || 0]);
        return res.status(201).json(result.rows[0]);
    }
    catch (error) {
        return res.status(500).json({ error: 'Ошибка создания раздела' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, parentId, orderIndex } = req.body;
        const result = await (0, database_1.query)(`UPDATE test_case_sections SET name = $1, parent_id = $2, order_index = $3, updated_at = NOW() WHERE id = $4 RETURNING *`, [name, parentId || null, orderIndex || 0, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Раздел не найден' });
        }
        return res.json(result.rows[0]);
    }
    catch (error) {
        return res.status(500).json({ error: 'Ошибка обновления раздела' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await (0, database_1.query)('DELETE FROM test_case_sections WHERE id = $1', [id]);
        return res.json({ success: true });
    }
    catch (error) {
        return res.status(500).json({ error: 'Ошибка удаления раздела' });
    }
});
exports.default = router;
//# sourceMappingURL=testCaseSections.js.map