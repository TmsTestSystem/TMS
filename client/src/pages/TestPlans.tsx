import React, { useState, useEffect } from 'react';
import CreateTestPlanModal from '../components/CreateTestPlanModal.tsx';
import { useNavigate } from 'react-router-dom';

interface TestPlan {
  id: number;
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

  const handleDeleteTestPlan = async (id: number) => {
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
        const error = await response.json();
        alert(error.error || 'Ошибка удаления тест-плана');
      }
    } catch (error) {
      console.error('Ошибка удаления тест-плана:', error);
      alert('Ошибка удаления тест-плана');
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Тест-планы</h1>
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
        <div className="grid gap-6">
          {testPlans.map((testPlan) => (
            <div key={testPlan.id} className="card p-6 cursor-pointer hover:bg-blue-50 transition" onClick={() => navigate(`/test-plans/${testPlan.id}`)}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {testPlan.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(testPlan.status)}`}>
                      {getStatusText(testPlan.status)}
                    </span>
                  </div>
                  
                  {testPlan.description && (
                    <p className="text-gray-600 mb-3">{testPlan.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>{testPlan.project_name}</span>
                    </div>
                    
                    {testPlan.test_cases_count !== undefined && (
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span>{testPlan.test_cases_count} тест-кейсов</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{testPlan.created_by_name}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{new Date(testPlan.created_at).toLocaleDateString('ru-RU')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/test-plans/${testPlan.id}`); }}
                    className="btn-icon"
                    title="Открыть"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setEditPlan(testPlan); }}
                    className="btn-icon"
                    title="Редактировать"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6l11-11a2.828 2.828 0 00-4-4L5 17v4z" />
                    </svg>
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleDeleteTestPlan(testPlan.id); }}
                    className="btn-icon"
                    title="Удалить"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
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