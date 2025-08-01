import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
const router = express.Router();

// Создаем папку для загрузок, если её нет
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Генерируем уникальное имя файла
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB максимум
  },
  fileFilter: (req, file, cb) => {
    // Разрешаем только определенные типы файлов
    const allowedTypes = [
      // Изображения
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      // Документы
      'application/pdf', 
      'text/plain', 'text/csv', 'text/html', 'text/css', 'text/javascript',
      // JSON и XML
      'application/json', 'application/xml', 'text/xml',
      // Excel файлы
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      // Word файлы
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // Архивы
      'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
      // Другие популярные форматы
      'application/xml', 'text/xml', 'application/yaml', 'text/yaml',
      'application/x-yaml', 'text/x-yaml'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      // Для отладки выводим тип файла
      console.log('Неподдерживаемый тип файла:', file.mimetype, 'для файла:', file.originalname);
      cb(new Error('Неподдерживаемый тип файла'));
    }
  }
});

// Получить все вложения тест-кейса
router.get('/test-case/:testCaseId', async (req: Request, res: Response) => {
  try {
    const { testCaseId } = req.params;
    const result = await query(`
      SELECT 
        a.*,
        u.username as uploaded_by_name
      FROM attachments a
      LEFT JOIN users u ON a.uploaded_by = u.id
      WHERE a.test_case_id = $1
      ORDER BY a.created_at DESC
    `, [testCaseId]);
    
    return res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения вложений:', error);
    return res.status(500).json({ error: 'Ошибка получения вложений' });
  }
});

// Загрузить вложение
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не был загружен' });
    }

    const { testCaseId, description } = req.body;
    
    if (!testCaseId) {
      return res.status(400).json({ error: 'ID тест-кейса обязателен' });
    }

    // Сохраняем информацию о файле в базе данных
    const result = await query(`
      INSERT INTO attachments (
        test_case_id, filename, original_filename, file_path, 
        file_size, mime_type, description, uploaded_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *
    `, [
      testCaseId,
      req.file.filename,
      req.file.originalname,
      req.file.path,
      req.file.size,
      req.file.mimetype,
      description || null,
      '00000000-0000-0000-0000-000000000001' // admin user
    ]);

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка загрузки файла:', error);
    return res.status(500).json({ error: 'Ошибка загрузки файла' });
  }
});

// Скачать вложение
router.get('/download/:attachmentId', async (req: Request, res: Response) => {
  try {
    const { attachmentId } = req.params;
    
    const result = await query(`
      SELECT * FROM attachments WHERE id = $1
    `, [attachmentId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Вложение не найдено' });
    }
    
    const attachment = result.rows[0];
    const filePath = attachment.file_path;
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Файл не найден на сервере' });
    }
    
    // Устанавливаем заголовки для скачивания
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.original_filename}"`);
    res.setHeader('Content-Type', attachment.mime_type);
    res.setHeader('Content-Length', attachment.file_size);
    
    // Отправляем файл
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    return; // Явно возвращаем undefined для завершения функции
  } catch (error) {
    console.error('Ошибка скачивания файла:', error);
    return res.status(500).json({ error: 'Ошибка скачивания файла' });
  }
});

// Удалить вложение
router.delete('/:attachmentId', async (req: Request, res: Response) => {
  try {
    const { attachmentId } = req.params;
    
    // Получаем информацию о файле
    const result = await query(`
      SELECT * FROM attachments WHERE id = $1
    `, [attachmentId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Вложение не найдено' });
    }
    
    const attachment = result.rows[0];
    
    // Удаляем файл с диска
    if (fs.existsSync(attachment.file_path)) {
      fs.unlinkSync(attachment.file_path);
    }
    
    // Удаляем запись из базы данных
    await query(`
      DELETE FROM attachments WHERE id = $1
    `, [attachmentId]);
    
    return res.json({ message: 'Вложение успешно удалено' });
  } catch (error) {
    console.error('Ошибка удаления вложения:', error);
    return res.status(500).json({ error: 'Ошибка удаления вложения' });
  }
});

// Обновить описание вложения
router.put('/:attachmentId', async (req: Request, res: Response) => {
  try {
    const { attachmentId } = req.params;
    const { description } = req.body;
    
    const result = await query(`
      UPDATE attachments 
      SET description = $1 
      WHERE id = $2 
      RETURNING *
    `, [description, attachmentId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Вложение не найдено' });
    }
    
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка обновления вложения:', error);
    return res.status(500).json({ error: 'Ошибка обновления вложения' });
  }
});

export default router; 