import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CreateTestCaseModal from '../components/CreateTestCaseModal.tsx';
import EditTestCaseModal from '../components/EditTestCaseModal.tsx';
import TestCaseSidebar from '../components/TestCaseSidebar.tsx';

interface Project {
  id: number;
  name: string;
  description?: string;
  gitRepoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface TestCase {
  id: number;
  title: string;
  description?: string;
  preconditions?: string;
  steps?: string;
  expectedResult?: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
  const [gitLoading, setGitLoading] = useState(false);

  useEffect(() => {
    fetchProject();
    fetchTestCases();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data);
      } else {
        console.error('Ошибка загрузки проекта');
      }
    } catch (error) {
      console.error('Ошибка загрузки проекта:', error);
    }
  };

  const fetchTestCases = async () => {
    try {
      const response = await fetch(`/api/test-cases/project/${id}`);
      if (response.ok) {
        const data = await response.json();
        setTestCases(data);
      } else {
        console.error('Ошибка загрузки тест-кейсов');
      }
    } catch (error) {
      console.error('Ошибка загрузки тест-кейсов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestCase = async (testCaseData: any) => {
    try {
      const response = await fetch('/api/test-cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCaseData),
      });

      if (response.ok) {
        const newTestCase = await response.json();
        setTestCases([newTestCase, ...testCases]);
      } else {
        console.error('Ошибка создания тест-кейса');
      }
    } catch (error) {
      console.error('Ошибка создания тест-кейса:', error);
    }
  };

  const handleEditTestCase = async (testCase: TestCase) => {
    try {
      const response = await fetch(`/api/test-cases/${testCase.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase),
      });
      if (response.ok) {
        const updated = await response.json();
        setTestCases(testCases.map(tc => tc.id === updated.id ? updated : tc));
        setEditingTestCase(null);
        setShowEditModal(false);
        setSelectedTestCase(updated);
      } else {
        console.error('Ошибка обновления тест-кейса');
      }
    } catch (error) {
      console.error('Ошибка обновления тест-кейса:', error);
    }
  };

  const handleGitPull = async () => {
    setGitLoading(true);
    try {
      const response = await fetch(`/api/git/pull?projectId=${id}`, { method: 'POST' });
      const data = await response.json();
      alert(data.message || 'Импорт из Git завершён');
      fetchTestCases();
    } catch (e) {
      alert('Ошибка импорта из Git');
    } finally {
      setGitLoading(false);
    }
  };
  const handleGitPush = async () => {
    setGitLoading(true);
    try {
      const response = await fetch(`/api/git/push?projectId=${id}`, { method: 'POST' });
      const data = await response.json();
      alert(data.message || 'Экспорт в Git завершён');
    } catch (e) {
      alert('Ошибка экспорта в Git');
    } finally {
      setGitLoading(false);
    }
  };

  const openSidebar = (testCase: TestCase) => {
    setSelectedTestCase(testCase);
    setSidebarOpen(true);
  };

  const openEditModal = (testCase: TestCase) => {
    setEditingTestCase(testCase);
    setShowEditModal(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-purple-100 text-purple-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'critical': return 'Критический';
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return priority;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Завершен';
      case 'in_progress': return 'В процессе';
      case 'ready': return 'Готов к тестированию';
      case 'draft': return 'Черновик';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Проект не найден</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Заголовок проекта */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            {project.description && (
              <p className="text-gray-600 mt-2">{project.description}</p>
            )}
          </div>
          <button
            onClick={() => navigate('/projects')}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            ← Назад к проектам
          </button>
        </div>
        
        {project.gitRepoUrl && (
          <div className="text-sm text-gray-500">
            Git: <a href={project.gitRepoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {project.gitRepoUrl}
            </a>
          </div>
        )}
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{testCases.length}</div>
          <div className="text-sm text-gray-600">Всего тест-кейсов</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {testCases.filter(tc => tc.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600">Завершено</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-orange-600">
            {testCases.filter(tc => tc.status === 'in_progress').length}
          </div>
          <div className="text-sm text-gray-600">В процессе</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-red-600">
            {testCases.filter(tc => tc.priority === 'critical').length}
          </div>
          <div className="text-sm text-gray-600">Критических</div>
        </div>
      </div>

      {/* Кнопки git-синхронизации */}
      <div className="mb-6 flex gap-3">
        <button
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          onClick={handleGitPull}
          disabled={gitLoading}
        >
          {gitLoading ? 'Импорт...' : 'Импортировать из Git'}
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          onClick={handleGitPush}
          disabled={gitLoading}
        >
          {gitLoading ? 'Экспорт...' : 'Экспортировать в Git'}
        </button>
        <button
          onClick={() => navigate(`/projects/${id}/test-cases`)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          📁 Древовидное отображение
        </button>
      </div>

      {/* Чек-лист тест-кейсов */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Тест-кейсы</h2>
        </div>
        {testCases.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            Тест-кейсы не найдены. Создайте первый тест-кейс для этого проекта.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {testCases.map((testCase) => (
              <li
                key={testCase.id}
                className="flex items-center px-6 py-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => openSidebar(testCase)}
              >
                <input type="checkbox" className="mr-4" disabled />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{testCase.title}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(testCase.priority)}`}>{getPriorityText(testCase.priority)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(testCase.status)}`}>{getStatusText(testCase.status)}</span>
                  </div>
                </div>
                <button
                  className="ml-4 text-blue-600 hover:text-blue-800 text-sm"
                  onClick={e => { e.stopPropagation(); openEditModal(testCase); }}
                >
                  Редактировать
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Модальное окно создания тест-кейса */}
      <CreateTestCaseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        projectId={parseInt(id!)}
        onSave={handleCreateTestCase}
      />

      {/* Модальное окно редактирования тест-кейса */}
      <EditTestCaseModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        testCase={editingTestCase}
        onSave={handleEditTestCase}
      />

      {/* Сайдбар с информацией о тест-кейсе */}
      <TestCaseSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        testCase={selectedTestCase}
        onEdit={() => {
          setSidebarOpen(false);
          if (selectedTestCase) openEditModal(selectedTestCase);
        }}
      />
    </div>
  );
};

export default ProjectDetail; 