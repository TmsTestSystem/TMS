import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AddTestCasesToPlanModal from '../components/AddTestCasesToPlanModal.tsx';
import TestCaseSidebar from '../components/TestCaseSidebar.tsx';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import ConfirmModal from '../components/ConfirmModal';

interface TestPlan {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  status: string;
  project_name: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

interface TestCase {
  id: string;
  title: string;
  status: string;
  priority: string;
  section_id?: string;
}

const TestPlanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [testPlan, setTestPlan] = useState<TestPlan | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchTestPlan();
    fetchTestCases();
  }, [id]);

  useEffect(() => {
    if (testPlan) {
      fetchSections();
    }
  }, [testPlan]);

  const fetchTestPlan = async () => {
    try {
      const response = await fetch(`/api/test-plans/${id}`);
      if (response.ok) {
        setTestPlan(await response.json());
      } else {
        setError('Тест-план не найден');
      }
    } catch (e) {
      setError('Ошибка загрузки тест-плана');
    }
  };

  const fetchTestCases = async () => {
    try {
      const response = await fetch(`/api/test-plans/${id}/test-cases`);
      if (response.ok) {
        setTestCases(await response.json());
      } else {
        setTestCases([]);
      }
    } catch (e) {
      setTestCases([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    try {
      if (!testPlan) return;
      const response = await fetch(`/api/test-case-sections/project/${testPlan.project_id}`);
      if (response.ok) {
        setSections(await response.json());
      }
    } catch {}
  };

  const getChildSections = (parentId: string | null) => sections.filter(s => s.parent_id === parentId);
  const getSectionTestCases = (sectionId: string | null) => testCases.filter(tc => tc.section_id === sectionId);

  const handleToggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId); else next.add(sectionId);
      return next;
    });
  };

  const renderSection = (section: any, level = 0) => {
    const childSections = getChildSections(section.id);
    const sectionCases = getSectionTestCases(section.id);
    const isExpanded = expandedSections.has(section.id);
    const isSelected = selectedSectionId === section.id;
    return (
      <div key={section.id} style={{ marginLeft: level * 16 }}>
        <div className={`flex items-center font-semibold text-gray-800 py-1 rounded cursor-pointer ${isSelected ? 'bg-blue-100' : ''}`} style={{ fontSize: 14 }}>
          {(childSections.length > 0 || sectionCases.length > 0) && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); handleToggleSection(section.id); }}
              className="mr-1 p-0.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-800 focus:outline-none"
              style={{ lineHeight: 0 }}
            >
              {isExpanded ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
            </button>
          )}
          <span onClick={() => setSelectedSectionId(section.id)} className="flex-1 select-none">
            {section.name}
          </span>
        </div>
        {isExpanded && (
          <div>
            {sectionCases.map(tc => renderCase(tc, level + 1))}
            {childSections.map(child => renderSection(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderCase = (tc: TestCase, level = 0) => (
    <div
      key={tc.id}
      style={{ marginLeft: level * 16 + 16 }}
      className={`flex items-center py-1 px-2 cursor-pointer hover:bg-blue-50 rounded transition group ${selectedTestCase?.id === tc.id ? 'bg-blue-100' : ''}`}
      onClick={() => setSelectedTestCase(tc)}
    >
      <span className="flex-1 text-gray-900" style={{ fontSize: 14 }}>{tc.title}</span>
      <span className="ml-2 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{tc.priority}</span>
      <span className="ml-2 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{tc.status}</span>
      <button
        onClick={e => { e.stopPropagation(); handleRemoveTestCase(tc.id); }}
        className="ml-2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100"
        title="Удалить из плана"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );

  const handleRemoveTestCase = async (testCaseId: string) => {
    if (!window.confirm('Удалить тест-кейс из плана?')) return;
    try {
      // Отвязываем тест-кейс от плана (обновляем test_plan_id на null)
      await fetch(`/api/test-cases/${testCaseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testPlanId: null })
      });
      fetchTestCases();
    } catch (e) {
      toast.error('Ошибка удаления тест-кейса из плана');
    }
  };

  const handleStartTestRun = async () => {
    setShowConfirm(true);
  };
  const doStartTestRun = async () => {
    setShowConfirm(false);
    try {
      const response = await fetch('/api/test-runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testPlanId: id, name: `Прогон для плана "${testPlan?.name}"` })
      });
      if (response.ok) {
        const testRun = await response.json();
        navigate(`/test-runs`);
      } else {
        toast.error('Ошибка запуска прогона');
      }
    } catch (e) {
      toast.error('Ошибка запуска прогона');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Загрузка...</div>;
  }
  if (error || !testPlan) {
    return <div className="text-red-600 text-center py-8">{error || 'Ошибка'}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{testPlan.name}</h1>
          <div className="text-gray-500 text-sm mb-2">Проект: {testPlan.project_name}</div>
          <div className="text-gray-500 text-sm mb-2">Создал: {testPlan.created_by_name}</div>
          <div className="text-gray-500 text-sm mb-2">Статус: {testPlan.status}</div>
          <div className="text-gray-500 text-sm mb-2">Создан: {new Date(testPlan.created_at).toLocaleString('ru-RU')}</div>
        </div>
        <button
          onClick={handleStartTestRun}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Запустить прогон
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Тест-кейсы в плане</h2>
        {testCases.length === 0 ? (
          <div className="text-gray-500">Нет тест-кейсов в этом плане</div>
        ) : (
          <div>
            {sections.filter(s => !s.parent_id).map(section => renderSection(section))}
            {/* Кейсы без раздела */}
            {getSectionTestCases(null).map(tc => renderCase(tc, 0))}
          </div>
        )}
      </div>

      {/* TODO: Добавить модалку для добавления тест-кейсов в план */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        Добавить тест-кейсы в план
      </button>
      <AddTestCasesToPlanModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        projectId={testPlan.project_id}
        testPlanId={testPlan.id}
        onAdded={fetchTestCases}
      />

      {selectedTestCase && (
        <TestCaseSidebar
          isOpen={!!selectedTestCase}
          testCase={selectedTestCase}
          onClose={() => setSelectedTestCase(null)}
          onEdit={() => {}}
        />
      )}
      <ConfirmModal
        isOpen={showConfirm}
        title="Подтвердите действие"
        message="Запустить прогон по этому тест-плану?"
        onConfirm={doStartTestRun}
        onCancel={() => setShowConfirm(false)}
        confirmText="OK"
        cancelText="Отмена"
      />
    </div>
  );
};

export default TestPlanDetail; 