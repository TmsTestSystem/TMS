import React, { useState, useEffect } from 'react';
import CreateTestPlanModal from '../components/CreateTestPlanModal.tsx';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/errorHandler.ts';
import { FileText } from 'lucide-react';

interface TestPlan {
  id: string;
  name: string;
  description?: string;
  status: string;
  project_name: string;
  created_by_name: string;
  test_cases_count?: number;
  created_at: string;
  updated_at: string;
  canDelete?: boolean; // Added for new functionality
}

const TestPlans: React.FC = () => {
  const [testPlans, setTestPlans] = useState<TestPlan[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<TestPlan|null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTestPlans();
  }, []);

  const fetchTestPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/test-plans');
      const data = await response.json();
      setTestPlans(data);
    } catch (error) {
      console.error('Ошибка загрузки тест-планов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestPlan = (newTestPlan: TestPlan) => {
    // Обновляем данные с сервера после создания
    setTimeout(() => {
      fetchTestPlans();
    }, 100);
  };

  const handleUpdateTestPlan = (updatedPlan: TestPlan) => {
    setTestPlans(testPlans.map(plan => plan.id === updatedPlan.id ? updatedPlan : plan));
  };

  const handleDeleteTestPlan = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот тест-план?')) {
      return;
    }

    try {
      const response = await fetch(`/api/test-plans/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTestPlans(testPlans.filter(plan => plan.id !== id));
      } else {
        const errorMessage = await handleApiError(response);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Ошибка удаления тест-плана:', error);
      toast.error('Ошибка удаления тест-плана');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Черновик';
      case 'active':
        return 'Активный';
      case 'completed':
        return 'Завершен';
      case 'archived':
        return 'Архив';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8 gap-2">
        <FileText className="w-6 h-6 text-blue-500" />
        <h1 className="text-3xl font-bold text-gray-900">Тест-планы</h1>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-600">Планирование тестирования</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary"
        >
          Создать тест-план
        </button>
      </div>

      {testPlans.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет тест-планов</h3>
          <p className="text-gray-600 mb-4">Создайте первый тест-план для начала планирования тестирования</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary"
          >
            Создать тест-план
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testPlans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden max-w-full">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4 max-w-full">
                  <div className="flex items-center gap-2 max-w-[70%]">
                    <FileText className="w-6 h-6 text-blue-400 mr-1" />
                    <h3 className="text-xl font-semibold text-gray-900 break-words">
                      {plan.name}
                    </h3>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(plan.status)}`}>{getStatusText(plan.status)}</span>
                  </div>
                  <div className="flex space-x-2 flex-shrink-0">
                    <button
                      onClick={e => {e.stopPropagation(); setEditPlan(plan);}}
                      className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded bg-blue-50"
                      style={{minWidth: 32}}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={e => {e.stopPropagation(); handleDeleteTestPlan(plan.id);}}
                      className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded bg-red-50"
                      style={{minWidth: 32}}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                {plan.description && (
                  <p className="text-gray-600 mb-4 break-words max-w-full overflow-hidden">
                    {plan.description}
                  </p>
                )}
                <div className="bg-gray-50 rounded-md p-3 mb-3 flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">🧑</span>
                    <span>{plan.created_by_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">🗓️</span>
                    <span>{new Date(plan.created_at).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/test-plans/${plan.id}`)}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors mt-2"
                >
                  Открыть тест-план →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateTestPlanModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateTestPlan}
      />
      {editPlan && (
        <CreateTestPlanModal
          isOpen={!!editPlan}
          onClose={() => setEditPlan(null)}
          editMode={true}
          initialData={editPlan}
          onUpdate={handleUpdateTestPlan}
        />
      )}
    </div>
  );
};

export default TestPlans; 