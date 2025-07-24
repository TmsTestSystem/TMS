import express, { Request, Response } from 'express';
import { query } from '../config/database';

const router = express.Router();

// Получить все разделы проекта (дерево)
router.get('/project/:projectId', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const result = await query(
      'SELECT * FROM test_case_sections WHERE project_id = $1 ORDER BY order_index, id',
      [projectId]
    );
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка получения разделов' });
  }
});

// Получить раздел по id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM test_case_sections WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Раздел не найден' });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка получения раздела' });
  }
});

// Создать раздел
router.post('/', async (req: Request, res: Response) => {
  try {
    const { projectId, parentId, name, orderIndex } = req.body;
    if (!projectId || !name) {
      return res.status(400).json({ error: 'ID проекта и имя обязательны' });
    }
    const result = await query(
      `INSERT INTO test_case_sections (project_id, parent_id, name, order_index, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *`,
      [projectId, parentId || null, name, orderIndex || 0]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка создания раздела' });
  }
});

// Обновить раздел
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, parentId, orderIndex } = req.body;
    const result = await query(
      `UPDATE test_case_sections SET name = $1, parent_id = $2, order_index = $3, updated_at = NOW() WHERE id = $4 RETURNING *`,
      [name, parentId || null, orderIndex || 0, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Раздел не найден' });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка обновления раздела' });
  }
});

// Удалить раздел
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM test_case_sections WHERE id = $1', [id]);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка удаления раздела' });
  }
});

export default router; 