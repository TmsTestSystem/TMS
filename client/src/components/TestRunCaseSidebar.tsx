import React, { useRef, useState, useEffect } from 'react';
import { XMarkIcon, PlayIcon, PauseIcon, StopIcon, PencilIcon, TagIcon, CheckCircleIcon, ExclamationTriangleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface TestResult {
  id: number;
  test_case_id: number;
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

const TestRunCaseSidebar: React.FC<TestRunCaseSidebarProps> = ({ isOpen, onClose, testResult, timerData, onPause, onStart, onStop, onEdit, formatTime }) => {
  const [width, setWidth] = useState(520);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);

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
      </div>
    </div>
  );
};

export default TestRunCaseSidebar; 