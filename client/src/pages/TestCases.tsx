import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CreateTestCaseModal from '../components/CreateTestCaseModal.tsx';
import TestCaseTree from '../components/TestCaseTree.tsx';
import TestCaseSidebar from '../components/TestCaseSidebar.tsx';
import EditTestCaseModal from '../components/EditTestCaseModal.tsx';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/errorHandler.ts';

interface TestCase {
  id: string;
  project_id: string;
  test_plan_id: string | null;
  section_id: string | null;
  title: string;
  description: string;
  preconditions: string;
  steps: string;
  expected_result: string;
  priority: string;
  status: string;
  is_deleted?: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  git_repository: string;
  created_at: string;
  updated_at: string;
}

const TestCases: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [gitLoading, setGitLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'title' | 'full'>('full'); // 'title' - только названия, 'full' - все поля

  useEffect(() => {
    if (id) {
      fetchProject();
    } else {
      fetchProjects();
    }
  }, [id]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки проектов:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки проекта:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestCase = async (testCaseData: any) => {
    try {
      // Преобразуем sectionId в section_id и expectedResult в expected_result для backend
      const payload = { ...testCaseData };
      if (payload.sectionId !== undefined) {
        payload.section_id = payload.sectionId;
        delete payload.sectionId;
      }
      if (payload.expectedResult !== undefined) {
        payload.expected_result = payload.expectedResult;
        delete payload.expectedResult;
      }
      const response = await fetch('/api/test-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const newTestCase = await response.json();
        setShowCreateModal(false);
        // Принудительно обновляем дерево
        setRefreshTrigger(prev => prev + 1);
      } else {
        const errorMessage = await handleApiError(response);
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error('Ошибка создания тест-кейса');
    }
  };

  const handleTestCaseEdit = (testCase: TestCase) => {
    setSelectedTestCase(testCase);
    setShowEditModal(true);
  };

  const handleTestCaseSelect = (testCase: TestCase) => {
    setSelectedTestCase(testCase);
  };

  const handleEditTestCase = async (updatedTestCase: any) => {
    try {
      const response = await fetch(`/api/test-cases/${updatedTestCase.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: updatedTestCase.title,
          description: updatedTestCase.description,
          preconditions: updatedTestCase.preconditions,
          steps: updatedTestCase.steps,
          expectedResult: updatedTestCase.expected_result || updatedTestCase.expectedResult,
          priority: updatedTestCase.priority,
          status: updatedTestCase.status,
          section_id: updatedTestCase.section_id !== undefined ? updatedTestCase.section_id : (updatedTestCase.sectionId !== undefined ? updatedTestCase.sectionId : null)
        }),
      });
      if (response.ok) {
        const newTestCase = await response.json();
        setSelectedTestCase(newTestCase);
        setShowEditModal(false);
        // Принудительно обновляем дерево
        setRefreshTrigger(prev => prev + 1);
      } else {
        const errorMessage = await handleApiError(response);
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error('Ошибка обновления тест-кейса');
    }
  };

  // --- Git sync handlers ---
  const handleGitPull = async () => {
    if (!project) return;
    setGitLoading(true);
    try {
      console.log(`[TestCases] Начинаем Git pull для проекта ${project.id}`);
      const response = await fetch(`/api/git/pull?projectId=${project.id}`, { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        console.log(`[TestCases] Git pull успешен:`, data.message);
        toast.success(data.message || 'Импорт из Git завершён');
        console.log(`[TestCases] Обновляем refreshTrigger с ${refreshTrigger} на ${refreshTrigger + 1}`);
        setRefreshTrigger(prev => prev + 1);
      } else {
        const errorMessage = await handleApiError(response);
        console.error(`[TestCases] Git pull ошибка:`, errorMessage);
        toast.error(errorMessage);
      }
    } catch (e) {
      console.error(`[TestCases] Git pull исключение:`, e);
      toast.error('Ошибка импорта из Git');
    } finally {
      setGitLoading(false);
    }
  };
  const handleGitPush = async () => {
    if (!project) return;
    setGitLoading(true);
    try {
      const response = await fetch(`/api/git/push?projectId=${project.id}`, { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || 'Экспорт в Git завершён');
      } else {
        const errorMessage = await handleApiError(response);
        toast.error(errorMessage);
      }
    } catch (e) {
      toast.error('Ошибка экспорта в Git');
    } finally {
      setGitLoading(false);
    }
  };

  // Если нет projectId, показываем список проектов
  if (!id) {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Загрузка проектов...</div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Тест-кейсы</h1>
            <p className="text-gray-600">Выберите проект для просмотра тест-кейсов</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/projects/${project.id}/test-cases`)}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.name}</h3>
              {project.description && (
                <p className="text-gray-600 text-sm mb-4">{project.description}</p>
              )}
              <div className="text-xs text-gray-500">
                Создан: {new Date(project.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-lg font-medium mb-2">Нет проектов</h3>
            <p className="text-sm text-gray-500 mb-4">Создайте проект, чтобы начать работу с тест-кейсами</p>
            <button
              onClick={() => navigate('/projects')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Перейти к проектам
            </button>
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Загрузка проекта...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Проект не найден</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full min-h-[80vh] bg-gray-50 max-w-full overflow-x-auto">
      {/* Левая панель с деревом тест-кейсов */}
      <div className="bg-white border-r border-gray-200 flex flex-col w-auto min-w-[220px] max-w-full md:max-w-[600px] overflow-x-auto transition-all duration-200" style={{width: 'max-content'}}>
        {/* Заголовок */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Тест-кейсы</h1>
              <p className="text-sm text-gray-600">{project.name}</p>
            </div>
          </div>
          
          {/* Поле поиска */}
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={searchMode === 'title' ? 'Поиск по названиям...' : 'Поиск по тест-кейсам...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {/* Переключатель режима поиска */}
                <button
                  onClick={() => setSearchMode(searchMode === 'title' ? 'full' : 'title')}
                  className="absolute right-2 top-1.5 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors z-10"
                  title={searchMode === 'title' ? 'Переключить на поиск по всем полям' : 'Переключить на поиск только по названиям'}
                >
                  {searchMode === 'title' ? '📝 Названия' : '🔍 Все поля'}
                </button>
              </div>
              {/* Кнопка очистки - справа от поля */}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  title="Очистить поиск"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {searchQuery && (
              <div className="mt-1 text-xs text-gray-500">
                {searchMode === 'title' 
                  ? 'Поиск только по названиям тест-кейсов' 
                  : 'Поиск по всем полям тест-кейсов'}
              </div>
            )}
          </div>
          
          {/* Кнопки git-синхронизации */}
          <div className="flex gap-2 mt-4">
            <button
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              onClick={handleGitPull}
              disabled={gitLoading}
            >
              {gitLoading ? 'Импорт...' : 'Импортировать из Git'}
            </button>
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              onClick={handleGitPush}
              disabled={gitLoading}
            >
              {gitLoading ? 'Экспорт...' : 'Экспортировать в Git'}
            </button>
          </div>
        </div>

        {/* Дерево тест-кейсов */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4">
          {/* Группировка кейсов по разделам */}
          <TestCaseTree
            projectId={project.id}
            onTestCaseSelect={handleTestCaseSelect}
            onTestCaseCreate={() => setShowCreateModal(true)}
            onTestCaseEdit={handleTestCaseEdit}
            selectedTestCaseId={selectedTestCase?.id}
            refreshTrigger={refreshTrigger}
            groupBySection={true}
            searchQuery={searchQuery}
            searchMode={searchMode}
          />
        </div>
      </div>

      {/* Центральная панель с деталями тест-кейса */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full md:max-w-[700px] lg:max-w-[900px] xl:max-w-[1200px] 2xl:max-w-[1500px] mx-auto transition-all duration-200">
        {selectedTestCase ? (
          <TestCaseSidebar
            isOpen={true}
            testCase={selectedTestCase}
            onClose={() => setSelectedTestCase(null)}
            onEdit={() => setShowEditModal(true)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium mb-2">Выберите тест-кейс</h3>
              <p className="text-sm">Выберите тест-кейс из списка слева для просмотра деталей</p>
            </div>
          </div>
        )}
      </div>

      {/* Модалка создания тест-кейса */}
      <CreateTestCaseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        projectId={project.id}
        onSave={handleCreateTestCase}
      />

      {/* Модалка редактирования тест-кейса */}
      {showEditModal && selectedTestCase && (
        <EditTestCaseModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          testCase={selectedTestCase}
          onSave={handleEditTestCase}
        />
      )}
    </div>
  );
};

export default TestCases; 