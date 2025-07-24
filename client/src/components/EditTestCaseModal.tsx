import React, { useState, useEffect } from 'react';

interface TestCaseSection {
  id: number;
  project_id: number;
  parent_id: number | null;
  name: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface TestCase {
  id: number;
  project_id: number;
  test_plan_id: number | null;
  section_id: number | null;
  title: string;
  description: string;
  preconditions: string;
  steps: string;
  expected_result: string;
  priority: string;
  status: string;
}

interface EditTestCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  testCase: TestCase | null;
  onSave: (testCase: TestCase) => void;
}

const EditTestCaseModal: React.FC<EditTestCaseModalProps> = ({
  isOpen,
  onClose,
  testCase,
  onSave
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    preconditions: '',
    steps: '',
    expectedResult: '',
    priority: 'medium',
    status: 'draft',
    sectionId: null as number | null
  });
  const [sections, setSections] = useState<TestCaseSection[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (testCase) {
      setFormData({
        title: testCase.title,
        description: testCase.description || '',
        preconditions: testCase.preconditions || '',
        steps: testCase.steps || '',
        expectedResult: testCase.expected_result || '',
        priority: testCase.priority,
        status: testCase.status,
        sectionId: testCase.section_id || null
      });
      loadSections(testCase.project_id);
    }
  }, [testCase]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        const form = document.getElementById('edit-testcase-form') as HTMLFormElement | null;
        if (form) form.requestSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const loadSections = async (projectId: number) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.steps.trim() || !formData.expectedResult.trim()) {
      setError('Поля "Заголовок", "Шаги выполнения" и "Ожидаемый результат" обязательны для заполнения.');
      return;
    }
    setError(null);
    if (!testCase) return;
    onSave({
      ...testCase,
      ...formData,
      section_id: formData.sectionId,
    });
    onClose();
  };

  if (!isOpen || !testCase) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Редактировать тест-кейс</h2>
        <form id="edit-testcase-form" onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 text-red-600 text-sm font-medium">{error}</div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Заголовок *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Раздел</label>
            <select
              value={formData.sectionId || ''}
              onChange={(e) => setFormData({ ...formData, sectionId: e.target.value ? Number(e.target.value) : null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loadingSections}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Предусловия</label>
            <textarea
              value={formData.preconditions}
              onChange={(e) => setFormData({ ...formData, preconditions: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Шаги выполнения</label>
            <textarea
              value={formData.steps}
              onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ожидаемый результат</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Приоритет</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
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
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTestCaseModal; 