import React, { useState, useEffect } from 'react';
import CreateTestRunModal from '../components/CreateTestRunModal.tsx';
import TestRunResults from '../components/TestRunResults.tsx';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FileText } from 'lucide-react';

interface TestRun {
  id: string;
  name: string;
  description?: string;
  status: string;
  test_plan_name: string;
  project_name: string;
  started_by_name: string;
  total_test_cases: number;
  passed_count: number;
  failed_count: number;
  blocked_count: number;
  not_run_count: number;
  is_deleted?: boolean;
  deleted_at?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  canDelete?: boolean; // Added for new functionality
  gitRepoUrl?: string; // Added for new functionality
}

const TestRuns: React.FC = () => {
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [selectedTestRunId, setSelectedTestRunId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTestRuns();
  }, []);

  const fetchTestRuns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/test-runs');
      const data = await response.json();
      setTestRuns(data);
    } catch (error) {
      console.error('Ошибка загрузки тестовых прогонов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestRun = (newTestRun: TestRun) => {
    // Обновляем данные с сервера после создания
    setTimeout(() => {
      fetchTestRuns();
    }, 100);
  };

  const handleDeleteTestRun = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот тестовый прогон?')) {
      return;
    }

    try {
      const response = await fetch(`/api/test-runs/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTestRuns(testRuns.filter(run => run.id !== id));
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка удаления тестового прогона');
      }
    } catch (error) {
      console.error('Ошибка удаления тестового прогона:', error);
      toast.error('Ошибка удаления тестового прогона');
    }
  };

  const handleStartTestRun = async (id: string) => {
    try {
      const response = await fetch(`/api/test-runs/${id}/start`, {
        method: 'POST',
      });

      if (response.ok) {
        const updatedRun = await response.json();
        setTestRuns(testRuns.map(run => 
          run.id === id ? { ...run, status: updatedRun.status, started_at: updatedRun.started_at } : run
        ));
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка запуска тестового прогона');
      }
    } catch (error) {
      console.error('Ошибка запуска тестового прогона:', error);
      toast.error('Ошибка запуска тестового прогона');
    }
  };

  const handleCompleteTestRun = async (id: string) => {
    try {
      const response = await fetch(`/api/test-runs/${id}/complete`, {
        method: 'POST',
      });

      if (response.ok) {
        const updatedRun = await response.json();
        setTestRuns(testRuns.map(run => 
          run.id === id ? { ...run, status: updatedRun.status, completed_at: updatedRun.completed_at } : run
        ));
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка завершения тестового прогона');
      }
    } catch (error) {
      console.error('Ошибка завершения тестового прогона:', error);
      toast.error('Ошибка завершения тестового прогона');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planned':
        return 'Запланирован';
      case 'in_progress':
        return 'Выполняется';
      case 'completed':
        return 'Завершен';
      case 'blocked':
        return 'Заблокирован';
      default:
        return status;
    }
  };

  const getProgressPercentage = (testRun: TestRun) => {
    if (testRun.total_test_cases === 0) return 0;
    const completed = testRun.passed_count + testRun.failed_count + testRun.blocked_count;
    const percent = Math.round((completed / testRun.total_test_cases) * 100);
    return Math.min(percent, 100);
  };

  const handleViewResults = (testRunId: string) => {
    setSelectedTestRunId(testRunId);
    setIsResultsModalOpen(true);
  };

  const handleCloseResults = () => {
    setIsResultsModalOpen(false);
    setSelectedTestRunId(null);
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
        <h1 className="text-3xl font-bold text-gray-900">Тестовые прогоны</h1>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-600">Выполнение тестирования</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary"
        >
          Запустить прогон
        </button>
      </div>

      {testRuns.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет тестовых прогонов</h3>
          <p className="text-gray-600 mb-4">Создайте первый тестовый прогон для начала тестирования</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary"
          >
            Запустить прогон
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testRuns.map((run) => (
            <div key={run.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden max-w-full w-full md:w-[420px] mx-auto flex flex-col justify-between min-h-[220px]">
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-6 h-6 text-blue-400 mr-1 flex-shrink-0" />
                    <h3
                      className="text-lg font-semibold text-gray-900 truncate max-w-[180px]"
                      title={run.name}
                    >
                      {run.name}
                    </h3>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(run.status)}`}>{getStatusText(run.status)}</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-md p-3 mb-3 flex flex-col gap-2 text-sm mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500">🧩</span>
                    <span className="truncate" title="Количество тест-кейсов">{run.total_test_cases} тест-кейсов</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">🧑</span>
                    <span className="truncate">{run.started_by_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">🗓️</span>
                    <span>{new Date(run.created_at).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-auto">
                  {run.status === 'planned' && (
                    <button
                      onClick={() => handleStartTestRun(run.id)}
                      className="flex-1 px-2 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-1 text-sm font-semibold shadow transition"
                      title="Запустить прогон"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v18l15-9-15-9z" /></svg>
                      Запустить
                    </button>
                  )}
                  {run.status === 'in_progress' && (
                    <button
                      onClick={() => handleCompleteTestRun(run.id)}
                      className="flex-1 px-2 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-1 text-sm font-semibold shadow transition"
                      title="Завершить прогон"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      Завершить
                    </button>
                  )}
                  <button
                    onClick={e => {e.stopPropagation(); setIsResultsModalOpen(true); setSelectedTestRunId(run.id);}}
                    className="px-2 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center justify-center gap-1 text-sm font-semibold transition"
                    title="Результаты"
                  >
                    📊
                  </button>
                  <button
                    onClick={e => {e.stopPropagation(); handleDeleteTestRun(run.id);}}
                    className="px-2 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center justify-center gap-1 text-sm font-semibold transition"
                    title="Удалить"
                  >
                    🗑️
                  </button>
                </div>
                <button
                  onClick={() => navigate(`/test-runs/${run.id}`)}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors mt-2"
                >
                  Открыть прогон →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateTestRunModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateTestRun}
      />

      <TestRunResults
        isOpen={isResultsModalOpen}
        onClose={handleCloseResults}
        testRunId={selectedTestRunId || ''}
      />
    </div>
  );
};

export default TestRuns; 