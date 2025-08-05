import express, { Request, Response } from 'express';
import { query } from '../config/database';
const router = express.Router();

// Получить все проекты
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM projects ORDER BY created_at ASC');
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка получения проектов' });
  }
});

// Получить проект по ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM projects WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Проект не найден' });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка получения проекта' });
  }
});

// Создать проект
router.post('/', async (req: Request, res: Response) => {
  console.log('POST /api/projects', req.body);
  try {
    const { name, description, gitRepoUrl } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Название проекта обязательно' });
    }
    // Проверка на уникальность имени
    const nameCheck = await query('SELECT id FROM projects WHERE name = $1', [name]);
    if (nameCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Проект с таким именем уже существует' });
    }
    // Проверка на уникальность gitRepoUrl (если указан)
    if (gitRepoUrl) {
      const repoCheck = await query('SELECT id FROM projects WHERE git_repo_url = $1', [gitRepoUrl]);
      if (repoCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Проект с таким репозиторием уже существует' });
      }
    }
    const result = await query(
      'INSERT INTO projects (name, description, git_repo_url, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *',
      [name, description, gitRepoUrl]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка создания проекта' });
  }
});

// Обновить проект
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, gitRepoUrl } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Название проекта обязательно' });
    }
    const result = await query(
      'UPDATE projects SET name = $1, description = $2, git_repo_url = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [name, description, gitRepoUrl, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Проект не найден' });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка обновления проекта' });
  }
});

// Удалить проект
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Проект не найден' });
    }
    return res.json({ message: 'Проект успешно удален' });
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка удаления проекта' });
  }
});

export default router; 