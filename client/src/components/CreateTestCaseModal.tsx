import React, { useState, useEffect } from 'react';
import AttachmentUploader from './AttachmentUploader.js';

interface TestCaseSection {
  id: string;
  project_id: string;
  parent_id: string | null;
  name: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface CreateTestCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSave: (testCase: any) => void;
  sectionId?: string | null;
  testPlanId?: string;
}

const CreateTestCaseModal: React.FC<CreateTestCaseModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onSave,
  sectionId,
  testPlanId
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    preconditions: '',
    steps: '',
    expectedResult: '',
    priority: 'medium',
    status: 'draft',
    sectionId: sectionId ?? null // uuid (string) or null
  });

  // Состояние для вложений
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileDescriptions, setFileDescriptions] = useState<Record<string, string>>({});

  const [sections, setSections] = useState<TestCaseSection[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdTestCaseId, setCreatedTestCaseId] = useState<string | null>(null);
  const [showAttachments, setShowAttachments] = useState(false);

  // Загрузка разделов проекта
  useEffect(() => {
    if (isOpen && projectId) {
      loadSections();
    }
  }, [isOpen, projectId]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        const form = document.getElementById('create-testcase-form') as HTMLFormElement | null;
        if (form) form.requestSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setFormData(f => ({
        ...f,
        title: '',
        description: '',
        preconditions: '',
        steps: '',
        expectedResult: '',
        priority: 'medium',
        status: 'draft',
        sectionId: sectionId ?? null
      }));
    }
  }, [isOpen, sectionId]);

  const loadSections = async () => {
    try {
      setLoadingSections(true);
      const response = await fetch(`/api/test-case-sections/project/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setSections(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки разделов:', error);
    } finally {
      setLoadingSections(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.steps.trim() || !formData.expectedResult.trim()) {
      setError('Заполните все обязательные поля');
      return;
    }
    
    const payload = {
      ...formData,
      projectId,
      sectionId: formData.sectionId,
      testPlanId: testPlanId || undefined
    };
    
    try {
      // Создаем тест-кейс
      const response = await fetch('/api/test-cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const newTestCase = await response.json();
        
        // Загружаем вложения, если они есть
        if (selectedFiles.length > 0) {
          try {
            await uploadAttachments(newTestCase.id);
          } catch (uploadError) {
            console.error('Ошибка загрузки вложений:', uploadError);
            // Не прерываем создание тест-кейса, если вложения не загрузились
          }
        }
        
        setCreatedTestCaseId(newTestCase.id);
        setShowAttachments(true);
        onSave(newTestCase);
      } else {
        const error = await response.json();
        setError(error.error || 'Ошибка создания тест-кейса');
      }
    } catch (error) {
      console.error('Ошибка создания тест-кейса:', error);
      setError('Ошибка создания тест-кейса');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
    
    // Инициализируем описания для новых файлов
    const newDescriptions: Record<string, string> = {};
    files.forEach(file => {
      newDescriptions[file.name] = '';
    });
    setFileDescriptions(prev => ({ ...prev, ...newDescriptions }));
  };

  const handleRemoveFile = (fileName) => {
    setSelectedFiles(prev => prev.filter(file => file.name !== fileName));
    setFileDescriptions(prev => {
      const newDescriptions = { ...prev };
      delete newDescriptions[fileName];
      return newDescriptions;
    });
  };

  const handleDescriptionChange = (fileName, description) => {
    setFileDescriptions(prev => ({
      ...prev,
      [fileName]: description
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
    return '📎';
  };

  const uploadAttachments = async (testCaseId) => {
    const uploadPromises = selectedFiles.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('testCaseId', testCaseId);
      
      const description = fileDescriptions[file.name];
      if (description && description.trim()) {
        formData.append('description', description.trim());
      }

      const response = await fetch('/api/attachments/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`Ошибка загрузки файла ${file.name}`);
      }
    });

    try {
      await Promise.all(uploadPromises);
      console.log('Все вложения успешно загружены');
    } catch (error) {
      console.error('Ошибка загрузки вложений:', error);
      throw error;
    }
  };

  const handleClose = () => {
    setFormData({ title: '', description: '', preconditions: '', steps: '', expectedResult: '', priority: 'medium', status: 'draft', sectionId: sectionId ?? null });
    setCreatedTestCaseId(null);
    setShowAttachments(false);
    setError(null);
    setSelectedFiles([]);
    setFileDescriptions({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {showAttachments ? 'Добавить вложения' : 'Создать тест-кейс'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        {showAttachments ? (
          <div>
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800">
                ✅ Тест-кейс "{formData.title}" успешно создан!
              </p>
              <p className="text-sm text-green-600 mt-1">
                Теперь вы можете добавить вложения (скриншоты, документы и т.д.)
              </p>
            </div>
            
                         {createdTestCaseId && (
               <AttachmentUploader
                 testCaseId={createdTestCaseId}
                 onAttachmentUploaded={(attachment) => {
                   console.log('Вложение загружено:', attachment);
                 }}
                 onAttachmentDeleted={(attachmentId) => {
                   console.log('Вложение удалено:', attachmentId);
                 }}
               />
             )}
            
            <div className="flex justify-end mt-6">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Завершить
              </button>
            </div>
          </div>
        ) : (
          <form id="create-testcase-form" onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 text-red-600 text-sm font-medium">{error}</div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Заголовок *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Раздел
            </label>
            <select
              value={formData.sectionId !== undefined && formData.sectionId !== null ? formData.sectionId : ''}
              onChange={(e) => setFormData({ ...formData, sectionId: e.target.value ? e.target.value : null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={(sectionId !== undefined && sectionId !== null && sectionId !== '') || loadingSections}
            >
              <option value="">Без раздела</option>
              {sections.map(section => (
                <option key={section.id} value={section.id}>{section.name}</option>
              ))}
            </select>
            {loadingSections && (
              <p className="text-sm text-gray-500 mt-1">Загрузка разделов...</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Предусловия
            </label>
            <textarea
              value={formData.preconditions}
              onChange={(e) => setFormData({ ...formData, preconditions: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Что должно быть выполнено перед тестированием"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Шаги выполнения
            </label>
            <textarea
              value={formData.steps}
              onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="1. Открыть приложение&#10;2. Войти в систему&#10;3. Перейти в раздел..."
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ожидаемый результат
            </label>
            <textarea
              value={formData.expectedResult}
              onChange={(e) => setFormData({ ...formData, expectedResult: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Приоритет
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
                <option value="critical">Критический</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Статус
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Черновик</option>
                <option value="ready">Готов к тестированию</option>
                <option value="in_progress">В процессе</option>
                <option value="completed">Завершен</option>
              </select>
            </div>
          </div>

                     {/* Секция вложений */}
           <div className="mb-6">
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Вложения
             </label>
             
             {/* Кнопка добавления файлов */}
             <label className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer w-fit">
               <input
                 type="file"
                 onChange={handleFileSelect}
                 className="hidden"
                 accept="*/*"
                 multiple
               />
               📎 Добавить файлы
             </label>
             
             {/* Список выбранных файлов */}
             {selectedFiles.length > 0 && (
               <div className="mt-3 space-y-2">
                 <p className="text-sm text-gray-600">Выбранные файлы:</p>
                 {selectedFiles.map((file, index) => (
                   <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 border border-gray-200 rounded-md">
                     <span className="text-lg">{getFileIcon(file.type)}</span>
                     <div className="flex-1 min-w-0">
                       <p className="font-medium text-gray-900 truncate">{file.name}</p>
                       <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                     </div>
                     <div className="flex gap-2">
                       <input
                         type="text"
                         placeholder="Описание файла..."
                         value={fileDescriptions[file.name] || ''}
                         onChange={(e) => handleDescriptionChange(file.name, e.target.value)}
                         className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                       />
                       <button
                         type="button"
                         onClick={() => handleRemoveFile(file.name)}
                         className="px-2 py-1 text-red-600 hover:text-red-700 text-sm"
                       >
                         ✕
                       </button>
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>

           <div className="flex justify-end space-x-3">
             <button
               type="button"
               onClick={handleClose}
               className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
             >
               Отмена
             </button>
             <button
               type="submit"
               className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
             >
               Создать
             </button>
           </div>
        </form>
        )}
      </div>
    </div>
  );
};

export default CreateTestCaseModal; 