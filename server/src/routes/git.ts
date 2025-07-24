import express, { Request, Response } from 'express';
import { simpleGit, SimpleGit } from 'simple-git';
import path from 'path';
import fs from 'fs';

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
  const { query } = require('../config/database');
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
  if (!fs.existsSync(path.join(repoPath, 'test_cases'))) fs.mkdirSync(path.join(repoPath, 'test_cases'), { recursive: true });
  if (!fs.existsSync(path.join(repoPath, 'test_plans'))) fs.mkdirSync(path.join(repoPath, 'test_plans'), { recursive: true });
  if (!fs.existsSync(path.join(repoPath, 'test_runs'))) fs.mkdirSync(path.join(repoPath, 'test_runs'), { recursive: true });
  // Экспорт тест-кейсов
  const cases = await query('SELECT * FROM test_cases WHERE project_id = $1', [projectId]);
  for (const c of cases.rows) {
    fs.writeFileSync(
      path.join(repoPath, 'test_cases', `case-${c.id}.json`),
      JSON.stringify(c, null, 2)
    );
  }
  // Экспорт тест-планов
  const plans = await query('SELECT * FROM test_plans WHERE project_id = $1', [projectId]);
  for (const p of plans.rows) {
    fs.writeFileSync(
      path.join(repoPath, 'test_plans', `plan-${p.id}.json`),
      JSON.stringify(p, null, 2)
    );
  }
  // Экспорт тестовых прогонов
  const runs = await query('SELECT * FROM test_runs WHERE test_plan_id IN (SELECT id FROM test_plans WHERE project_id = $1)', [projectId]);
  for (const r of runs.rows) {
    fs.writeFileSync(
      path.join(repoPath, 'test_runs', `run-${r.id}.json`),
      JSON.stringify(r, null, 2)
    );
  }
}

// Импорт только данных этого проекта
async function importJsonProject(query: any, projectId: string, repoPath: string) {
  const fs = require('fs');
  const path = require('path');
  // Сначала импортируем проект и определяем актуальный id по git_repo_url
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
      }
    }
    // Если есть git_repo_url, ищем проект в базе по нему
    if (projectGitUrl) {
      const result = await query('SELECT id FROM projects WHERE git_repo_url = $1', [projectGitUrl]);
      if (result.rows.length) {
        actualProjectId = result.rows[0].id;
      }
    }
  }
  // Импорт тест-кейсов
  const caseDir = path.join(repoPath, 'test_cases');
  if (fs.existsSync(caseDir)) {
    const caseFiles = fs.readdirSync(caseDir, { encoding: 'utf8' });
    for (const file of caseFiles) {
      const data = JSON.parse(fs.readFileSync(path.join(caseDir, file), 'utf8'));
      data.project_id = actualProjectId;
      // Проверяем section_id
      let sectionId = data.section_id;
      if (sectionId) {
        const sectionRes = await query('SELECT id FROM test_case_sections WHERE id = $1 AND project_id = $2', [sectionId, actualProjectId]);
        if (!sectionRes.rows.length) {
          sectionId = null;
        }
      }
      await query(
        `INSERT INTO test_cases (id, project_id, test_plan_id, title, description, preconditions, steps, expected_result, priority, status, created_by, assigned_to, section_id, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
         ON CONFLICT (id) DO UPDATE SET
           project_id=$2, test_plan_id=$3, title=$4, description=$5, preconditions=$6, steps=$7, expected_result=$8, priority=$9, status=$10, created_by=$11, assigned_to=$12, section_id=$13, created_at=$14, updated_at=$15`,
        [data.id, data.project_id, data.test_plan_id, data.title, data.description, data.preconditions, data.steps, data.expected_result, data.priority, data.status, data.created_by, data.assigned_to, sectionId, data.created_at, data.updated_at]
      );
    }
  }
  // Импорт тест-планов
  const planDir = path.join(repoPath, 'test_plans');
  if (fs.existsSync(planDir)) {
    const planFiles = fs.readdirSync(planDir, { encoding: 'utf8' });
    for (const file of planFiles) {
      const data = JSON.parse(fs.readFileSync(path.join(planDir, file), 'utf8'));
      data.project_id = actualProjectId;
      await query(
        `INSERT INTO test_plans (id, project_id, name, description, status, created_by, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (id) DO UPDATE SET
           project_id=$2, name=$3, description=$4, status=$5, created_by=$6, created_at=$7, updated_at=$8`,
        [data.id, data.project_id, data.name, data.description, data.status, data.created_by, data.created_at, data.updated_at]
      );
    }
  }
  // Импорт тестовых прогонов
  const runDir = path.join(repoPath, 'test_runs');
  if (fs.existsSync(runDir)) {
    const runFiles = fs.readdirSync(runDir, { encoding: 'utf8' });
    for (const file of runFiles) {
      const data = JSON.parse(fs.readFileSync(path.join(runDir, file), 'utf8'));
      await query(
        `INSERT INTO test_runs (id, test_plan_id, name, description, status, started_by, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (id) DO UPDATE SET
           test_plan_id=$2, name=$3, description=$4, status=$5, started_by=$6, created_at=$7`,
        [data.id, data.test_plan_id, data.name, data.description, data.status, data.started_by, data.created_at]
      );
    }
  }
  // Импорт разделов (test_case_sections)
  const sectionDir = path.join(repoPath, 'test_case_sections');
  if (fs.existsSync(sectionDir)) {
    const sectionFiles = fs.readdirSync(sectionDir, { encoding: 'utf8' });
    for (const file of sectionFiles) {
      const data = JSON.parse(fs.readFileSync(path.join(sectionDir, file), 'utf8'));
      await query(
        `INSERT INTO test_case_sections (id, project_id, name, parent_id, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (id) DO UPDATE SET
           project_id=$2, name=$3, parent_id=$4, created_at=$5, updated_at=$6`,
        [data.id, actualProjectId, data.name, data.parent_id, data.created_at, data.updated_at]
      );
    }
  }
}

// /export-json и /import-json теперь используют эти функции
router.post('/export-json', async (req, res) => {
  try {
    const { query } = require('../config/database');
    await exportJsonDirect(query);
    res.json({ success: true, message: 'Экспорт завершён' });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/import-json', async (req, res) => {
  try {
    const { query } = require('../config/database');
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
    const { query } = require('../config/database');
    await importJsonProject(query, projectId, repoPath);
    res.json({ success: true, message: 'Git pull + импорт завершён' });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/push', async (req, res) => {
  try {
    const projectId = req.query.projectId as string;
    if (!projectId) {
      res.status(400).json({ success: false, error: 'projectId обязателен' });
      return;
    }
    let { repoPath, gitRepoUrl } = await getProjectRepoInfo(projectId);
    gitRepoUrl = withGitToken(gitRepoUrl);
    const { query } = require('../config/database');
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
      await git.push();
    } catch (e) {
      // Если ошибка про upstream, пробуем с --set-upstream
      await git.push(['--set-upstream', 'origin', 'main']);
    }
    res.json({ success: true, message: 'Git push + экспорт завершён' });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export default router; 