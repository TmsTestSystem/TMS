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
        const result = await (0, database_1.query)(`
      SELECT 
        tp.*,
        p.name as project_name,
        u.username as created_by_name
      FROM test_plans tp
      LEFT JOIN projects p ON tp.project_id = p.id
      LEFT JOIN users u ON tp.created_by = u.id
      ORDER BY tp.created_at DESC
    `);
        return res.json(result.rows);
    }
    catch (error) {
        return res.status(500).json({ error: 'Ошибка получения тест-планов' });
    }
});
router.get('/project/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const result = await (0, database_1.query)(`
      SELECT 
        tp.*,
        u.username as created_by_name,
        COUNT(tc.id) as test_cases_count
      FROM test_plans tp
      LEFT JOIN users u ON tp.created_by = u.id
      LEFT JOIN test_cases tc ON tp.id = tc.test_plan_id
      WHERE tp.project_id = $1
      GROUP BY tp.id, u.username
      ORDER BY tp.created_at DESC
    `, [projectId]);
        return res.json(result.rows);
    }
    catch (error) {
        return res.status(500).json({ error: 'Ошибка получения тест-планов проекта' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, database_1.query)(`
      SELECT 
        tp.*,
        p.name as project_name,
        u.username as created_by_name
      FROM test_plans tp
      LEFT JOIN projects p ON tp.project_id = p.id
      LEFT JOIN users u ON tp.created_by = u.id
      WHERE tp.id = $1
    `, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Тест-план не найден' });
        }
        return res.json(result.rows[0]);
    }
    catch (error) {
        return res.status(500).json({ error: 'Ошибка получения тест-плана' });
    }
});
router.post('/', async (req, res) => {
    try {
        const { projectId, name, description, status } = req.body;
        if (!projectId || !name) {
            return res.status(400).json({ error: 'ID проекта и название обязательны' });
        }
        const result = await (0, database_1.query)(`INSERT INTO test_plans (
        project_id, name, description, status, created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`, [projectId, name, description, status || 'draft', '00000000-0000-0000-0000-000000000001']);
        return res.status(201).json(result.rows[0]);
    }
    catch (error) {
        return res.status(500).json({ error: 'Ошибка создания тест-плана' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, status } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Название обязательно' });
        }
        const result = await (0, database_1.query)(`UPDATE test_plans 
       SET name = $1, description = $2, status = $3, updated_at = NOW()
       WHERE id = $4 RETURNING *`, [name, description, status, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Тест-план не найден' });
        }
        return res.json(result.rows[0]);
    }
    catch (error) {
        return res.status(500).json({ error: 'Ошибка обновления тест-плана' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, database_1.query)('DELETE FROM test_plans WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Тест-план не найден' });
        }
        return res.json({ message: 'Тест-план успешно удален' });
    }
    catch (error) {
        return res.status(500).json({ error: 'Ошибка удаления тест-плана' });
    }
});
router.get('/:id/test-cases', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, database_1.query)(`
      SELECT 
        tc.*,
        u.username as assigned_to_name
      FROM test_cases tc
      LEFT JOIN users u ON tc.assigned_to = u.id
      WHERE tc.test_plan_id = $1
      ORDER BY tc.id DESC
    `, [id]);
        return res.json(result.rows);
    }
    catch (error) {
        return res.status(500).json({ error: 'Ошибка получения тест-кейсов плана' });
    }
});
exports.default = router;
//# sourceMappingURL=testPlans.js.map