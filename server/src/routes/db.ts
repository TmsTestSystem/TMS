import { Router, Request, Response } from 'express';
import { exec } from 'child_process';
import path from 'path';
import multer from 'multer';
import fs from 'fs';

const router = Router();

const upload = multer({ dest: '/tmp' });

// Эндпоинт для скачивания дампа базы данных
router.get('/dump', async (req: Request, res: Response) => {
  // Путь для временного файла дампа
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  const dumpFile = path.join('/tmp', `dump_${dateStr}.sql`);
  const user = process.env.DB_USER || 'tms_user';
  const db = process.env.DB_NAME || 'tms_spr';
  const host = process.env.DB_HOST || 'tms-postgres';
  const port = process.env.DB_PORT || '5432';

  const dumpCmd = `pg_dump -h ${host} -p ${port} -U ${user} ${db} > ${dumpFile}`;

  exec(dumpCmd, { env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD || 'tms_password' } }, (error) => {
    if (error) {
      res.status(500).json({ error: 'Ошибка создания дампа', details: error.message });
      return;
    }
    // Копируем дамп в папку db_init/dumps
    const projectDumpDir = path.join(process.cwd(), 'db_init', 'dumps');
    if (!fs.existsSync(projectDumpDir)) {
      fs.mkdirSync(projectDumpDir, { recursive: true });
    }
    const projectDumpFile = path.join(projectDumpDir, `dump-${dateStr}.sql`);
    fs.copyFileSync(dumpFile, projectDumpFile);
    // Отправляем файл дампа пользователю
    res.download(dumpFile, `dump-${dateStr}.sql`, (err) => {
      fs.unlink(dumpFile, () => {});
      if (err) {
        res.status(500).json({ error: 'Ошибка отправки дампа', details: err.message });
        return;
      }
      return;
    });
    return;
  });
});

// Эндпоинт для импорта дампа базы данных
router.post('/import', upload.single('dump'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'Файл не был загружен' });
    return;
  }
  const dumpFile = req.file.path;
  const user = process.env.DB_USER || 'tms_user';
  const db = process.env.DB_NAME || 'tms_spr';
  const host = process.env.DB_HOST || 'tms-postgres';
  const port = process.env.DB_PORT || '5432';

  // Сначала очищаем базу
  const dropCmd = `psql -h ${host} -p ${port} -U ${user} -d ${db} -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"`;
  exec(dropCmd, { env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD || 'tms_password' }, shell: '/bin/sh' }, (dropErr, dropStdout, dropStderr) => {
    if (dropErr) {
      fs.unlink(dumpFile, () => {});
      res.status(500).json({ error: 'Ошибка очистки базы перед импортом', details: dropStderr || dropErr.message });
      return;
    }
    // Затем импортируем дамп
    const importCmd = `psql -h ${host} -p ${port} -U ${user} -d ${db} < ${dumpFile}`;
    exec(importCmd, { env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD || 'tms_password' }, shell: '/bin/sh' }, (error, stdout, stderr) => {
      fs.unlink(dumpFile, () => {});
      if (error) {
        res.status(500).json({ error: 'Ошибка импорта дампа', details: stderr || error.message });
        return;
      }
      res.json({ success: true, message: 'Дамп успешно импортирован' });
      return;
    });
    return;
  });
  return;
});

// Эндпоинт для получения информации о дампах
router.get('/dumps-info', async (req: Request, res: Response) => {
  const fs = require('fs');
  const path = require('path');
  // Дампы в репозитории
  const dumpsDir = path.join(process.cwd(), 'db_init', 'dumps');
  let repoDumps: { name: string, mtime: number }[] = [];
  if (fs.existsSync(dumpsDir)) {
    repoDumps = fs.readdirSync(dumpsDir)
      .filter((f: string) => f.endsWith('.sql'))
      .map((f: string) => {
        const stat = fs.statSync(path.join(dumpsDir, f));
        return { name: f, mtime: stat.mtimeMs };
      });
  }
  // Дампы, которые есть локально (например, в /tmp)
  const localDir = '/tmp';
  let localDumps: string[] = [];
  if (fs.existsSync(localDir)) {
    localDumps = fs.readdirSync(localDir)
      .filter((f: string) => f.startsWith('dump_') && f.endsWith('.sql'));
  }
  res.json({ repoDumps, localDumps });
});

export default router; 