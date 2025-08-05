import express, { Request, Response } from 'express';
import { query } from '../config/database';
const router = express.Router();

// Получить все тест-планы
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        tp.*,
        p.name as project_name,
        u.username as created_by_name
      FROM test_plans tp
      LEFT JOIN projects p ON tp.project_id = p.id
      LEFT JOIN users u ON tp.created_by = u.id
      WHERE tp.is_deleted = FALSE
      ORDER BY tp.created_at ASC
    `);
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка получения тест-планов' });
  }
});

// Получить тест-планы проекта
router.get('/project/:projectId', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const result = await query(`
      SELECT 
        tp.*,
        u.username as created_by_name,
        COUNT(tc.id) as test_cases_count
      FROM test_plans tp
      LEFT JOIN users u ON tp.created_by = u.id
      LEFT JOIN test_cases tc ON tp.id = tc.test_plan_id AND tc.is_deleted = FALSE
      WHERE tp.project_id = $1 AND tp.is_deleted = FALSE
      GROUP BY tp.id, u.username
      ORDER BY tp.created_at ASC
    `, [projectId]);
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка получения тест-планов проекта' });
  }
});

// Получить тест-план по ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT 
        tp.*,
        p.name as project_name,
        u.username as created_by_name
      FROM test_plans tp
      LEFT JOIN projects p ON tp.project_id = p.id
      LEFT JOIN users u ON tp.created_by = u.id
      WHERE tp.id = $1 AND tp.is_deleted = FALSE
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Тест-план не найден' });
    }
    
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка получения тест-плана' });
  }
});

// Создать тест-план
router.post('/', async (req: Request, res: Response) => {
  try {
    const { 
      projectId, 
      name, 
      description, 
      status 
    } = req.body;
    
    if (!projectId || !name) {
      return res.status(400).json({ error: 'ID проекта и название обязательны' });
    }
    
    const result = await query(
      `INSERT INTO test_plans (
        project_id, name, description, status, created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
      [projectId, name, description, status || 'draft', '550e8400-e29b-41d4-a716-446655440000']
    );
    
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка создания тест-плана' });
  }
});

// Обновить тест-план
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      status 
    } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Название обязательно' });
    }
    
    const result = await query(
      `UPDATE test_plans 
       SET name = $1, description = $2, status = $3, updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [name, description, status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Тест-план не найден' });
    }
    
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка обновления тест-плана' });
  }
});

// Удалить тест-план (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      'UPDATE test_plans SET is_deleted = TRUE, deleted_at = NOW() WHERE id = $1 AND is_deleted = FALSE RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Тест-план не найден' });
    }
    
    return res.json({ message: 'Тест-план успешно удален' });
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка удаления тест-плана' });
  }
});

// Восстановить тест-план (restore)
router.post('/:id/restore', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      'UPDATE test_plans SET is_deleted = FALSE, deleted_at = NULL WHERE id = $1 AND is_deleted = TRUE RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Тест-план не найден или уже восстановлен' });
    }
    
    return res.json({ message: 'Тест-план успешно восстановлен', testPlan: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка восстановления тест-плана' });
  }
});

// Получить тест-кейсы тест-плана
    router.get('/:id/test-cases', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      console.log(`[API] Запрос тест-кейсов для плана ${id}`);

      const result = await query(`
        SELECT
          tc.*,
          u.username as assigned_to_name
        FROM test_cases tc
        INNER JOIN test_plan_cases tpc ON tc.id = tpc.test_case_id
        LEFT JOIN users u ON tc.assigned_to = u.id
        WHERE tpc.test_plan_id = $1 AND tc.is_deleted = FALSE
        ORDER BY tc.created_at ASC
      `, [id]);

      console.log(`[API] Найдено ${result.rows.length} тест-кейсов для плана ${id}`);
      return res.json(result.rows);
    } catch (error) {
      console.error(`[API] Ошибка получения тест-кейсов плана ${req.params.id}:`, error);
      return res.status(500).json({ error: 'Ошибка получения тест-кейсов плана' });
    }
  });

  // Добавить тест-кейсы в план
  router.post('/:id/test-cases', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { testCaseIds } = req.body;

      if (!testCaseIds || !Array.isArray(testCaseIds)) {
        return res.status(400).json({ error: 'Список ID тест-кейсов обязателен' });
      }

      console.log(`[API] Добавление ${testCaseIds.length} тест-кейсов в план ${id}`);

      // Добавляем связи в таблицу test_plan_cases
      for (const testCaseId of testCaseIds) {
        await query(`
          INSERT INTO test_plan_cases (test_plan_id, test_case_id)
          VALUES ($1, $2)
          ON CONFLICT (test_plan_id, test_case_id) DO NOTHING
        `, [id, testCaseId]);
      }

      console.log(`[API] Добавлено ${testCaseIds.length} тест-кейсов в план ${id}`);
      return res.status(201).json({ message: 'Тест-кейсы добавлены в план' });
    } catch (error) {
      console.error(`[API] Ошибка добавления тест-кейсов в план ${req.params.id}:`, error);
      return res.status(500).json({ error: 'Ошибка добавления тест-кейсов в план' });
    }
  });

  // Удалить тест-кейс из плана
  router.delete('/:id/test-cases/:testCaseId', async (req: Request, res: Response) => {
    try {
      const { id, testCaseId } = req.params;
      console.log(`[API] Удаление тест-кейса ${testCaseId} из плана ${id}`);

      await query(`
        DELETE FROM test_plan_cases 
        WHERE test_plan_id = $1 AND test_case_id = $2
      `, [id, testCaseId]);

      console.log(`[API] Тест-кейс ${testCaseId} удален из плана ${id}`);
      return res.json({ message: 'Тест-кейс удален из плана' });
    } catch (error) {
      console.error(`[API] Ошибка удаления тест-кейса из плана:`, error);
      return res.status(500).json({ error: 'Ошибка удаления тест-кейса из плана' });
    }
  });

  export default router; 