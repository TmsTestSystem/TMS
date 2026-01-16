import express, { Request, Response } from 'express';
import { simpleGit, SimpleGit } from 'simple-git';
import path from 'path';
import fs from 'fs';
import { query } from '../config/database';
import { logger } from '../utils/logger';

const router = express.Router();

// Функция для выполнения операций с таймаутом
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, operation: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Timeout: операция ${operation} превысила лимит времени ${timeoutMs}ms`));
      }, timeoutMs);
    })
  ]);
}

// Получить статус Git репозитория
router.get('/status', async (req: Request, res: Response) => {
  try {
    const repoPath = req.query.path as string || process.env.GIT_REPO_PATH || './git-repos';
    const git: SimpleGit = simpleGit(repoPath);
    
    const status = await git.status();
    
    res.json({
      success: true,
      data: {
        current: status.current,
        tracking: status.tracking,
        ahead: status.ahead,
        behind: status.behind,
        modified: status.modified,
        created: status.created,
        deleted: status.deleted,
        renamed: status.renamed
      }
    });
  } catch (error) {
    console.error('Git status error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка получения статуса Git' 
    });
  }
});

// Клонировать репозиторий
router.post('/clone', async (req: Request, res: Response) => {
  try {
    const { url, branch = 'main' } = req.body;
    const repoPath = process.env.GIT_REPO_PATH || './git-repos';
    
    if (!url) {
      return res.status(400).json({ 
        success: false, 
        error: 'URL репозитория обязателен' 
      });
    }

    const git: SimpleGit = simpleGit(repoPath);
    await git.clone(url, { '--branch': branch });
    
    res.json({ 
      success: true, 
      message: 'Репозиторий успешно клонирован' 
    });
    return;
  } catch (error) {
    console.error('Git clone error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка клонирования репозитория' 
    });
    return;
  }
});

// Получить список коммитов
router.get('/commits', async (req: Request, res: Response) => {
  try {
    const repoPath = req.query.path as string || process.env.GIT_REPO_PATH || './git-repos';
    const git: SimpleGit = simpleGit(repoPath);
    
    const log = await git.log({ maxCount: 10 });
    
    res.json({
      success: true,
      data: log.all
    });
  } catch (error) {
    console.error('Git commits error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка получения коммитов' 
    });
  }
});

// Вынесенная функция экспорта
async function exportJsonDirect(query: any) {
  const fs = require('fs');
  const path = require('path');
  // Экспорт тест-кейсов
  const cases = await query('SELECT * FROM test_cases');
  for (const c of cases.rows) {
    fs.writeFileSync(
      path.join(process.cwd(), 'repo_data', 'test_cases', `case-${c.id}.json`),
      JSON.stringify(c, null, 2)
    );
  }
  // Экспорт тест-планов
  const plans = await query('SELECT * FROM test_plans');
  for (const p of plans.rows) {
    fs.writeFileSync(
      path.join(process.cwd(), 'repo_data', 'test_plans', `plan-${p.id}.json`),
      JSON.stringify(p, null, 2)
    );
  }
  // Экспорт проектов
  const projects = await query('SELECT * FROM projects');
  for (const p of projects.rows) {
    fs.writeFileSync(
      path.join(process.cwd(), 'repo_data', 'projects', `project-${p.id}.json`),
      JSON.stringify(p, null, 2)
    );
  }
  // Экспорт тестовых прогонов
  const runs = await query('SELECT * FROM test_runs');
  for (const r of runs.rows) {
    fs.writeFileSync(
      path.join(process.cwd(), 'repo_data', 'test_runs', `run-${r.id}.json`),
      JSON.stringify(r, null, 2)
    );
  }

  // Экспорт attachments
  if (!fs.existsSync(path.join(process.cwd(), 'repo_data', 'attachments'))) {
    fs.mkdirSync(path.join(process.cwd(), 'repo_data', 'attachments'), { recursive: true });
  }
  if (!fs.existsSync(path.join(process.cwd(), 'repo_data', 'attachments', 'metadata'))) {
    fs.mkdirSync(path.join(process.cwd(), 'repo_data', 'attachments', 'metadata'), { recursive: true });
  }
  if (!fs.existsSync(path.join(process.cwd(), 'repo_data', 'attachments', 'files'))) {
    fs.mkdirSync(path.join(process.cwd(), 'repo_data', 'attachments', 'files'), { recursive: true });
  }

  const attachments = await query('SELECT * FROM attachments');
  const attachmentsMetadata = [];
  
  for (const attachment of attachments.rows) {
    const attachmentData = { ...attachment };
    
    // Копируем файл из локальной файловой системы в repo_data
    const sourceFilePath = attachment.file_path;
    const fileName = attachment.filename;
    const targetFilePath = path.join(process.cwd(), 'repo_data', 'attachments', 'files', fileName);
    
    if (fs.existsSync(sourceFilePath)) {
      try {
        fs.copyFileSync(sourceFilePath, targetFilePath);
        console.log(`[Export] Скопирован файл: ${fileName}`);
      } catch (error) {
        console.error(`[Export] Ошибка копирования файла ${fileName}:`, error);
      }
    } else {
      console.warn(`[Export] Файл не найден: ${sourceFilePath}`);
    }
    
    // Убираем локальный путь к файлу из метаданных
    delete attachmentData.file_path;
    attachmentsMetadata.push(attachmentData);
  }
  
  // Сохраняем метаданные attachments
  if (attachmentsMetadata.length > 0) {
    fs.writeFileSync(
      path.join(process.cwd(), 'repo_data', 'attachments', 'metadata', 'attachments.json'),
      JSON.stringify(attachmentsMetadata, null, 2)
    );
    console.log(`[Export] Экспортировано ${attachmentsMetadata.length} attachments`);
  }
}

// Вынесенная функция импорта
async function importJsonDirect(query: any) {
  const fs = require('fs');
  const path = require('path');
  // Импорт тест-кейсов
  const caseFiles = fs.readdirSync(path.join(process.cwd(), 'repo_data', 'test_cases'), { encoding: 'utf8' });
  for (const file of caseFiles) {
    const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'repo_data', 'test_cases', file), 'utf8'));
    await query(
      `INSERT INTO test_cases (id, project_id, test_plan_id, title, description, preconditions, steps, expected_result, priority, status, created_by, assigned_to, section_id, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT (id) DO UPDATE SET
         project_id=$2, test_plan_id=$3, title=$4, description=$5, preconditions=$6, steps=$7, expected_result=$8, priority=$9, status=$10, created_by=$11, assigned_to=$12, section_id=$13, created_at=$14, updated_at=$15`,
      [data.id, data.project_id, data.test_plan_id, data.title, data.description, data.preconditions, data.steps, data.expected_result, data.priority, data.status, data.created_by, data.assigned_to, data.section_id, data.created_at, data.updated_at]
    );
  }
  // Импорт тест-планов
  const planFiles = fs.readdirSync(path.join(process.cwd(), 'repo_data', 'test_plans'), { encoding: 'utf8' });
  for (const file of planFiles) {
    const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'repo_data', 'test_plans', file), 'utf8'));
    await query(
      `INSERT INTO test_plans (id, project_id, name, description, status, created_by, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (id) DO UPDATE SET
         project_id=$2, name=$3, description=$4, status=$5, created_by=$6, created_at=$7, updated_at=$8`,
      [data.id, data.project_id, data.name, data.description, data.status, data.created_by, data.created_at, data.updated_at]
    );
  }
  // Импорт проектов
  const projectFiles = fs.readdirSync(path.join(process.cwd(), 'repo_data', 'projects'), { encoding: 'utf8' });
  for (const file of projectFiles) {
    const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'repo_data', 'projects', file), 'utf8'));
    await query(
      `INSERT INTO projects (id, name, description, git_repo_url, git_branch, created_by, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (id) DO UPDATE SET
         name=$2, description=$3, git_repo_url=$4, git_branch=$5, created_by=$6, created_at=$7, updated_at=$8`,
      [data.id, data.name, data.description, data.git_repo_url, data.git_branch, data.created_by, data.created_at, data.updated_at]
    );
  }
  // Импорт тестовых прогонов
  const runFiles = fs.readdirSync(path.join(process.cwd(), 'repo_data', 'test_runs'), { encoding: 'utf8' });
  for (const file of runFiles) {
    const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'repo_data', 'test_runs', file), 'utf8'));
    await query(
      `INSERT INTO test_runs (id, test_plan_id, name, description, status, started_by, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (id) DO UPDATE SET
         test_plan_id=$2, name=$3, description=$4, status=$5, started_by=$6, created_at=$7`,
      [data.id, data.test_plan_id, data.name, data.description, data.status, data.started_by, data.created_at]
    );
  }

  // Импорт attachments
  const attachmentsMetadataPath = path.join(process.cwd(), 'repo_data', 'attachments', 'metadata', 'attachments.json');
  if (fs.existsSync(attachmentsMetadataPath)) {
    try {
      const attachmentsMetadata = JSON.parse(fs.readFileSync(attachmentsMetadataPath, 'utf8'));
      const attachmentsFilesDir = path.join(process.cwd(), 'repo_data', 'attachments', 'files');
      
      for (const attachmentData of attachmentsMetadata) {
        const fileName = attachmentData.filename;
        const sourceFilePath = path.join(attachmentsFilesDir, fileName);
        const targetFilePath = path.join(process.cwd(), 'uploads', fileName);
        
        // Копируем файл из repo_data в локальную файловую систему
        if (fs.existsSync(sourceFilePath)) {
          try {
            // Создаем папку uploads если её нет
            if (!fs.existsSync(path.join(process.cwd(), 'uploads'))) {
              fs.mkdirSync(path.join(process.cwd(), 'uploads'), { recursive: true });
            }
            
            fs.copyFileSync(sourceFilePath, targetFilePath);
            console.log(`[Import] Скопирован файл: ${fileName}`);
          } catch (error) {
            console.error(`[Import] Ошибка копирования файла ${fileName}:`, error);
          }
        } else {
          console.warn(`[Import] Файл не найден в repo_data: ${sourceFilePath}`);
        }
        
        // Восстанавливаем локальный путь к файлу
        attachmentData.file_path = targetFilePath;
        
        // Импортируем запись в БД
        await query(
          `INSERT INTO attachments (id, test_case_id, filename, original_filename, file_path, file_size, mime_type, description, uploaded_by, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
           ON CONFLICT (id) DO UPDATE SET
             test_case_id=$2, filename=$3, original_filename=$4, file_path=$5, file_size=$6, mime_type=$7, description=$8, uploaded_by=$9, created_at=$10, updated_at=$11`,
          [
            attachmentData.id,
            attachmentData.test_case_id,
            attachmentData.filename,
            attachmentData.original_filename,
            attachmentData.file_path,
            attachmentData.file_size,
            attachmentData.mime_type,
            attachmentData.description,
            attachmentData.uploaded_by,
            attachmentData.created_at,
            attachmentData.updated_at
          ]
        );
      }
      
      console.log(`[Import] Импортировано ${attachmentsMetadata.length} attachments`);
    } catch (error) {
      console.error('[Import] Ошибка импорта attachments:', error);
    }
  }
}

// Вспомогательная функция для получения git-репозитория и папки проекта
async function getProjectRepoInfo(projectId: string) {
  const result = await query('SELECT * FROM projects WHERE id = $1', [projectId]);
  if (!result.rows.length) throw new Error('Проект не найден');
  const project = result.rows[0];
  const repoPath = path.join(process.cwd(), 'repo_data', `project-${projectId}`);
  const gitRepoUrl = project.git_repo_url;
  return { repoPath, gitRepoUrl, project };
}

// Подставляет токен в ссылку на репозиторий, если это github и есть токен
function withGitToken(url: string): string {
  const token = process.env.GIT_TOKEN;
  // Проверяем, что токен установлен и не является placeholder
  const isPlaceholder = !token || 
    token === 'your-github-personal-access-token' || 
    token.includes('your-') || 
    token.length < 10;
  
  if (!isPlaceholder && url && url.startsWith('https://github.com/')) {
    return url.replace('https://github.com/', `https://${token}@github.com/`);
  }
  
  // Если токен не установлен или является placeholder, возвращаем URL без токена
  // Git может использовать другие методы аутентификации (SSH ключи, credential helper)
  return url;
}

// Экспорт только данных этого проекта
async function exportJsonProject(query: any, projectId: string, repoPath: string) {
  const fs = require('fs');
  const path = require('path');
  const { v4: uuidv4 } = require('uuid');
  if (!fs.existsSync(path.join(repoPath, 'test_cases'))) fs.mkdirSync(path.join(repoPath, 'test_cases'), { recursive: true });
  if (!fs.existsSync(path.join(repoPath, 'test_plans'))) fs.mkdirSync(path.join(repoPath, 'test_plans'), { recursive: true });
  if (!fs.existsSync(path.join(repoPath, 'test_runs'))) fs.mkdirSync(path.join(repoPath, 'test_runs'), { recursive: true });

  // 1. Собираем все id и содержимое удалённых тест-кейсов
  const remoteCases: Record<string, any> = {};
  const remoteCaseDir = path.join(repoPath, 'test_cases');
  if (fs.existsSync(remoteCaseDir)) {
    const remoteCaseFiles = fs.readdirSync(remoteCaseDir, { encoding: 'utf8' });
    for (const file of remoteCaseFiles) {
      const data = JSON.parse(fs.readFileSync(path.join(remoteCaseDir, file), 'utf8'));
      remoteCases[data.id] = data;
    }
  }

  // 2. Экспортируем локальные тест-кейсы (включая удаленные для синхронизации)
  const cases = await query('SELECT * FROM test_cases WHERE project_id = $1', [projectId]);
  for (const c of cases.rows) {
    let caseData = { ...c };
    // Если id (uuid) совпадает, всегда обновляем файл (перезаписываем кейс)
    fs.writeFileSync(
      path.join(repoPath, 'test_cases', `case-${caseData.id}.json`),
      JSON.stringify(caseData, null, 2)
    );
  }
  // Экспорт тест-планов (включая удаленные)
  const plans = await query('SELECT * FROM test_plans WHERE project_id = $1', [projectId]);
  for (const p of plans.rows) {
    fs.writeFileSync(
      path.join(repoPath, 'test_plans', `plan-${p.id}.json`),
      JSON.stringify(p, null, 2)
    );
  }
  // Экспорт тестовых прогонов (включая удаленные)
  const runs = await query('SELECT * FROM test_runs WHERE test_plan_id IN (SELECT id FROM test_plans WHERE project_id = $1)', [projectId]);
  for (const r of runs.rows) {
    fs.writeFileSync(
      path.join(repoPath, 'test_runs', `run-${r.id}.json`),
      JSON.stringify(r, null, 2)
    );
  }
  // Экспорт разделов (test_case_sections) (включая удаленные)
  if (!fs.existsSync(path.join(repoPath, 'test_case_sections'))) fs.mkdirSync(path.join(repoPath, 'test_case_sections'), { recursive: true });
  const sections = await query('SELECT * FROM test_case_sections WHERE project_id = $1', [projectId]);
  for (const s of sections.rows) {
    fs.writeFileSync(
      path.join(repoPath, 'test_case_sections', `section-${s.id}.json`),
      JSON.stringify(s, null, 2)
    );
  }

  // Экспорт attachments
  if (!fs.existsSync(path.join(repoPath, 'attachments'))) fs.mkdirSync(path.join(repoPath, 'attachments'), { recursive: true });
  if (!fs.existsSync(path.join(repoPath, 'attachments', 'metadata'))) fs.mkdirSync(path.join(repoPath, 'attachments', 'metadata'), { recursive: true });
  if (!fs.existsSync(path.join(repoPath, 'attachments', 'files'))) fs.mkdirSync(path.join(repoPath, 'attachments', 'files'), { recursive: true });

  // Получаем все attachments для тест-кейсов этого проекта (включая удаленные)
  const attachments = await query(`
    SELECT a.*, tc.project_id 
    FROM attachments a 
    JOIN test_cases tc ON a.test_case_id = tc.id 
    WHERE tc.project_id = $1
  `, [projectId]);

  // Получаем список всех файлов, которые были в репозитории ранее
  const existingFiles = new Set<string>();
  const attachmentsMetadataPath = path.join(repoPath, 'attachments', 'metadata', 'attachments.json');
  if (fs.existsSync(attachmentsMetadataPath)) {
    try {
      const fileContent = fs.readFileSync(attachmentsMetadataPath, 'utf8');
      // Проверяем, что файл содержит валидный JSON, а не HTML
      if (fileContent.trim().startsWith('{') || fileContent.trim().startsWith('[')) {
        const existingMetadata = JSON.parse(fileContent);
        if (Array.isArray(existingMetadata)) {
          existingMetadata.forEach((att: any) => existingFiles.add(att.filename));
        }
      } else {
        console.warn('[Git Export] Файл attachments.json содержит невалидный JSON, игнорируем');
      }
    } catch (error) {
      console.warn('[Git Export] Ошибка чтения существующих метаданных attachments:', error);
    }
  }

  const attachmentsMetadata = [];
  const currentFiles = new Set<string>();
  
  for (const attachment of attachments.rows) {
    const attachmentData = { ...attachment };
    currentFiles.add(attachment.filename);
    
    // Копируем файл из локальной файловой системы в Git репозиторий
    const sourceFilePath = attachment.file_path;
    const fileName = attachment.filename;
    const targetFilePath = path.join(repoPath, 'attachments', 'files', fileName);
    
    if (fs.existsSync(sourceFilePath)) {
      try {
        fs.copyFileSync(sourceFilePath, targetFilePath);
        console.log(`[Git Export] Скопирован файл: ${fileName}`);
      } catch (error) {
        console.error(`[Git Export] Ошибка копирования файла ${fileName}:`, error);
      }
    } else {
      console.warn(`[Git Export] Файл не найден: ${sourceFilePath}`);
    }
    
    // Убираем локальный путь к файлу из метаданных
    delete attachmentData.file_path;
    attachmentsMetadata.push(attachmentData);
  }
  
  // Удаляем файлы, которые больше не существуют в БД
  const filesToDelete = Array.from(existingFiles).filter(filename => !currentFiles.has(filename));
  for (const filename of filesToDelete) {
    const filePath = path.join(repoPath, 'attachments', 'files', filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`[Git Export] Удален файл: ${filename}`);
      } catch (error) {
        console.error(`[Git Export] Ошибка удаления файла ${filename}:`, error);
      }
    }
  }
  
  // Сохраняем метаданные attachments
  if (attachmentsMetadata.length > 0) {
    fs.writeFileSync(
      path.join(repoPath, 'attachments', 'metadata', 'attachments.json'),
      JSON.stringify(attachmentsMetadata, null, 2)
    );
    console.log(`[Git Export] Экспортировано ${attachmentsMetadata.length} attachments`);
  } else {
    // Если нет attachments, создаем пустой файл метаданных
    fs.writeFileSync(
      path.join(repoPath, 'attachments', 'metadata', 'attachments.json'),
      JSON.stringify([], null, 2)
    );
    console.log(`[Git Export] Создан пустой файл метаданных attachments`);
  }
}

// Импорт только данных этого проекта
async function importJsonProject(query: any, projectId: string, repoPath: string) {
  const fs = require('fs');
  const path = require('path');
  
  // Получаем ID существующего пользователя (admin)
  const userResult = await query('SELECT id FROM users WHERE username = $1', ['admin']);
  const defaultUserId = userResult.rows[0]?.id || '550e8400-e29b-41d4-a716-446655440000';
  
  // Используем переданный projectId, не ищем по git_repo_url
  let actualProjectId = projectId;
  let projectGitUrl = null;
  const projectDir = path.join(process.cwd(), 'repo_data', 'projects');
  if (fs.existsSync(projectDir)) {
    const projectFiles = fs.readdirSync(projectDir, { encoding: 'utf8' });
    for (const file of projectFiles) {
      const data = JSON.parse(fs.readFileSync(path.join(projectDir, file), 'utf8'));
      if (String(data.id) === String(projectId)) {
        projectGitUrl = data.git_repo_url;
        await query(
          `INSERT INTO projects (id, name, description, git_repo_url, git_branch, created_by, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
           ON CONFLICT (id) DO UPDATE SET
             name=$2, description=$3, git_repo_url=$4, git_branch=$5, created_by=$6, created_at=$7, updated_at=$8`,
          [data.id, data.name, data.description, data.git_repo_url, data.git_branch, defaultUserId, data.created_at, data.updated_at]
        );
        break; // Нашли нужный проект, выходим из цикла
      }
    }
    // УБИРАЕМ проблемную логику поиска по git_repo_url
    // Теперь всегда используем переданный projectId
  }
  // --- Новый блок: импорт разделов с топологической сортировкой ---
  const sectionDir = path.join(repoPath, 'test_case_sections');
  const sectionIdMap: Record<string, string> = {};
  if (fs.existsSync(sectionDir)) {
    const sectionFiles = fs.readdirSync(sectionDir, { encoding: 'utf8' });
    const sections: any[] = sectionFiles.map((file: string) => JSON.parse(fs.readFileSync(path.join(sectionDir, file), 'utf8')));

    // Топологическая сортировка
    const sortedSections: any[] = [];
    const visited: Record<string, boolean> = {};
    function visit(section: any) {
      if (visited[section.id]) return;
      visited[section.id] = true;
      if (section.parent_id) {
        const parent = sections.find(s => s.id === section.parent_id);
        if (parent) visit(parent);
      }
      sortedSections.push(section);
    }
    sections.forEach(visit);

    for (const data of sortedSections) {
      const oldId = data.id;
      // Проверяем, есть ли уже раздел с таким id
      const res = await query('SELECT id FROM test_case_sections WHERE id = $1', [data.id]);
      let newId = data.id;
      if (res.rows.length === 0) {
        // Вставляем новый раздел
              await query(
        `INSERT INTO test_case_sections (id, project_id, name, parent_id, created_by, is_deleted, deleted_at, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (id) DO UPDATE SET
           project_id=$2, name=$3, parent_id=$4, created_by=$5, is_deleted=$6, deleted_at=$7, created_at=$8, updated_at=$9`,
        [data.id, actualProjectId, data.name, data.parent_id, defaultUserId, data.is_deleted || false, data.deleted_at, data.created_at, data.updated_at]
      );
      } else {
        // Уже есть раздел с таким id, используем существующий id
        newId = res.rows[0].id;
      }
      sectionIdMap[oldId] = newId;
    }
  }
  // Импорт тест-планов (сначала!)
  const planDir = path.join(repoPath, 'test_plans');
  if (fs.existsSync(planDir)) {
    const planFiles = fs.readdirSync(planDir, { encoding: 'utf8' });
    console.log(`[Git Import] Найдено ${planFiles.length} файлов тест-планов в репозитории`);
    for (const file of planFiles) {
      const data = JSON.parse(fs.readFileSync(path.join(planDir, file), 'utf8'));
      data.project_id = actualProjectId;
      await query(
        `INSERT INTO test_plans (id, project_id, name, description, status, created_by, is_deleted, deleted_at, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (id) DO UPDATE SET
           project_id=$2, name=$3, description=$4, status=$5, created_by=$6, is_deleted=$7, deleted_at=$8, created_at=$9, updated_at=$10`,
        [data.id, data.project_id, data.name, data.description, data.status, defaultUserId, data.is_deleted || false, data.deleted_at, data.created_at, data.updated_at]
      );
    }
    console.log(`[Git Import] Импортировано ${planFiles.length} тест-планов для проекта ${actualProjectId}`);
  }
  
  // --- Импорт тест-кейсов с учётом маппинга section_id ---
  const caseDir = path.join(repoPath, 'test_cases');
  if (fs.existsSync(caseDir)) {
    const caseFiles = fs.readdirSync(caseDir, { encoding: 'utf8' });
    console.log(`[Git Import] Найдено ${caseFiles.length} файлов тест-кейсов в репозитории`);
    let importedCount = 0;
    for (const file of caseFiles) {
      const data = JSON.parse(fs.readFileSync(path.join(caseDir, file), 'utf8'));
      data.project_id = actualProjectId;
      // Проверяем и исправляем test_plan_id
      let testPlanId = data.test_plan_id;
      if (testPlanId) {
        // Проверяем, существует ли тест-план с таким id
        const planCheck = await query('SELECT id FROM test_plans WHERE id = $1', [testPlanId]);
        if (planCheck.rows.length === 0) {
          console.log(`[Git Import] Тест-план с id ${testPlanId} не найден, устанавливаем null`);
          testPlanId = null;
        }
      }
      
      // Если test_plan_id не задан, а в проекте только один тест-план — проставляем его
      if (!testPlanId) {
        let planId = null;
        if (fs.existsSync(planDir)) {
          const planFiles = fs.readdirSync(planDir, { encoding: 'utf8' });
          if (planFiles.length === 1) {
            const planData = JSON.parse(fs.readFileSync(path.join(planDir, planFiles[0]), 'utf8'));
            planId = planData.id;
          }
        }
        if (planId) {
          // Проверяем, существует ли этот тест-план в БД
          const planCheck = await query('SELECT id FROM test_plans WHERE id = $1', [planId]);
          if (planCheck.rows.length > 0) {
            testPlanId = planId;
          }
        }
      }
      // Проверяем section_id через маппинг
      let sectionId = data.section_id;
      if (sectionId && sectionIdMap[sectionId]) {
        sectionId = sectionIdMap[sectionId];
      } else if (sectionId) {
        sectionId = null;
      }
      await query(
        `INSERT INTO test_cases (id, project_id, test_plan_id, title, description, preconditions, steps, expected_result, priority, status, created_by, assigned_to, section_id, is_deleted, deleted_at, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
         ON CONFLICT (id) DO UPDATE SET
           project_id=$2, test_plan_id=$3, title=$4, description=$5, preconditions=$6, steps=$7, expected_result=$8, priority=$9, status=$10, created_by=$11, assigned_to=$12, section_id=$13, is_deleted=$14, deleted_at=$15, created_at=$16, updated_at=$17`,
        [data.id, data.project_id, testPlanId, data.title, data.description, data.preconditions, data.steps, data.expected_result, data.priority, data.status, defaultUserId, defaultUserId, sectionId, data.is_deleted || false, data.deleted_at, data.created_at, data.updated_at]
      );
      importedCount++;
    }
    console.log(`[Git Import] Импортировано ${importedCount} тест-кейсов для проекта ${actualProjectId}`);
  }
  // Импорт тестовых прогонов
  const runDir = path.join(repoPath, 'test_runs');
  if (fs.existsSync(runDir)) {
    const runFiles = fs.readdirSync(runDir, { encoding: 'utf8' });
    for (const file of runFiles) {
      const data = JSON.parse(fs.readFileSync(path.join(runDir, file), 'utf8'));
      await query(
        `INSERT INTO test_runs (id, test_plan_id, name, description, status, started_by, created_by, is_deleted, deleted_at, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (id) DO UPDATE SET
           test_plan_id=$2, name=$3, description=$4, status=$5, started_by=$6, created_by=$7, is_deleted=$8, deleted_at=$9, created_at=$10`,
        [data.id, data.test_plan_id, data.name, data.description, data.status, defaultUserId, defaultUserId, data.is_deleted || false, data.deleted_at, data.created_at]
      );
    }
  }

  // Импорт attachments
  const attachmentsMetadataPath = path.join(repoPath, 'attachments', 'metadata', 'attachments.json');
  if (fs.existsSync(attachmentsMetadataPath)) {
    try {
      const attachmentsMetadata = JSON.parse(fs.readFileSync(attachmentsMetadataPath, 'utf8'));
      const attachmentsFilesDir = path.join(repoPath, 'attachments', 'files');
      
      // Получаем список всех attachments, которые есть в репозитории
      const repoAttachments = new Set<string>();
      
      for (const attachmentData of attachmentsMetadata) {
        repoAttachments.add(attachmentData.id);
        const fileName = attachmentData.filename;
        const sourceFilePath = path.join(attachmentsFilesDir, fileName);
        const targetFilePath = path.join(process.cwd(), 'uploads', fileName);
        
        // Копируем файл из Git репозитория в локальную файловую систему
        if (fs.existsSync(sourceFilePath)) {
          try {
            // Создаем папку uploads если её нет
            if (!fs.existsSync(path.join(process.cwd(), 'uploads'))) {
              fs.mkdirSync(path.join(process.cwd(), 'uploads'), { recursive: true });
            }
            
            fs.copyFileSync(sourceFilePath, targetFilePath);
            console.log(`[Git Import] Скопирован файл: ${fileName}`);
          } catch (error) {
            console.error(`[Git Import] Ошибка копирования файла ${fileName}:`, error);
          }
        } else {
          console.warn(`[Git Import] Файл не найден в репозитории: ${sourceFilePath}`);
        }
        
        // Восстанавливаем локальный путь к файлу
        attachmentData.file_path = targetFilePath;
        
        // Импортируем запись в БД
        await query(
          `INSERT INTO attachments (id, test_case_id, filename, original_filename, file_path, file_size, mime_type, description, uploaded_by, is_deleted, deleted_at, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
           ON CONFLICT (id) DO UPDATE SET
             test_case_id=$2, filename=$3, original_filename=$4, file_path=$5, file_size=$6, mime_type=$7, description=$8, uploaded_by=$9, is_deleted=$10, deleted_at=$11, created_at=$12, updated_at=$13`,
          [
            attachmentData.id,
            attachmentData.test_case_id,
            attachmentData.filename,
            attachmentData.original_filename,
            attachmentData.file_path,
            attachmentData.file_size,
            attachmentData.mime_type,
            attachmentData.description,
            defaultUserId,
            attachmentData.is_deleted || false,
            attachmentData.deleted_at,
            attachmentData.created_at,
            attachmentData.updated_at
          ]
        );
      }
      
      // Удаляем attachments, которых больше нет в репозитории
      const localAttachments = await query(`
        SELECT a.id, a.filename, a.file_path
        FROM attachments a 
        JOIN test_cases tc ON a.test_case_id = tc.id 
        WHERE tc.project_id = $1
      `, [actualProjectId]);
      
      for (const localAttachment of localAttachments.rows) {
        if (!repoAttachments.has(localAttachment.id)) {
          // Удаляем запись из БД
          await query('DELETE FROM attachments WHERE id = $1', [localAttachment.id]);
          
          // Удаляем файл из локальной файловой системы
          if (fs.existsSync(localAttachment.file_path)) {
            try {
              fs.unlinkSync(localAttachment.file_path);
              console.log(`[Git Import] Удален локальный файл: ${localAttachment.filename}`);
            } catch (error) {
              console.error(`[Git Import] Ошибка удаления локального файла ${localAttachment.filename}:`, error);
            }
          }
        }
      }
      
      console.log(`[Git Import] Импортировано ${attachmentsMetadata.length} attachments`);
    } catch (error) {
      console.error('[Git Import] Ошибка импорта attachments:', error);
    }
  } else {
    // Если файл метаданных не существует, удаляем все attachments для этого проекта
    const localAttachments = await query(`
      SELECT a.id, a.filename, a.file_path
      FROM attachments a 
      JOIN test_cases tc ON a.test_case_id = tc.id 
      WHERE tc.project_id = $1
    `, [actualProjectId]);
    
    for (const localAttachment of localAttachments.rows) {
      // Удаляем запись из БД
      await query('DELETE FROM attachments WHERE id = $1', [localAttachment.id]);
      
      // Удаляем файл из локальной файловой системы
      if (fs.existsSync(localAttachment.file_path)) {
        try {
          fs.unlinkSync(localAttachment.file_path);
          console.log(`[Git Import] Удален локальный файл: ${localAttachment.filename}`);
        } catch (error) {
          console.error(`[Git Import] Ошибка удаления локального файла ${localAttachment.filename}:`, error);
        }
      }
    }
    
    console.log(`[Git Import] Удалено ${localAttachments.rows.length} attachments (файл метаданных не найден)`);
  }
  
  // Миграция связей из test_plan_id в test_plan_cases
  console.log('[Git Import] Выполняем миграцию связей test_plan_cases...');
  try {
    const migrationResult = await query(`
      INSERT INTO test_plan_cases (test_plan_id, test_case_id)
      SELECT test_plan_id, id 
      FROM test_cases 
      WHERE test_plan_id IS NOT NULL 
      AND NOT EXISTS (
          SELECT 1 FROM test_plan_cases tpc 
          WHERE tpc.test_plan_id = test_cases.test_plan_id 
          AND tpc.test_case_id = test_cases.id
      )
    `);
    console.log(`[Git Import] Миграция завершена. Добавлено связей: ${migrationResult.rowCount}`);
  } catch (error) {
    console.error('[Git Import] Ошибка миграции test_plan_cases:', error);
  }
  
  // Удалён второй проход по разделам (test_case_sections)
}

// /export-json и /import-json теперь используют эти функции
router.post('/export-json', async (req, res) => {
  try {
    await exportJsonDirect(query);
    res.json({ success: true, message: 'Экспорт завершён' });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/import-json', async (req, res) => {
  try {
    await importJsonDirect(query);
    res.json({ success: true, message: 'Импорт завершён' });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// /pull и /push теперь вызывают напрямую эти функции
router.post('/pull', async (req, res) => {
  logger.info('Git pull request received', { query: req.query });
  try {
    const projectId = req.query.projectId as string;
    if (!projectId) {
      logger.warn('Git pull: projectId not provided');
      res.status(400).json({ success: false, error: 'projectId обязателен' });
      return;
    }
    logger.info('Processing pull for projectId', { projectId });
    let { repoPath, gitRepoUrl } = await getProjectRepoInfo(projectId);
    gitRepoUrl = withGitToken(gitRepoUrl);
    logger.info('Git repository info', { repoPath, hasGitRepoUrl: !!gitRepoUrl });
    let git: SimpleGit;
    if (!fs.existsSync(path.join(repoPath, '.git'))) {
      if (!gitRepoUrl) {
        logger.error('Git pull: git_repo_url not set', { projectId });
        res.status(400).json({ success: false, error: 'git_repo_url не задан' });
        return;
      }
      // Если папка существует, но нет .git, инициализируем git и подтягиваем remote
      if (fs.existsSync(repoPath)) {
        logger.info('Initializing git repository for pull', { repoPath });
        const gitInit = simpleGit(repoPath);
        await gitInit.init();
        await gitInit.addRemote('origin', gitRepoUrl).catch((err) => {
          logger.warn('Failed to add remote (may already exist)', { error: err.message });
        });
        try {
          logger.info('Fetching and checking out main branch');
          await gitInit.fetch('origin', 'main');
          await gitInit.checkout(['-B', 'main', 'origin/main']);
          logger.info('Successfully fetched and checked out main branch');
        } catch (e) {
          const err = e as Error;
          logger.warn('Failed to fetch/checkout, creating local branch', { error: err.message });
          await gitInit.checkoutLocalBranch('main').catch((err) => {
            logger.error('Failed to create local branch', { error: err.message });
          });
        }
      } else {
        logger.info('Cloning repository for pull', { gitRepoUrl, repoPath });
        await simpleGit().clone(gitRepoUrl, repoPath);
        logger.info('Repository cloned successfully');
      }
    }
    git = simpleGit(repoPath);
    logger.info('Pulling from remote repository');
    await git.pull();
    logger.info('Pull completed, importing project data', { projectId, repoPath });
    await importJsonProject(query, projectId, repoPath);
    logger.info('Git pull completed successfully', { projectId });
    res.json({ success: true, message: 'Данные успешно импортированы из Git' });
  } catch (error) {
    const err = error as Error;
    logger.error('Error during git pull', { 
      error: err.message,
      stack: err.stack,
      projectId: req.query.projectId 
    });
    let errorMessage = 'Ошибка импорта из Git';
    if (err.message.includes('ENOTFOUND')) {
      errorMessage = 'Не удается подключиться к репозиторию. Проверьте URL.';
    } else if (err.message.includes('not found')) {
      errorMessage = 'Репозиторий не найден. Проверьте URL.';
    } else if (err.message.includes('authentication')) {
      errorMessage = 'Ошибка аутентификации. Проверьте Git токен.';
    }
    res.status(500).json({ success: false, error: errorMessage });
  }
});

router.post('/push', async (req, res) => {
  logger.info('Git push request received', { query: req.query });
  try {
    const projectId = req.query.projectId as string;
    if (!projectId) {
      logger.warn('Git push: projectId not provided');
      res.status(400).json({ success: false, error: 'projectId обязателен' });
      return;
    }
    logger.info('Processing push for projectId', { projectId });
    let { repoPath, gitRepoUrl } = await getProjectRepoInfo(projectId);
    const originalUrl = gitRepoUrl;
    const token = process.env.GIT_TOKEN;
    const isPlaceholder = !token || 
      token === 'your-github-personal-access-token' || 
      token.includes('your-') || 
      token.length < 10;
    
    if (isPlaceholder && originalUrl && originalUrl.startsWith('https://github.com/')) {
      logger.warn('Git token not configured or is placeholder. Push may fail if repository requires authentication.', {
        hasToken: !!token,
        tokenLength: token?.length || 0
      });
    }
    
    gitRepoUrl = withGitToken(gitRepoUrl);
    logger.info('Exporting project data', { projectId, repoPath });
    await exportJsonProject(query, projectId, repoPath);
    let git: SimpleGit;
    if (!fs.existsSync(path.join(repoPath, '.git'))) {
      if (!gitRepoUrl) {
        logger.error('Git push: git_repo_url not set', { projectId });
        res.status(400).json({ success: false, error: 'git_repo_url не задан' });
        return;
      }
      if (fs.existsSync(repoPath)) {
        logger.info('Initializing git repository', { repoPath });
        const gitInit = simpleGit(repoPath);
        await gitInit.init();
        await gitInit.addRemote('origin', gitRepoUrl).catch((err) => {
          logger.warn('Failed to add remote (may already exist)', { error: err.message });
        });
        try {
          await gitInit.fetch('origin', 'main');
          await gitInit.checkout(['-B', 'main', 'origin/main']);
          logger.info('Fetched and checked out main branch');
        } catch (e) {
          const err = e as Error;
          logger.warn('Failed to fetch/checkout, creating local branch', { error: err.message });
          await gitInit.checkoutLocalBranch('main').catch((err) => {
            logger.error('Failed to create local branch', { error: err.message });
          });
        }
      } else {
        logger.info('Cloning repository', { gitRepoUrl, repoPath });
        await simpleGit().clone(gitRepoUrl, repoPath);
      }
    }
    git = simpleGit(repoPath);
    await git.addConfig('user.email', 'tms@example.com');
    await git.addConfig('user.name', 'TMS User');
    logger.info('Staging files for commit');
    await git.add('./*/*');
    logger.info('Creating commit');
    await git.commit('feat: экспорт данных из БД в JSON');
    try {
      // Перед push делаем pull --rebase для интеграции изменений других пользователей
      logger.info('Pulling with rebase before push');
      await withTimeout(
        git.pull('origin', 'main', {'--rebase': null}),
        180000, // 3 минуты таймаут для pull --rebase
        'pull --rebase'
      );
      logger.info('Pull with rebase completed successfully');
    } catch (pullErr) {
      const err = pullErr as Error;
      logger.error('Error during pull with rebase', { 
        error: err.message, 
        stack: err.stack,
        projectId,
        repoPath 
      });
      
      // Если есть конфликты, пытаемся их автоматически разрешить
      if (err.message.includes('CONFLICT') || err.message.includes('conflict')) {
        logger.warn('Conflicts detected, attempting automatic resolution');
        try {
          // Проверяем статус для обнаружения конфликтующих файлов
          const status = await git.status();
          logger.info('Git status', { 
            conflicted: status.conflicted,
            conflictedCount: status.conflicted.length,
            modified: status.modified,
            created: status.created
          });
          
          if (status.conflicted.length > 0) {
            logger.info('Resolving conflicts using theirs strategy (our local changes)', { 
              conflictedFiles: status.conflicted 
            });
            // При rebase используем --theirs, потому что это наши локальные изменения из БД
            // В rebase: ours = удаленная ветка, theirs = наши локальные изменения
            for (const file of status.conflicted) {
              try {
                logger.debug('Resolving conflict for file', { file });
                // При rebase используем theirs (наши изменения)
                await git.checkout(['--theirs', file]);
                await git.add(file);
                logger.debug('Conflict resolved for file', { file });
              } catch (checkoutErr) {
                const checkoutError = checkoutErr as Error;
                logger.error('Error resolving conflict for file', { 
                  file, 
                  error: checkoutError.message,
                  stack: checkoutError.stack 
                });
                // Если не удалось через checkout, пробуем просто добавить файл (берем текущую версию)
                try {
                  await git.add(file);
                  logger.info('Added file after checkout error', { file });
                } catch (addErr) {
                  logger.error('Failed to add file after checkout error', { 
                    file, 
                    error: (addErr as Error).message 
                  });
                }
              }
            }
            // Продолжаем rebase с таймаутом
            logger.info('Continuing rebase after conflict resolution', { 
              conflictedCount: status.conflicted.length 
            });
            
            // Если конфликтов много (больше 20), сразу переключаемся на merge стратегию
            if (status.conflicted.length > 20) {
              logger.warn('Too many conflicts, switching to merge strategy instead of rebase', { 
                conflictedCount: status.conflicted.length 
              });
              throw new Error('TIMEOUT_REBASE');
            }
            
            try {
              await withTimeout(
                git.rebase(['--continue']),
                300000, // 5 минут таймаут для rebase --continue (увеличено для больших репозиториев)
                'rebase --continue'
              );
              logger.info('Conflicts successfully resolved and rebase completed');
            } catch (continueErr) {
              const continueError = continueErr as Error;
              logger.error('Error continuing rebase after conflict resolution', { 
                error: continueError.message,
                stack: continueError.stack,
                isTimeout: continueError.message.includes('Timeout')
              });
              // Если таймаут, пробуем abort и переключиться на merge стратегию
              if (continueError.message.includes('Timeout')) {
                throw new Error('TIMEOUT_REBASE');
              }
              throw continueError;
            }
          } else {
            logger.warn('Conflicts mentioned but no conflicted files in status, trying alternative approach');
            // Если конфликты не в статусе, пробуем abort и повторить с merge стратегией
            await git.rebase(['--abort']).catch((abortErr) => {
              logger.warn('Failed to abort rebase', { error: (abortErr as Error).message });
            });
            // Делаем обычный pull с merge стратегией ours
            logger.info('Trying pull with ours merge strategy');
            await withTimeout(
              git.pull('origin', 'main', {'-X': 'ours'}),
              180000, // 3 минуты таймаут
              'pull with ours strategy'
            );
            logger.info('Pull with ours strategy completed');
          }
        } catch (resolveErr) {
          const resolveError = resolveErr as Error;
          logger.error('Error during automatic conflict resolution', { 
            error: resolveError.message,
            stack: resolveError.stack,
            projectId,
            repoPath,
            isTimeout: resolveError.message.includes('Timeout') || resolveError.message.includes('TIMEOUT')
          });
          
          // Если таймаут или другая ошибка при rebase, пробуем обычный merge с стратегией ours
          try {
            logger.info('Rebase failed, trying abort and switching to merge strategy');
            await git.rebase(['--abort']).catch((abortErr) => {
              logger.warn('Failed to abort rebase, continuing anyway', { error: (abortErr as Error).message });
            });
            
            // Отменяем последний коммит, чтобы можно было сделать merge
            logger.info('Resetting to before our commit to prepare for merge');
            await git.reset(['--soft', 'HEAD~1']).catch((resetErr) => {
              logger.warn('Failed to reset soft, trying hard reset', { error: (resetErr as Error).message });
              // Если soft reset не сработал, пробуем hard reset на origin/main
              return git.reset(['--hard', 'origin/main']).catch(() => {
                logger.warn('Failed to reset hard as well');
              });
            });
            
            // Повторно экспортируем данные
            logger.info('Re-exporting project data for merge');
            await exportJsonProject(query, projectId, repoPath);
            
            // Делаем обычный pull с merge стратегией ours (наши изменения приоритетны)
            logger.info('Trying pull with merge strategy (ours)');
            await git.add('./*/*');
            await git.commit('feat: экспорт данных из БД в JSON');
            await withTimeout(
              git.pull('origin', 'main', {'-X': 'ours', '--no-rebase': null}),
              180000, // 3 минуты таймаут для merge
              'pull with merge strategy'
            );
            logger.info('Merge with ours strategy completed successfully');
          } catch (mergeErr) {
            const mergeError = mergeErr as Error;
            logger.error('Error during merge fallback', { 
              error: mergeError.message,
              stack: mergeError.stack,
              projectId,
              repoPath 
            });
            res.status(409).json({ 
              success: false, 
              error: 'Не удалось автоматически разрешить конфликты. Попробуйте выполнить Pull, затем Push снова.' 
            });
            return;
          }
        }
      } else {
        // Другие ошибки при pull
        logger.error('Non-conflict error during pull', { 
          error: err.message,
          stack: err.stack,
          projectId 
        });
        let errorMessage = 'Ошибка синхронизации с удаленным репозиторием';
        if (err.message.includes('could not apply')) {
          errorMessage = 'Ошибка применения изменений. Попробуйте выполнить Pull, затем Push снова.';
        }
        res.status(409).json({ success: false, error: errorMessage });
        return;
      }
    }
    // Обновляем remote URL с токеном перед push
    if (originalUrl && originalUrl.startsWith('https://github.com/')) {
      const urlWithToken = withGitToken(originalUrl);
      if (urlWithToken !== originalUrl) {
        logger.info('Updating remote URL with token', { 
          originalUrl: originalUrl.substring(0, 30) + '...',
          hasToken: urlWithToken.includes('@')
        });
        try {
          await git.removeRemote('origin');
        } catch (removeErr) {
          logger.debug('Remote origin does not exist or already removed');
        }
        await git.addRemote('origin', urlWithToken);
        logger.info('Remote URL updated successfully');
      } else {
        logger.warn('Token not applied to URL, push may fail', { 
          tokenLength: process.env.GIT_TOKEN?.length || 0 
        });
      }
    }
    
    try {
      logger.info('Pushing to remote repository');
      await withTimeout(
        git.push(),
        120000, // 2 минуты таймаут для push
        'push'
      );
      logger.info('Push completed successfully');
    } catch (e) {
      const pushErr = e as Error;
      logger.warn('Error during push, trying with set-upstream', { 
        error: pushErr.message,
        stack: pushErr.stack 
      });
      // Если ошибка про upstream, пробуем с --set-upstream
      try {
        await withTimeout(
          git.push(['--set-upstream', 'origin', 'main']),
          120000, // 2 минуты таймаут для push с upstream
          'push --set-upstream'
        );
        logger.info('Push with set-upstream completed successfully');
      } catch (pushErr2) {
        const err = pushErr2 as Error;
        logger.error('Error during push with set-upstream', { 
          error: err.message,
          stack: err.stack,
          projectId 
        });
            let errorMessage = 'Ошибка отправки изменений в репозиторий';
            if (err.message.includes('Timeout') || err.message.includes('timeout')) {
              errorMessage = 'Операция превысила лимит времени. Попробуйте выполнить Push снова. Если проблема повторяется, возможно, репозиторий слишком большой или есть проблемы с сетью.';
            } else if (err.message.includes('authentication') || 
                err.message.includes('could not read Password') || 
                err.message.includes('No such device or address') ||
                err.message.includes('your-github-personal-access-token')) {
              errorMessage = 'Ошибка аутентификации. Проверьте, что GIT_TOKEN установлен в .env файле и содержит действительный GitHub Personal Access Token (не placeholder).';
            } else if (err.message.includes('permission') || err.message.includes('denied')) {
              errorMessage = 'Нет прав для записи в репозиторий. Проверьте права доступа токена.';
            } else if (err.message.includes('not found') || err.message.includes('404')) {
              errorMessage = 'Репозиторий не найден. Проверьте URL репозитория.';
            }
        res.status(500).json({ success: false, error: errorMessage });
        return;
      }
    }
    logger.info('Git push completed successfully', { projectId });
    res.json({ success: true, message: 'Данные успешно экспортированы в Git' });
  } catch (error) {
    const err = error as Error;
    logger.error('Fatal error during git push', { 
      error: err.message,
      stack: err.stack,
      projectId: req.query.projectId 
    });
    let errorMessage = 'Ошибка экспорта в Git';
    if (err.message.includes('ENOTFOUND')) {
      errorMessage = 'Не удается подключиться к репозиторию. Проверьте URL.';
    } else if (err.message.includes('not found')) {
      errorMessage = 'Репозиторий не найден. Проверьте URL.';
    }
    res.status(500).json({ success: false, error: errorMessage });
  }
});

export default router; 