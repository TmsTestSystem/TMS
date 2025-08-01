import React, { useEffect, useRef, useState } from 'react';
import { XMarkIcon, PencilIcon, ClockIcon, TagIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import AttachmentUploader from './AttachmentUploader.js';

interface TestCase {
  id: string;
  title: string;
  description?: string;
  preconditions?: string;
  steps?: string;
  expectedResult?: string;
  expected_result?: string;
  priority: string;
  status: string;
  is_deleted?: boolean;
  deleted_at?: string;
  createdAt?: string;
}

interface TestCaseSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  testCase: TestCase | null;
  onEdit: () => void;
}

const TestCaseSidebar: React.FC<TestCaseSidebarProps> = ({ isOpen, onClose, testCase, onEdit }) => {
  const [currentTestCase, setCurrentTestCase] = useState<TestCase | null>(null);
  const [width, setWidth] = useState(400);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);

  useEffect(() => {
    if (testCase) {
      setCurrentTestCase(testCase);
    }
  }, [testCase]);

  // Drag-resize logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = window.innerWidth - e.clientX;
      setWidth(Math.max(320, Math.min(700, newWidth)));
    };
    const handleMouseUp = () => {
      isResizing.current = false;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (!isOpen || !currentTestCase) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="w-4 h-4" />;
      case 'in_progress': return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'ready': return <InformationCircleIcon className="w-4 h-4" />;
      case 'draft': return <DocumentTextIcon className="w-4 h-4" />;
      default: return <DocumentTextIcon className="w-4 h-4" />;
    }
  };

  // Ограничение ширины: всегда максимум
  const sidebarWidth = Math.min(window.innerWidth, 700);
  return (
    <div
      ref={sidebarRef}
      className="fixed top-0 right-0 h-full bg-white border-l border-gray-200 flex flex-col z-40 shadow-lg"
      style={{ minWidth: 320, maxWidth: 700, width: sidebarWidth }}
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
            <h2
              className="text-xl font-bold leading-tight mr-2 break-words"
              style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}
              title={currentTestCase.title}
            >
              {currentTestCase.title}
            </h2>
            {/* Кнопка редактирования убрана */}
          </div>
          <div className="flex items-center gap-4 text-sm text-blue-100">
            <div className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              {currentTestCase.createdAt && new Date(currentTestCase.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <TagIcon className="w-4 h-4" />
              ID: {currentTestCase.id}
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
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(currentTestCase.priority)}`}>
              {currentTestCase.priority === 'critical' && 'Критический'}
              {currentTestCase.priority === 'high' && 'Высокий'}
              {currentTestCase.priority === 'medium' && 'Средний'}
              {currentTestCase.priority === 'low' && 'Низкий'}
            </span>
          </div>

          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon(currentTestCase.status)}
              <span className="text-sm font-medium text-gray-600">Статус</span>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(currentTestCase.status)}`}>
              {currentTestCase.status === 'completed' && 'Завершен'}
              {currentTestCase.status === 'in_progress' && 'В процессе'}
              {currentTestCase.status === 'ready' && 'Готов к тестированию'}
              {currentTestCase.status === 'draft' && 'Черновик'}
            </span>
          </div>
        </div>

        {/* Description */}
        {currentTestCase.description && (
          <div className="bg-white border rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <InformationCircleIcon className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-800">Описание</h3>
            </div>
            <div className="text-gray-700 break-words whitespace-pre-line leading-relaxed" title={currentTestCase.description}>
              {currentTestCase.description && currentTestCase.description.length > 300
                ? currentTestCase.description.slice(0, 300) + '…'
                : currentTestCase.description}
            </div>
          </div>
        )}

        {/* Preconditions */}
        {currentTestCase.preconditions && (
          <div className="bg-white border rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-800">Предусловия</h3>
            </div>
            <div className="text-gray-700 break-words whitespace-pre-line leading-relaxed" title={currentTestCase.preconditions}>
              {currentTestCase.preconditions && currentTestCase.preconditions.length > 200
                ? currentTestCase.preconditions.slice(0, 200) + '…'
                : currentTestCase.preconditions}
            </div>
          </div>
        )}

        {/* Steps */}
        {currentTestCase.steps && (
          <div className="bg-white border rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <DocumentTextIcon className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-800">Шаги выполнения</h3>
            </div>
            <ol className="list-decimal list-inside text-gray-700 text-sm space-y-1">
              {currentTestCase.steps && currentTestCase.steps.length > 300
                ? <li className="break-words whitespace-pre-line max-w-full overflow-x-auto">{currentTestCase.steps.slice(0, 300) + '…'}</li>
                : currentTestCase.steps?.split(/\n|\r|\d+\./).filter(s => s.trim()).map((step, idx) => (
                  <li key={idx} className="break-words whitespace-pre-line max-w-full" style={{overflowX: /\S{30,}/.test(step) ? 'auto' : 'visible'}}>{step.trim()}</li>
                ))}
            </ol>
          </div>
        )}

        {/* Expected Result */}
        {(currentTestCase.expectedResult || currentTestCase.expected_result) && (
          <div className="bg-white border rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-800">Ожидаемый результат</h3>
            </div>
            <div className="text-gray-700 break-words whitespace-pre-line leading-relaxed text-sm" title={currentTestCase.expectedResult || currentTestCase.expected_result || ''}>
              {(currentTestCase.expectedResult || currentTestCase.expected_result) && (currentTestCase.expectedResult || currentTestCase.expected_result || '').length > 200
                ? (currentTestCase.expectedResult || currentTestCase.expected_result || '').slice(0, 200) + '…'
                : (currentTestCase.expectedResult || currentTestCase.expected_result || '')}
            </div>
          </div>
        )}

        {/* Attachments */}
        <div className="bg-white border rounded-lg p-4 mb-6 shadow-sm">
          <AttachmentUploader
            testCaseId={currentTestCase.id}
            onAttachmentUploaded={(attachment) => {
              console.log('Вложение загружено:', attachment);
            }}
            onAttachmentDeleted={(attachmentId) => {
              console.log('Вложение удалено:', attachmentId);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const TestCaseSidebarView: React.FC<{
  testCase: TestCase,
  getPriorityColor: (priority: string) => string,
  getStatusIcon: (status: string) => JSX.Element,
  getStatusColor: (status: string) => string,
}> = ({ testCase, getPriorityColor, getStatusIcon, getStatusColor }) => (
  <div className="w-full bg-gray-50 rounded-lg shadow p-0">
    <div className="text-red-600 font-bold text-center">TEST CHANGE</div>
    {/* Header */}
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
      <div className="flex-1 pr-4">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-lg font-bold leading-tight mr-2">{testCase.title}</h2>
        </div>
        <div className="flex items-center gap-4 text-xs text-blue-100">
          <div className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4" />
            {testCase.createdAt && new Date(testCase.createdAt).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1">
            <TagIcon className="w-4 h-4" />
            ID: {testCase.id}
          </div>
        </div>
      </div>
    </div>
    {/* Status Cards */}
    <div className="grid grid-cols-2 gap-4 px-6 pt-4">
      <div className="bg-white rounded-lg p-4 shadow">
        <div className="flex items-center gap-2 mb-2">
          <TagIcon className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-600">Приоритет</span>
        </div>
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${getPriorityColor(testCase.priority)}`}> 
          {testCase.priority === 'critical' && 'Критический'}
          {testCase.priority === 'high' && 'Высокий'}
          {testCase.priority === 'medium' && 'Средний'}
          {testCase.priority === 'low' && 'Низкий'}
        </span>
      </div>
      <div className="bg-white rounded-lg p-4 shadow">
        <div className="flex items-center gap-2 mb-2">
          {getStatusIcon(testCase.status)}
          <span className="text-xs font-medium text-gray-600">Статус</span>
        </div>
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${getStatusColor(testCase.status)}`}> 
          {testCase.status === 'completed' && 'Завершен'}
          {testCase.status === 'in_progress' && 'В процессе'}
          {testCase.status === 'ready' && 'Готов к тестированию'}
          {testCase.status === 'draft' && 'Черновик'}
        </span>
      </div>
    </div>
    {/* Description */}
    {testCase.description && (
      <div className="bg-white rounded-lg p-4 mx-6 mb-4 mt-4 shadow">
        <div className="flex items-center gap-2 mb-2">
          <InformationCircleIcon className="w-5 h-5 text-blue-500" />
          <h3 className="text-base font-semibold text-gray-800">Описание</h3>
        </div>
        <div className="text-gray-700 break-words whitespace-pre-line leading-relaxed text-sm">
          {testCase.description}
        </div>
      </div>
    )}
    {/* Preconditions */}
    {testCase.preconditions && (
      <div className="bg-white rounded-lg p-4 mx-6 mb-4 shadow">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircleIcon className="w-5 h-5 text-green-500" />
          <h3 className="text-base font-semibold text-gray-800">Предусловия</h3>
        </div>
        <div className="text-gray-700 break-words whitespace-pre-line leading-relaxed text-sm">
          {testCase.preconditions}
        </div>
      </div>
    )}
    {/* Steps */}
    {testCase.steps && (
      <div className="bg-white rounded-lg p-4 mx-6 mb-4 shadow">
        <div className="flex items-center gap-2 mb-2">
          <DocumentTextIcon className="w-5 h-5 text-purple-500" />
          <h3 className="text-base font-semibold text-gray-800">Шаги выполнения</h3>
        </div>
        <ol className="list-decimal list-inside text-gray-700 text-sm space-y-1">
          {testCase.steps.split(/\n|\r|\d+\./).filter(s => s.trim()).map((step, idx) => (
            <li key={idx}>{step.trim()}</li>
          ))}
        </ol>
      </div>
    )}
    {/* Expected Result */}
    {testCase.expectedResult && (
      <div className="bg-white rounded-lg p-4 mx-6 mb-4 shadow">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircleIcon className="w-5 h-5 text-blue-500" />
          <h3 className="text-base font-semibold text-gray-800">Ожидаемый результат</h3>
        </div>
        <div className="text-gray-700 break-words whitespace-pre-line leading-relaxed text-sm">
          {testCase.expectedResult}
        </div>
      </div>
    )}
  </div>
);

export default TestCaseSidebar; 