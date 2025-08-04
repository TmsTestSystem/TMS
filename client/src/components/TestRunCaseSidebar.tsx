import React, { useRef, useState, useEffect } from 'react';
import { XMarkIcon, PlayIcon, PauseIcon, StopIcon, PencilIcon, TagIcon, CheckCircleIcon, ExclamationTriangleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface Attachment {
  id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  description?: string;
  uploaded_by_name?: string;
  created_at: string;
}

interface TestResult {
  id: string;
  test_case_id: string;
  test_case_title: string;
  test_case_description?: string;
  test_case_priority: string;
  status: string;
  notes?: string;
  duration?: number;
  executed_by_name?: string;
  executed_at?: string;
  preconditions?: string;
  steps?: string;
  expected_result?: string;
}

interface TimerData {
  running: boolean;
  seconds: number;
  paused: boolean;
}

interface TestRunCaseSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  testResult: TestResult | null;
  timerData?: TimerData;
  onPause: (result: TestResult) => void;
  onStart: (result: TestResult) => void;
  onStop: (result: TestResult) => void;
  onEdit: (result: TestResult) => void;
  formatTime: (sec: number) => string;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800 border-red-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};
const getStatusColor = (status: string) => {
  switch (status) {
    case 'passed': return 'bg-green-100 text-green-800 border-green-200';
    case 'failed': return 'bg-red-100 text-red-800 border-red-200';
    case 'blocked': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'not_run': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'passed': return <CheckCircleIcon className="w-4 h-4" />;
    case 'failed': return <ExclamationTriangleIcon className="w-4 h-4" />;
    case 'blocked': return <PauseIcon className="w-4 h-4" />;
    case 'in_progress': return <PlayIcon className="w-4 h-4" />;
    case 'not_run': return <DocumentTextIcon className="w-4 h-4" />;
    default: return <DocumentTextIcon className="w-4 h-4" />;
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Б';
  const k = 1024;
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const canPreview = (mimeType: string) => {
  const previewableTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'text/plain', 'text/csv', 'text/html', 'text/css', 'text/javascript',
    'application/json', 'application/xml', 'text/xml',
    'application/pdf'
  ];
  return previewableTypes.includes(mimeType);
};

const TestRunCaseSidebar: React.FC<TestRunCaseSidebarProps> = ({ isOpen, onClose, testResult, timerData, onPause, onStart, onStop, onEdit, formatTime }) => {
  const [width, setWidth] = useState(520);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);

  // Функция загрузки вложений
  const fetchAttachments = async (testCaseId: string) => {
    setAttachmentsLoading(true);
    try {
      const response = await fetch(`/api/attachments/test-case/${testCaseId}`);
      if (response.ok) {
        const data = await response.json();
        setAttachments(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки вложений:', error);
    } finally {
      setAttachmentsLoading(false);
    }
  };

  // Загружаем вложения при изменении тест-кейса
  useEffect(() => {
    if (testResult?.test_case_id) {
      fetchAttachments(testResult.test_case_id);
    }
  }, [testResult?.test_case_id]);

  // Загружаем содержимое текстового файла при открытии предварительного просмотра
  useEffect(() => {
    if (previewAttachment) {
      const isTextFile = previewAttachment.mime_type.startsWith('text/') || 
                        previewAttachment.mime_type === 'application/json' || 
                        previewAttachment.mime_type === 'application/xml';
      
      if (isTextFile) {
        const loadTextContent = async () => {
          try {
            const response = await fetch(`/api/attachments/download/${previewAttachment.id}`);
            if (response.ok) {
              const text = await response.text();
              const codeElement = document.getElementById('file-content');
              if (codeElement) {
                codeElement.textContent = text;
              }
            }
          } catch (error) {
            console.error('Ошибка загрузки содержимого файла:', error);
            const codeElement = document.getElementById('file-content');
            if (codeElement) {
              codeElement.textContent = 'Ошибка загрузки содержимого файла';
            }
          }
        };
        
        // Небольшая задержка для рендеринга модального окна
        setTimeout(loadTextContent, 100);
      }
    }
  }, [previewAttachment]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = window.innerWidth - e.clientX;
      setWidth(Math.max(320, Math.min(700, newWidth)));
    };
    const handleMouseUp = () => { isResizing.current = false; };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (!isOpen || !testResult) return null;

  const seconds = timerData?.seconds || 0;
  const running = timerData?.running || false;
  const paused = timerData?.paused || false;
  const showDuration = (testResult.status === 'passed' || testResult.status === 'failed') && testResult.duration !== undefined;

  return (
    <div
      ref={sidebarRef}
      className="fixed top-0 right-0 h-full bg-white border-l border-gray-200 flex flex-col z-40 shadow-lg"
      style={{ minWidth: 400, maxWidth: 800, width }}
    >
      {/* Drag handle */}
      <div
        className="absolute left-0 top-0 h-full w-2 cursor-ew-resize z-50 bg-transparent hover:bg-blue-100 transition-colors"
        onMouseDown={() => { isResizing.current = true; }}
        style={{ cursor: 'ew-resize' }}
        title="Потяните, чтобы изменить ширину"
      />
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-start justify-between">
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-bold leading-tight mr-2">{testResult.test_case_title}</h2>
          </div>
          <div className="flex items-center gap-4 text-sm text-blue-100">
            <div className="flex items-center gap-1">
              <TagIcon className="w-4 h-4" />
              ID: {testResult.test_case_id}
            </div>
          </div>
        </div>
        <button
          className="btn-icon-sm text-white bg-blue-500 hover:bg-blue-600 rounded-full p-1 shadow ml-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          onClick={onClose}
          aria-label="Закрыть"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TagIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">Приоритет</span>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(testResult.test_case_priority)}`}>
              {testResult.test_case_priority === 'high' && 'Высокий'}
              {testResult.test_case_priority === 'medium' && 'Средний'}
              {testResult.test_case_priority === 'low' && 'Низкий'}
            </span>
          </div>
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon(testResult.status)}
              <span className="text-sm font-medium text-gray-600">Статус</span>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(testResult.status)}`}>
              {testResult.status === 'passed' && 'Выполнен'}
              {testResult.status === 'failed' && 'Ошибка'}
              {testResult.status === 'blocked' && 'Заблокирован'}
              {testResult.status === 'in_progress' && 'В процессе'}
              {testResult.status === 'not_run' && 'Не выполнен'}
            </span>
          </div>
        </div>
        {/* Управление (таймер, кнопки) */}
        <div className="flex items-center gap-2 mb-6">
          <span className="font-mono text-sm">{showDuration ? formatTime(testResult.duration ?? 0) : formatTime(seconds)}</span>
          {running ? (
            <>
              <button className="btn-icon-sm" onClick={() => onPause(testResult)}>
                {paused ? <PlayIcon className="w-4 h-4" /> : <PauseIcon className="w-4 h-4" />}
              </button>
              <button className="btn-icon-sm" onClick={() => onStop(testResult)}>
                <StopIcon className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button className="btn-icon-sm" onClick={() => onStart(testResult)}>
              <PlayIcon className="w-4 h-4" />
            </button>
          )}
          {(testResult.status === 'passed' || testResult.status === 'failed') && (
            <button className="btn-icon-sm" onClick={() => onEdit(testResult)}>
              <PencilIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        {/* Описание */}
        <div className="bg-white border rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <DocumentTextIcon className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-800">Описание</h3>
          </div>
          <div className="text-gray-700 whitespace-pre-line leading-relaxed">
            {testResult.test_case_description || '-'}
          </div>
        </div>
        {/* Предусловия */}
        {testResult.preconditions && (
          <div className="bg-white border rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-800">Предусловия</h3>
            </div>
            <div className="text-gray-700 whitespace-pre-line leading-relaxed">
              {testResult.preconditions}
            </div>
          </div>
        )}
        {/* Шаги */}
        {testResult.steps && (
          <div className="bg-white border rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <DocumentTextIcon className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-800">Шаги выполнения</h3>
            </div>
            <div className="text-gray-700 whitespace-pre-line leading-relaxed">
              {testResult.steps}
            </div>
          </div>
        )}
        {/* Ожидаемый результат */}
        {testResult.expected_result && (
          <div className="bg-white border rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircleIcon className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-800">Ожидаемый результат</h3>
            </div>
            <div className="text-gray-700 whitespace-pre-line leading-relaxed">
              {testResult.expected_result}
            </div>
          </div>
        )}
        {/* Комментарий */}
        {testResult.notes && (
          <div className="bg-white border rounded-lg p-4 mb-6 shadow-sm">
            <div className="font-semibold text-xs text-gray-500 mb-1">Комментарий</div>
            <div className="text-sm bg-gray-50 rounded p-2">{testResult.notes}</div>
          </div>
        )}
        {/* Атачи */}
        <div className="bg-white border rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-800">Атачи</h3>
          </div>
          {attachmentsLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Загрузка вложений...</p>
            </div>
          ) : attachments.length > 0 ? (
            <div className="space-y-3">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900 truncate" title={attachment.original_filename}>
                          {attachment.original_filename}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{formatFileSize(attachment.file_size)}</span>
                        <span>{attachment.mime_type}</span>
                        {attachment.uploaded_by_name && (
                          <span>Загружен: {attachment.uploaded_by_name}</span>
                        )}
                      </div>
                      {attachment.description && (
                        <p className="text-xs text-gray-600 mt-1">{attachment.description}</p>
                      )}
                    </div>
                                         <div className="ml-2 flex gap-1">
                       {canPreview(attachment.mime_type) && (
                         <button
                           onClick={() => setPreviewAttachment(attachment)}
                           className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                           title="Просмотреть файл"
                         >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                           </svg>
                         </button>
                       )}
                       <a
                         href={`/api/attachments/download/${attachment.id}`}
                         download={attachment.original_filename}
                         className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                         title="Скачать файл"
                       >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                         </svg>
                       </a>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <p className="text-sm">Вложений нет</p>
            </div>
          )}
                 </div>
       </div>
       
       {/* Модальное окно предварительного просмотра */}
       {previewAttachment && (
         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full overflow-hidden">
             <div className="flex items-center justify-between p-4 border-b border-gray-200">
               <div className="flex items-center gap-2">
                 <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                 </svg>
                 <h3 className="text-lg font-semibold text-gray-900">{previewAttachment.original_filename}</h3>
               </div>
               <div className="flex items-center gap-2">
                 <a
                   href={`/api/attachments/download/${previewAttachment.id}`}
                   download={previewAttachment.original_filename}
                   className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                   title="Скачать файл"
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                   </svg>
                 </a>
                 <button
                   onClick={() => setPreviewAttachment(null)}
                   className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                   title="Закрыть"
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </button>
               </div>
             </div>
             <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
               {previewAttachment.mime_type.startsWith('image/') ? (
                 <div className="flex justify-center">
                   <img
                     src={`/api/attachments/download/${previewAttachment.id}`}
                     alt={previewAttachment.original_filename}
                     className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                   />
                 </div>
               ) : previewAttachment.mime_type === 'application/pdf' ? (
                 <div className="w-full h-[70vh]">
                   <iframe
                     src={`/api/attachments/download/${previewAttachment.id}`}
                     className="w-full h-full border-0 rounded-lg"
                     title={previewAttachment.original_filename}
                   />
                 </div>
               ) : previewAttachment.mime_type.startsWith('text/') || previewAttachment.mime_type === 'application/json' || previewAttachment.mime_type === 'application/xml' ? (
                 <div className="bg-gray-50 rounded-lg p-4">
                   <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-auto max-h-[70vh]">
                     <code id="file-content">Загрузка содержимого...</code>
                   </pre>
                 </div>
               ) : (
                 <div className="text-center py-8">
                   <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                   </svg>
                   <p className="text-gray-600">Предварительный просмотр недоступен для этого типа файла</p>
                   <p className="text-sm text-gray-500 mt-2">Используйте кнопку скачивания для загрузки файла</p>
                 </div>
               )}
             </div>
           </div>
         </div>
       )}
     </div>
   );
 };

export default TestRunCaseSidebar; 