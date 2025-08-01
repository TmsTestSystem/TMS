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
        const result = await (0, database_1.query)('SELECT * FROM test_cases WHERE is_deleted = FALSE ORDER BY id DESC');
        return res.json(result.rows);
    }
    catch (error) {
        return res.status(500).json({ error: 'Ошибка получения тест-кейсов' });
    }
});
router.get('/section/:sectionId', async (req, res) => {
    try {
        const { sectionId } = req.params;
        const result = await (0, database_1.query)('SELECT * FROM test_cases WHERE section_id = $1 AND is_deleted = FALSE ORDER BY id DESC', [sectionId]);
        return res.json(result.rows);
    }
    catch (error) {
        return res.status(500).json({ error: 'Ошибка получения тест-кейсов раздела' });
    }
});
router.get('/project/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        console.log(`[API] Запрос тест-кейсов для проекта ${projectId}`);
        const result = await (0, database_1.query)('SELECT * FROM test_cases WHERE project_id = $1 AND is_deleted = FALSE ORDER BY id DESC', [projectId]);
        console.log(`[API] Найдено ${result.rows.length} тест-кейсов для проекта ${projectId}`);
        return res.json(result.rows);
    }
    catch (error) {
        console.error(`[API] Ошибка получения тест-кейсов проекта ${req.params.projectId}:`, error);
        return res.status(500).json({ error: 'Ошибка получения тест-кейсов проекта' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, database_1.query)('SELECT * FROM test_cases WHERE id = $1 AND is_deleted = FALSE', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Тест-кейс не найден' });
        }
        return res.json(result.rows[0]);
    }
    catch (error) {
        return res.status(500).json({ error: 'Ошибка получения тест-кейса' });
    }
});
router.post('/', async (req, res) => {
    try {
        const { projectId, testPlanId, sectionId, title, description, preconditions, steps, expectedResult, priority, status } = req.body;
        const result = await (0, database_1.query)(`INSERT INTO test_cases (
        project_id, test_plan_id, section_id, title, description, preconditions, 
        steps, expected_result, priority, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) RETURNING *`, [projectId, testPlanId, sectionId, title, description, preconditions, steps, expectedResult, priority || 'medium', status || 'draft']);
        return res.status(201).json(result.rows[0]);
    }
    catch (error) {
        return res.status(500).json({ error: 'Ошибка создания тест-кейса' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const currentResult = await (0, database_1.query)('SELECT * FROM test_cases WHERE id = $1', [id]);
        if (currentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Тест-кейс не найден' });
        }
        const current = currentResult.rows[0];
        const { title = current.title, description = current.description, preconditions = current.preconditions, steps = current.steps, expectedResult, expected_result, priority = current.priority, status = current.status, sectionId, section_id, test_plan_id, testPlanId } = req.body;
        const expectedResultFinal = expected_result !== undefined ? expected_result : (expectedResult !== undefined ? expectedResult : current.expected_result);
        const sectionIdToUse = section_id !== undefined ? section_id : (sectionId !== undefined ? sectionId : current.section_id);
        const testPlanIdToUse = test_plan_id !== undefined ? test_plan_id : (testPlanId !== undefined ? testPlanId : current.test_plan_id);
        const result = await (0, database_1.query)(`UPDATE test_cases SET 
        title = $1, description = $2, preconditions = $3, steps = $4, 
        expected_result = $5, priority = $6, status = $7, section_id = $8, test_plan_id = $9, updated_at = NOW() 
       WHERE id = $10 RETURNING *`, [title, description, preconditions, steps, expectedResultFinal, priority, status, sectionIdToUse, testPlanIdToUse, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Тест-кейс не найден' });
        }
        return res.json(result.rows[0]);
    }
    catch (error) {
        return res.status(500).json({ error: 'Ошибка обновления тест-кейса' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, database_1.query)('UPDATE test_cases SET is_deleted = TRUE, deleted_at = NOW() WHERE id = $1 AND is_deleted = FALSE RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Тест-кейс не найден' });
        }
        return res.json({ message: 'Тест-кейс успешно удален' });
    }
    catch (error) {
        return res.status(500).json({ error: 'Ошибка удаления тест-кейса' });
    }
});
router.post('/:id/restore', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, database_1.query)('UPDATE test_cases SET is_deleted = FALSE, deleted_at = NULL WHERE id = $1 AND is_deleted = TRUE RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Тест-кейс не найден или уже восстановлен' });
        }
        return res.json({ message: 'Тест-кейс успешно восстановлен', testCase: result.rows[0] });
    }
    catch (error) {
        return res.status(500).json({ error: 'Ошибка восстановления тест-кейса' });
    }
});
exports.default = router;
//# sourceMappingURL=testCases.js.map