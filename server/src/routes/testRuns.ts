import express, { Request, Response } from 'express';
import { query } from '../config/database';
const router = express.Router();

// Получить все тестовые прогоны
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        tr.*,
        tp.name as test_plan_name,
        p.name as project_name,
        u.username as started_by_name,
        COUNT(tr2.id) as total_test_cases,
        COUNT(CASE WHEN tr2.status = 'passed' THEN 1 END) as passed_count,
        COUNT(CASE WHEN tr2.status = 'failed' THEN 1 END) as failed_count,
        COUNT(CASE WHEN tr2.status = 'blocked' THEN 1 END) as blocked_count,
        COUNT(CASE WHEN tr2.status = 'not_run' THEN 1 END) as not_run_count
      FROM test_runs tr
      LEFT JOIN test_plans tp ON tr.test_plan_id = tp.id AND tp.is_deleted = FALSE
      LEFT JOIN projects p ON tp.project_id = p.id
      LEFT JOIN users u ON tr.started_by = u.id
      LEFT JOIN test_results tr2 ON tr.id = tr2.test_run_id
      WHERE tr.is_deleted = FALSE
      GROUP BY tr.id, tp.name, p.name, u.username
      ORDER BY tr.created_at DESC
    `);
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка получения тестовых прогонов' });
  }
});

// Получить тестовые прогоны тест-плана
router.get('/test-plan/:testPlanId', async (req: Request, res: Response) => {
  try {
    const { testPlanId } = req.params;
    const result = await query(`
      SELECT 
        tr.*,
        u.username as started_by_name,
        COUNT(tr2.id) as total_test_cases,
        COUNT(CASE WHEN tr2.status = 'passed' THEN 1 END) as passed_count,
        COUNT(CASE WHEN tr2.status = 'failed' THEN 1 END) as failed_count,
        COUNT(CASE WHEN tr2.status = 'blocked' THEN 1 END) as blocked_count,
        COUNT(CASE WHEN tr2.status = 'not_run' THEN 1 END) as not_run_count
      FROM test_runs tr
      LEFT JOIN users u ON tr.started_by = u.id
      LEFT JOIN test_results tr2 ON tr.id = tr2.test_run_id
      WHERE tr.test_plan_id = $1 AND tr.is_deleted = FALSE
      GROUP BY tr.id, u.username
      ORDER BY tr.created_at DESC
    `, [testPlanId]);
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка получения тестовых прогонов плана' });
  }
});

// Получить тестовый прогон по ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT 
        tr.*,
        tp.name as test_plan_name,
        p.name as project_name,
        u.username as started_by_name
      FROM test_runs tr
      LEFT JOIN test_plans tp ON tr.test_plan_id = tp.id AND tp.is_deleted = FALSE
      LEFT JOIN projects p ON tp.project_id = p.id
      LEFT JOIN users u ON tr.started_by = u.id
      WHERE tr.id = $1 AND tr.is_deleted = FALSE
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Тестовый прогон не найден' });
    }
    
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка получения тестового прогона' });
  }
});

// Создать тестовый прогон
router.post('/', async (req: Request, res: Response) => {
  try {
    const { 
      testPlanId, 
      name, 
      description 
    } = req.body;
    
    if (!testPlanId || !name) {
      return res.status(400).json({ error: 'ID тест-плана и название обязательны' });
    }
    // Проверка уникальности имени для данного тест-плана
    const existing = await query(
      'SELECT id FROM test_runs WHERE test_plan_id = $1 AND name = $2',
      [testPlanId, name]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Тестовый прогон с таким именем уже существует для выбранного тест-плана' });
    }
    console.log('[CREATE TEST RUN] testPlanId:', testPlanId, 'name:', name);
    // Создаем тестовый прогон
    const result = await query(
      `INSERT INTO test_runs (
        test_plan_id, name, description, status, started_by, created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
      [testPlanId, name, description, 'planned', '00000000-0000-0000-0000-000000000001']
    );
    
    const testRun = result.rows[0];
    console.log('[CREATE TEST RUN] created test_run_id:', testRun.id);
    // Получаем все тест-кейсы тест-плана
    const testCasesResult = await query(
      'SELECT id FROM test_cases WHERE test_plan_id = $1',
      [testPlanId]
    );
    console.log('[CREATE TEST RUN] found test_case_ids:', testCasesResult.rows.map(r => r.id));
    // Создаем записи результатов для каждого тест-кейса
    for (const testCase of testCasesResult.rows) {
      console.log('[CREATE TEST RUN] insert test_result:', { test_run_id: testRun.id, test_case_id: testCase.id });
      await query(
        `INSERT INTO test_results (
          test_run_id, test_case_id, status, created_at
        ) VALUES ($1, $2, $3, NOW())`,
        [testRun.id, testCase.id, 'not_run']
      );
    }
    
    return res.status(201).json(testRun);
  } catch (error) {
    console.error('[CREATE TEST RUN] error:', error);
    return res.status(500).json({ error: 'Ошибка создания тестового прогона' });
  }
});

// Обновить тестовый прогон
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
      `UPDATE test_runs 
       SET name = $1, description = $2, status = $3, updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [name, description, status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Тестовый прогон не найден' });
    }
    
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка обновления тестового прогона' });
  }
});

// Удалить тестовый прогон (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      'UPDATE test_runs SET is_deleted = TRUE, deleted_at = NOW() WHERE id = $1 AND is_deleted = FALSE RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Тестовый прогон не найден' });
    }
    
    return res.json({ message: 'Тестовый прогон успешно удален' });
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка удаления тестового прогона' });
  }
});

// Восстановить тестовый прогон (restore)
router.post('/:id/restore', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      'UPDATE test_runs SET is_deleted = FALSE, deleted_at = NULL WHERE id = $1 AND is_deleted = TRUE RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Тестовый прогон не найден или уже восстановлен' });
    }
    
    return res.json({ message: 'Тестовый прогон успешно восстановлен', testRun: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка восстановления тестового прогона' });
  }
});

// Получить результаты тестов прогона
router.get('/:id/results', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT 
        tr.*,
        tc.title as test_case_title,
        tc.description as test_case_description,
        tc.priority as test_case_priority,
        tc.section_id as section_id,
        tc.preconditions as preconditions,
        tc.steps as steps,
        tc.expected_result as expected_result,
        u.username as executed_by_name
      FROM test_results tr
      LEFT JOIN test_cases tc ON tr.test_case_id = tc.id
      LEFT JOIN users u ON tr.executed_by = u.id
      WHERE tr.test_run_id = $1
      ORDER BY tc.id
    `, [id]);
    
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка получения результатов тестов' });
  }
});

// Обновить результат теста
router.put('/:id/results/:testCaseId', async (req: Request, res: Response) => {
  try {
    const { id, testCaseId } = req.params;
    const { 
      status, 
      notes, 
      duration 
    } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Статус обязателен' });
    }
    
    // Если статус меняется на in_progress и executed_at еще не установлен, устанавливаем его
    let executedAt = null;
    if (status === 'in_progress') {
      // Проверяем, есть ли уже executed_at
      const existingResult = await query(
        'SELECT executed_at FROM test_results WHERE test_run_id = $1 AND test_case_id = $2',
        [id, testCaseId]
      );
      
      if (existingResult.rows.length > 0 && !existingResult.rows[0].executed_at) {
        executedAt = new Date();
      }
    }
    
    const result = await query(
      `UPDATE test_results 
       SET status = $1, notes = $2, duration = $3, executed_by = $4, executed_at = COALESCE($5, executed_at)
       WHERE test_run_id = $6 AND test_case_id = $7 RETURNING *`,
      [status, notes, duration, '00000000-0000-0000-0000-000000000001', executedAt, id, testCaseId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Результат теста не найден' });
    }
    
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка обновления результата теста' });
  }
});

// Запустить тестовый прогон
router.post('/:id/start', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      `UPDATE test_runs 
       SET status = 'in_progress', started_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Тестовый прогон не найден' });
    }
    
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка запуска тестового прогона' });
  }
});

// Завершить тестовый прогон
router.post('/:id/complete', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      `UPDATE test_runs 
       SET status = 'completed', completed_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Тестовый прогон не найден' });
    }
    
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка завершения тестового прогона' });
  }
});

export default router; 