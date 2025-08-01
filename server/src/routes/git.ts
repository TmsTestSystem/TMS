import express, { Request, Response } from 'express';
import { simpleGit, SimpleGit } from 'simple-git';
import path from 'path';
import fs from 'fs';
import { query } from '../config/database';

const router = express.Router();

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
  if (token && url && url.startsWith('https://github.com/')) {
    return url.replace('https://github.com/', `https://${token}@github.com/`);
  }
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
}

// Импорт только данных этого проекта
async function importJsonProject(query: any, projectId: string, repoPath: string) {
  const fs = require('fs');
  const path = require('path');
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
          [data.id, data.name, data.description, data.git_repo_url, data.git_branch, data.created_by, data.created_at, data.updated_at]
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
        `INSERT INTO test_case_sections (id, project_id, name, parent_id, is_deleted, deleted_at, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (id) DO UPDATE SET
           project_id=$2, name=$3, parent_id=$4, is_deleted=$5, deleted_at=$6, created_at=$7, updated_at=$8`,
        [data.id, actualProjectId, data.name, data.parent_id, data.is_deleted || false, data.deleted_at, data.created_at, data.updated_at]
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
        [data.id, data.project_id, data.name, data.description, data.status, data.created_by, data.is_deleted || false, data.deleted_at, data.created_at, data.updated_at]
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
        [data.id, data.project_id, testPlanId, data.title, data.description, data.preconditions, data.steps, data.expected_result, data.priority, data.status, data.created_by, data.assigned_to, sectionId, data.is_deleted || false, data.deleted_at, data.created_at, data.updated_at]
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
        `INSERT INTO test_runs (id, test_plan_id, name, description, status, started_by, is_deleted, deleted_at, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (id) DO UPDATE SET
           test_plan_id=$2, name=$3, description=$4, status=$5, started_by=$6, is_deleted=$7, deleted_at=$8, created_at=$9`,
        [data.id, data.test_plan_id, data.name, data.description, data.status, data.started_by, data.is_deleted || false, data.deleted_at, data.created_at]
      );
    }
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
  try {
    const projectId = req.query.projectId as string;
    if (!projectId) {
      res.status(400).json({ success: false, error: 'projectId обязателен' });
      return;
    }
    let { repoPath, gitRepoUrl } = await getProjectRepoInfo(projectId);
    gitRepoUrl = withGitToken(gitRepoUrl);
    let git: SimpleGit;
    if (!fs.existsSync(path.join(repoPath, '.git'))) {
      if (!gitRepoUrl) {
        res.status(400).json({ success: false, error: 'git_repo_url не задан' });
        return;
      }
      // Если папка существует, но нет .git, инициализируем git и подтягиваем remote
      if (fs.existsSync(repoPath)) {
        const gitInit = simpleGit(repoPath);
        await gitInit.init();
        await gitInit.addRemote('origin', gitRepoUrl).catch(() => {});
        try {
          await gitInit.fetch('origin', 'main');
          await gitInit.checkout(['-B', 'main', 'origin/main']);
        } catch (e) {
          await gitInit.checkoutLocalBranch('main').catch(() => {});
        }
      } else {
        await simpleGit().clone(gitRepoUrl, repoPath);
      }
    }
    git = simpleGit(repoPath);
    await git.pull();
    await importJsonProject(query, projectId, repoPath);
    res.json({ success: true, message: 'Данные успешно импортированы из Git' });
  } catch (error) {
    const err = error as Error;
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
  console.log('Git push request received:', req.query);
  try {
    const projectId = req.query.projectId as string;
    if (!projectId) {
      console.log('No projectId provided');
      res.status(400).json({ success: false, error: 'projectId обязателен' });
      return;
    }
    console.log('Processing push for projectId:', projectId);
    let { repoPath, gitRepoUrl } = await getProjectRepoInfo(projectId);
    gitRepoUrl = withGitToken(gitRepoUrl);
    await exportJsonProject(query, projectId, repoPath);
    let git: SimpleGit;
    if (!fs.existsSync(path.join(repoPath, '.git'))) {
      if (!gitRepoUrl) {
        res.status(400).json({ success: false, error: 'git_repo_url не задан' });
        return;
      }
      if (fs.existsSync(repoPath)) {
        const gitInit = simpleGit(repoPath);
        await gitInit.init();
        await gitInit.addRemote('origin', gitRepoUrl).catch(() => {});
        try {
          await gitInit.fetch('origin', 'main');
          await gitInit.checkout(['-B', 'main', 'origin/main']);
        } catch (e) {
          await gitInit.checkoutLocalBranch('main').catch(() => {});
        }
      } else {
        await simpleGit().clone(gitRepoUrl, repoPath);
      }
    }
    git = simpleGit(repoPath);
    await git.addConfig('user.email', 'tms@example.com');
    await git.addConfig('user.name', 'TMS User');
    await git.add('./*/*');
    await git.commit('feat: экспорт данных из БД в JSON');
    try {
      // Перед push делаем pull --rebase для интеграции изменений других пользователей
      await git.pull('origin', 'main', {'--rebase': null});
    } catch (pullErr) {
      const err = pullErr as Error;
      // Ограничиваем сообщение об ошибке
      let errorMessage = 'Конфликт при синхронизации с удаленным репозиторием';
      if (err.message.includes('CONFLICT')) {
        errorMessage = 'Обнаружены конфликты в файлах. Очистите локальный репозиторий и попробуйте снова.';
      } else if (err.message.includes('could not apply')) {
        errorMessage = 'Ошибка применения изменений. Попробуйте очистить репозиторий.';
      }
      res.status(409).json({ success: false, error: errorMessage });
      return;
    }
    try {
      await git.push();
    } catch (e) {
      // Если ошибка про upstream, пробуем с --set-upstream
      try {
        await git.push(['--set-upstream', 'origin', 'main']);
      } catch (pushErr) {
        const err = pushErr as Error;
        let errorMessage = 'Ошибка отправки изменений в репозиторий';
        if (err.message.includes('authentication')) {
          errorMessage = 'Ошибка аутентификации. Проверьте Git токен.';
        } else if (err.message.includes('permission')) {
          errorMessage = 'Нет прав для записи в репозиторий.';
        }
        res.status(500).json({ success: false, error: errorMessage });
        return;
      }
    }
    res.json({ success: true, message: 'Данные успешно экспортированы в Git' });
  } catch (error) {
    const err = error as Error;
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