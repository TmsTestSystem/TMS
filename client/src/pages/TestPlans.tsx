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
    setTestPlans([newTestPlan, ...testPlans]);
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
            <div
              key={plan.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/test-plans/${plan.id}`)}
            >
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
              </div>
              
              {plan.description && (
                <p className="text-gray-600 mb-3">{plan.description}</p>
              )}
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>{plan.project_name}</span>
                </div>
                
                {plan.test_cases_count !== undefined && (
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>{plan.test_cases_count} тест-кейсов</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{plan.created_by_name}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{new Date(plan.created_at).toLocaleDateString('ru-RU')}</span>
                </div>
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