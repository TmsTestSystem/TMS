import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface TestPlan {
  id: string;
  name: string;
  description?: string;
  status: string;
  project_name: string;
  test_cases_count?: number;
}

interface CreateTestRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (testRun: any) => void;
}

const CreateTestRunModal: React.FC<CreateTestRunModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [testPlans, setTestPlans] = useState<TestPlan[]>([]);
  const [formData, setFormData] = useState({
    testPlanId: '',
    name: '',
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchTestPlans();
      // Если имя пустое и выбран тест-план, подставить имя с датой
      setFormData(prev => ({ ...prev, name: '' }));
    }
  }, [isOpen]);

  useEffect(() => {
    // Если выбран тест-план и имя пустое, подставить имя с датой
    if (formData.testPlanId && testPlans.length > 0) {
      const plan = testPlans.find(tp => String(tp.id) === String(formData.testPlanId));
      if (plan && !formData.name) {
        const now = new Date();
        const months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
        const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
        setFormData(f => ({ ...f, name: `${plan.name} ${dateStr}` }));
      }
    }
    // eslint-disable-next-line
  }, [formData.testPlanId, testPlans]);

  const fetchTestPlans = async () => {
    try {
      const response = await fetch('/api/test-plans');
      const data = await response.json();
      setTestPlans(data); // показываем все планы
    } catch (error) {
      console.error('Ошибка загрузки тест-планов:', error);
    }
  };

  const fetchTestRunsForPlan = async (testPlanId: string) => {
    try {
      const response = await fetch('/api/test-runs');
      const data = await response.json();
      return data.filter((run: any) => String(run.test_plan_id) === String(testPlanId));
    } catch (error) {
      return [];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let name = formData.name.trim();
    let runsForPlan = await fetchTestRunsForPlan(formData.testPlanId);
    if (runsForPlan.some(run => run.name === name)) {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const dateStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      name = `${name} (${dateStr})`;
    }
    try {
      const response = await fetch('/api/test-runs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testPlanId: formData.testPlanId,
          name,
          description: formData.description
        }),
      });

      if (response.ok) {
        const newTestRun = await response.json();
        onSave(newTestRun);
        setFormData({
          testPlanId: '',
          name: '',
          description: ''
        });
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка создания тестового прогона');
      }
    } catch (error) {
      toast.error('Ошибка создания тестового прогона');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Создать тестовый прогон</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Тест-план *
            </label>
            <select
              value={formData.testPlanId}
              onChange={(e) => setFormData({ ...formData, testPlanId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Выберите тест-план</option>
              {testPlans.map((testPlan) => (
                <option key={testPlan.id} value={testPlan.id}>
                  {testPlan.name} ({testPlan.project_name})
                  {testPlan.test_cases_count && ` - ${testPlan.test_cases_count} тест-кейсов`} 
                  [{testPlan.status === 'active' ? 'Активный' : testPlan.status === 'draft' ? 'Черновик' : testPlan.status}]
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите название тестового прогона"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Описание тестового прогона"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTestRunModal; 