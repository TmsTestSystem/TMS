"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ dest: '/tmp' });
router.get('/dump', async (req, res) => {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    const dumpFile = path_1.default.join('/tmp', `dump_${dateStr}.sql`);
    const user = process.env.DB_USER || 'tms_user';
    const db = process.env.DB_NAME || 'tms_spr';
    const host = process.env.DB_HOST || 'tms-postgres';
    const port = process.env.DB_PORT || '5432';
    const dumpCmd = `pg_dump -h ${host} -p ${port} -U ${user} ${db} > ${dumpFile}`;
    (0, child_process_1.exec)(dumpCmd, { env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD || 'tms_password' } }, (error) => {
        if (error) {
            res.status(500).json({ error: 'Ошибка создания дампа', details: error.message });
            return;
        }
        const projectDumpDir = path_1.default.join(process.cwd(), 'db_init', 'dumps');
        if (!fs_1.default.existsSync(projectDumpDir)) {
            fs_1.default.mkdirSync(projectDumpDir, { recursive: true });
        }
        const projectDumpFile = path_1.default.join(projectDumpDir, `dump-${dateStr}.sql`);
        fs_1.default.copyFileSync(dumpFile, projectDumpFile);
        res.download(dumpFile, `dump-${dateStr}.sql`, (err) => {
            fs_1.default.unlink(dumpFile, () => { });
            if (err) {
                res.status(500).json({ error: 'Ошибка отправки дампа', details: err.message });
                return;
            }
            return;
        });
        return;
    });
});
router.post('/import', upload.single('dump'), async (req, res) => {
    if (!req.file) {
        res.status(400).json({ error: 'Файл не был загружен' });
        return;
    }
    const dumpFile = req.file.path;
    const user = process.env.DB_USER || 'tms_user';
    const db = process.env.DB_NAME || 'tms_spr';
    const host = process.env.DB_HOST || 'tms-postgres';
    const port = process.env.DB_PORT || '5432';
    const dropCmd = `psql -h ${host} -p ${port} -U ${user} -d ${db} -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"`;
    (0, child_process_1.exec)(dropCmd, { env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD || 'tms_password' }, shell: '/bin/sh' }, (dropErr, dropStdout, dropStderr) => {
        if (dropErr) {
            fs_1.default.unlink(dumpFile, () => { });
            res.status(500).json({ error: 'Ошибка очистки базы перед импортом', details: dropStderr || dropErr.message });
            return;
        }
        const importCmd = `psql -h ${host} -p ${port} -U ${user} -d ${db} < ${dumpFile}`;
        (0, child_process_1.exec)(importCmd, { env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD || 'tms_password' }, shell: '/bin/sh' }, (error, stdout, stderr) => {
            fs_1.default.unlink(dumpFile, () => { });
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
router.get('/dumps-info', async (req, res) => {
    const fs = require('fs');
    const path = require('path');
    const dumpsDir = path.join(process.cwd(), 'db_init', 'dumps');
    let repoDumps = [];
    if (fs.existsSync(dumpsDir)) {
        repoDumps = fs.readdirSync(dumpsDir)
            .filter((f) => f.endsWith('.sql'))
            .map((f) => {
            const stat = fs.statSync(path.join(dumpsDir, f));
            return { name: f, mtime: stat.mtimeMs };
        });
    }
    const localDir = '/tmp';
    let localDumps = [];
    if (fs.existsSync(localDir)) {
        localDumps = fs.readdirSync(localDir)
            .filter((f) => f.startsWith('dump_') && f.endsWith('.sql'));
    }
    res.json({ repoDumps, localDumps });
});
exports.default = router;
//# sourceMappingURL=db.js.map