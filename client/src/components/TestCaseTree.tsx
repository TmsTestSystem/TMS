import React, { useState, useEffect } from 'react';
import { FolderIcon, DocumentTextIcon, ChevronRightIcon, ChevronDownIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import CreateTestCaseModal from './CreateTestCaseModal.tsx';
import { toast } from 'react-toastify';

interface TestCaseSection {
  id: string;
  project_id: string;
  parent_id: string | null;
  name: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

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
  created_at: string;
  updated_at: string;
}

interface TestCaseTreeProps {
  projectId: number;
  onTestCaseSelect: (testCase: TestCase) => void;
  onTestCaseCreate: () => void;
  onTestCaseEdit: (testCase: TestCase) => void;
  selectedTestCaseId?: string;
  refreshTrigger?: number;
}

const TestCaseTree: React.FC<TestCaseTreeProps> = ({
  projectId,
  onTestCaseSelect,
  onTestCaseCreate,
  onTestCaseEdit,
  selectedTestCaseId,
  refreshTrigger
}) => {
  const [sections, setSections] = useState<TestCaseSection[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showCreateSection, setShowCreateSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [parentSectionId, setParentSectionId] = useState<string | null>(null);
  const [editingParentId, setEditingParentId] = useState<string | null>(null);
  
  // Drag & Drop состояния
  const [draggedTestCase, setDraggedTestCase] = useState<TestCase | null>(null);
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  const [dragOverUnassigned, setDragOverUnassigned] = useState(false);

  // Состояние для мультивыделения кейсов
  const [selectedTestCases, setSelectedTestCases] = useState<Set<string>>(new Set());

  // Модалки подтверждения удаления
  const [showDeleteSectionModal, setShowDeleteSectionModal] = useState(false);
  const [showDeleteTestCaseModal, setShowDeleteTestCaseModal] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<TestCaseSection | null>(null);
  const [testCaseToDelete, setTestCaseToDelete] = useState<TestCase | null>(null);

  // Модалка редактирования раздела
  const [showEditSectionModal, setShowEditSectionModal] = useState(false);
  const [sectionToEdit, setSectionToEdit] = useState<TestCaseSection | null>(null);
  const [editSectionName, setEditSectionName] = useState('');
  const [editSectionParentId, setEditSectionParentId] = useState<string | null>(null);

  // Модалка создания тест-кейса
  const [showCreateCaseModal, setShowCreateCaseModal] = useState(false);
  const [createCaseSectionId, setCreateCaseSectionId] = useState<string | null>(null);

  // Состояние для модалки подтверждения удаления пачки кейсов
  const [showDeleteBatchModal, setShowDeleteBatchModal] = useState(false);
  // Состояние для модалки подтверждения удаления раздела с кейсами
  const [deleteSectionWithCases, setDeleteSectionWithCases] = useState<{section: TestCaseSection, cases: TestCase[]}|null>(null);

  // Кнопка удаления пачки кейсов
  const renderBatchDeleteButton = () => (
    selectedTestCases.size > 0 && (
      <button
        onClick={() => setShowDeleteBatchModal(true)}
        className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
      >
        Удалить выбранные
      </button>
    )
  );

  // Загрузка данных
  useEffect(() => {
    loadData();
  }, [projectId, refreshTrigger]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sectionsRes, testCasesRes] = await Promise.all([
        fetch(`/api/test-case-sections/project/${projectId}`),
        fetch(`/api/test-cases/project/${projectId}`)
      ]);
      
      if (sectionsRes.ok && testCasesRes.ok) {
        const sectionsData = await sectionsRes.json();
        const testCasesData = await testCasesRes.json();
        setSections(sectionsData);
        setTestCases(testCasesData);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  // Создание раздела
  const createSection = async () => {
    if (!newSectionName.trim()) return;
    
    try {
      const response = await fetch('/api/test-case-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          parentId: parentSectionId,
          name: newSectionName.trim(),
          orderIndex: sections.length
        })
      });

      if (response.ok) {
        setNewSectionName('');
        setShowCreateSection(false);
        setParentSectionId(null);
        loadData();
      }
    } catch (error) {
      console.error('Ошибка создания раздела:', error);
    }
  };

  // Обновление раздела
  const updateSection = async (sectionId: string) => {
    if (!editingName.trim()) return;
    
    try {
      const response = await fetch(`/api/test-case-sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName.trim(), parentId: editingParentId })
      });

      if (response.ok) {
        setEditingSection(null);
        setEditingName('');
        setEditingParentId(null);
        loadData();
      }
    } catch (error) {
      console.error('Ошибка обновления раздела:', error);
    }
  };

  // Удаление раздела
  const deleteSection = async (sectionId: string, deleteCases: boolean = false) => {
    try {
      if (deleteCases) {
        // Удалить все кейсы в разделе (и вложенных)
        const collectCases = (secId: string): TestCase[] => {
          const directCases = testCases.filter(tc => tc.section_id === secId);
          const childSections = getChildSections(secId);
          return [
            ...directCases,
            ...childSections.flatMap(s => collectCases(s.id))
          ];
        };
        const casesToDelete = collectCases(sectionId);
        await Promise.all(casesToDelete.map(tc => deleteTestCase(tc.id)));
      }
      const response = await fetch(`/api/test-case-sections/${sectionId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setShowDeleteSectionModal(false);
        setSectionToDelete(null);
        setDeleteSectionWithCases(null);
        loadData();
      }
    } catch (error) {
      console.error('Ошибка удаления раздела:', error);
    }
  };

  // Удаление тест-кейса
  const deleteTestCase = async (testCaseId: string) => {
    try {
      const response = await fetch(`/api/test-cases/${testCaseId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setShowDeleteTestCaseModal(false);
        setTestCaseToDelete(null);
        loadData();
      }
    } catch (error) {
      console.error('Ошибка удаления тест-кейса:', error);
    }
  };

  // Подготовка удаления раздела
  const prepareDeleteSection = (section: TestCaseSection) => {
    // Найти все кейсы в этом разделе (и вложенных)
    const collectCases = (secId: string): TestCase[] => {
      const directCases = testCases.filter(tc => tc.section_id === secId);
      const childSections = getChildSections(secId);
      return [
        ...directCases,
        ...childSections.flatMap(s => collectCases(s.id))
      ];
    };
    const casesInSection = collectCases(section.id);
    setDeleteSectionWithCases({section, cases: casesInSection});
  };

  // Подготовка удаления тест-кейса
  const prepareDeleteTestCase = (testCase: TestCase) => {
    setTestCaseToDelete(testCase);
    setShowDeleteTestCaseModal(true);
  };

  // Переключение раскрытия раздела
  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Начало редактирования раздела
  const startEditing = (section: TestCaseSection) => {
    setEditingSection(section.id);
    setEditingName(section.name);
    setEditingParentId(section.parent_id);
  };

  // Получение дочерних разделов
  const getChildSections = (parentId: string | null) => {
    return sections.filter(s => s.parent_id === parentId);
  };

  // Получение тест-кейсов раздела
  const getSectionTestCases = (sectionId: string | null) => {
    return testCases.filter(tc => tc.section_id === sectionId);
  };

  // Перемещение тест-кейса в раздел
  const moveTestCaseToSection = async (testCaseId: string, sectionId: string | null) => {
    const testCase = testCases.find(tc => tc.id === testCaseId);
    if (!testCase) return;
    const updatedTestCase = {
      title: testCase.title,
      description: testCase.description,
      preconditions: testCase.preconditions,
      steps: testCase.steps,
      expected_result: testCase.expected_result,
      priority: testCase.priority,
      status: testCase.status,
      section_id: sectionId,
      test_plan_id: testCase.test_plan_id || null,
    };
    try {
      const response = await fetch(`/api/test-cases/${testCaseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTestCase)
      });

      if (response.ok) {
        loadData();
      } else {
        console.error('Ошибка перемещения тест-кейса');
      }
    } catch (error) {
      console.error('Ошибка перемещения тест-кейса:', error);
    }
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, testCase: TestCase) => {
    // Если выделено несколько — тащим их пачкой, иначе только один
    if (selectedTestCases.size > 1 && selectedTestCases.has(testCase.id)) {
      e.dataTransfer.setData('application/json', JSON.stringify(Array.from(selectedTestCases)));
    } else {
      e.dataTransfer.setData('application/json', JSON.stringify([testCase.id]));
    }
    setDraggedTestCase(testCase);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTestCase(null);
    setDragOverSection(null);
    setDragOverUnassigned(false);
  };

  const handleDragOver = (e: React.DragEvent, sectionId: string | null = null) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (sectionId !== null) {
      setDragOverSection(sectionId);
      setDragOverUnassigned(false);
    } else {
      setDragOverUnassigned(true);
      setDragOverSection(null);
    }
  };

  const handleDragLeave = () => {
    setDragOverSection(null);
    setDragOverUnassigned(false);
  };

  const handleDrop = (e: React.DragEvent, targetSectionId: string | null = null) => {
    e.preventDefault();
    let ids: string[] = [];
    try {
      ids = JSON.parse(e.dataTransfer.getData('application/json'));
    } catch {
      if (draggedTestCase) ids = [draggedTestCase.id];
    }
    if (!ids.length) return;
    // Не переносим если все уже в этом разделе
    const allInTarget = ids.every(id => {
      const tc = testCases.find(tc => tc.id === id);
      return tc && tc.section_id === targetSectionId;
    });
    if (allInTarget) {
      setDragOverSection(null);
      setDragOverUnassigned(false);
      return;
    }
    // Переносим пачкой
    Promise.all(ids.map(id => moveTestCaseToSection(id, targetSectionId))).then(() => {
      setSelectedTestCases(new Set());
      setDragOverSection(null);
      setDragOverUnassigned(false);
    });
  };

  // Открытие модалки редактирования раздела
  const openEditSectionModal = (section: TestCaseSection) => {
    setSectionToEdit(section);
    setEditSectionName(section.name);
    setEditSectionParentId(section.parent_id);
    setShowEditSectionModal(true);
  };

  // Сохранение изменений в разделе
  const handleEditSectionSave = async () => {
    if (!sectionToEdit || !editSectionName.trim()) return;
    try {
      const response = await fetch(`/api/test-case-sections/${sectionToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editSectionName.trim(), parentId: editSectionParentId })
      });
      if (response.ok) {
        setShowEditSectionModal(false);
        setSectionToEdit(null);
        setEditSectionName('');
        setEditSectionParentId(null);
        loadData();
      }
    } catch (error) {
      console.error('Ошибка обновления раздела:', error);
    }
  };

  // Рендер раздела
  const renderSection = (section: TestCaseSection, level: number = 0) => {
    const isExpanded = expandedSections.has(section.id);
    const childSections = getChildSections(section.id);
    const sectionTestCases = getSectionTestCases(section.id);
    const isEditing = editingSection === section.id;
    const isDragOver = dragOverSection === section.id;

    return (
      <div key={section.id} className="select-none">
        <div 
          className={`flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer group ${
            level > 0 ? 'ml-4' : ''
          } ${isDragOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''}`}
          onDragOver={(e) => handleDragOver(e, section.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, section.id)}
        >
          {/* Иконка раскрытия */}
          {(childSections.length > 0 || sectionTestCases.length > 0) && (
            <button
              onClick={() => toggleSection(section.id)}
              className="p-0.5 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDownIcon className="w-3 h-3" />
              ) : (
                <ChevronRightIcon className="w-3 h-3" />
              )}
            </button>
          )}
          
          {/* Иконка папки */}
          <FolderIcon className="w-4 h-4 text-blue-500" />
          
          {/* Название раздела */}
          {isEditing ? (
            <>
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') updateSection(section.id);
                  if (e.key === 'Escape') {
                    setEditingSection(null);
                    setEditingName('');
                    setEditingParentId(null);
                  }
                }}
                className="flex-1 px-2 py-1 border rounded text-sm"
                autoFocus
              />
              <select
                value={editingParentId || ''}
                onChange={e => setEditingParentId(e.target.value ? String(e.target.value) : null)}
                className="ml-2 px-2 py-1 border rounded text-sm"
              >
                <option value="">Без родительского раздела</option>
                {sections.filter(s => s.id !== section.id).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </>
          ) : (
            <span className="flex-1 text-sm font-medium">{section.name}</span>
          )}
          
          {/* Кнопки действий */}
          {!isEditing && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleOpenCreateCase(section.id)}
                className="p-1 hover:bg-gray-200 rounded"
                title="Создать тест-кейс"
              >
                <PlusIcon className="w-3 h-3" />
              </button>
              <button
                onClick={() => openEditSectionModal(section)}
                className="p-1 hover:bg-gray-200 rounded"
                title="Переименовать"
              >
                <PencilIcon className="w-3 h-3" />
              </button>
              <button
                onClick={() => prepareDeleteSection(section)}
                className="p-1 hover:bg-gray-200 rounded text-red-500"
                title="Удалить"
              >
                <TrashIcon className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
        
        {/* Содержимое раздела */}
        {isExpanded && (
          <div className="ml-4">
            {/* Подразделы */}
            {childSections.map(childSection => renderSection(childSection, level + 1))}
            
            {/* Тест-кейсы раздела */}
            {sectionTestCases.map(testCase => (
              <div
                key={testCase.id}
                draggable
                onDragStart={(e) => handleDragStart(e, testCase)}
                onDragEnd={handleDragEnd}
                onClick={() => onTestCaseSelect(testCase)}
                className={`flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer ml-4 group ${
                  selectedTestCaseId === testCase.id ? 'bg-blue-100' : ''
                } ${draggedTestCase?.id === testCase.id ? 'opacity-50' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selectedTestCases.has(testCase.id)}
                  onChange={e => handleSelectTestCase(testCase.id, e.target.checked)}
                  className="mr-2 accent-blue-500"
                  onClick={e => e.stopPropagation()}
                />
                <DocumentTextIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm flex-1">{testCase.title}</span>
                <span className={`px-2 py-0.5 text-xs rounded ${
                  testCase.priority === 'high' ? 'bg-red-100 text-red-700' :
                  testCase.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {testCase.priority}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTestCaseEdit(testCase);
                    }}
                    className="p-1 hover:bg-gray-200 rounded text-blue-500"
                    title="Редактировать"
                  >
                    <PencilIcon className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prepareDeleteTestCase(testCase);
                    }}
                    className="p-1 hover:bg-gray-200 rounded text-red-500"
                    title="Удалить"
                  >
                    <TrashIcon className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Тест-кейсы без раздела
  const unassignedTestCases = getSectionTestCases(null);

  // Открытие модалки создания тест-кейса
  const handleOpenCreateCase = (sectionId: string | null) => {
    setCreateCaseSectionId(sectionId);
    setShowCreateCaseModal(true);
  };

  // Создание тест-кейса
  const handleCaseCreated = async (testCaseData: any) => {
    try {
      // Удаляю section_id, оставляю только sectionId для backend
      const payload = { ...testCaseData };
      if (payload.section_id !== undefined) {
        delete payload.section_id;
      }
      const response = await fetch('/api/test-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setShowCreateCaseModal(false);
        setCreateCaseSectionId(null);
        loadData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка создания тест-кейса');
      }
    } catch (error) {
      toast.error('Ошибка создания тест-кейса');
    }
  };

  // Обработчик выбора кейса (чекбокс)
  const handleSelectTestCase = (testCaseId: string, checked: boolean) => {
    setSelectedTestCases(prev => {
      const next = new Set(prev);
      if (checked) next.add(testCaseId);
      else next.delete(testCaseId);
      return next;
    });
  };

  // Удаление пачки кейсов
  const handleDeleteSelectedTestCases = async () => {
    await Promise.all(Array.from(selectedTestCases).map(id => deleteTestCase(id)));
    setSelectedTestCases(new Set());
    setShowDeleteBatchModal(false);
  };

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Загрузка...</div>;
  }

  return (
    <div className="w-full max-w-full">
      {/* Заголовок с кнопками создания и удаления пачки */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">Структура тест-кейсов</h3>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => handleOpenCreateCase(null)}
            className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Создать тест-кейс
          </button>
          <button
            onClick={() => setShowCreateSection(true)}
            className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Создать раздел
          </button>
          {renderBatchDeleteButton()}
        </div>
      </div>

      {/* Модалка создания раздела */}
      {showCreateSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Создать раздел</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Название</label>
                <input
                  type="text"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Введите название раздела"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Родительский раздел</label>
                <select
                  value={parentSectionId || ''}
                  onChange={(e) => setParentSectionId(e.target.value ? String(e.target.value) : null)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Без родительского раздела</option>
                  {sections.map(section => (
                    <option key={section.id} value={section.id}>{section.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowCreateSection(false);
                    setNewSectionName('');
                    setParentSectionId(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Отмена
                </button>
                <button
                  onClick={createSection}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Создать
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модалка редактирования раздела */}
      {showEditSectionModal && sectionToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Редактировать раздел</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Название</label>
                <input
                  type="text"
                  value={editSectionName}
                  onChange={(e) => setEditSectionName(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Введите название раздела"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Родительский раздел</label>
                <select
                  value={editSectionParentId || ''}
                  onChange={(e) => setEditSectionParentId(e.target.value ? String(e.target.value) : null)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Без родительского раздела</option>
                  {sections.filter(s => s.id !== sectionToEdit.id).map(section => (
                    <option key={section.id} value={section.id}>{section.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowEditSectionModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Отмена
                </button>
                <button
                  onClick={handleEditSectionSave}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Дерево разделов */}
      <div className="space-y-1">
        {sections.filter(s => !s.parent_id).map(section => renderSection(section))}
      </div>

      {/* Тест-кейсы без раздела */}
      {unassignedTestCases.length > 0 && (
        <div className="mt-2">
          <div className="flex items-center gap-2 px-2 py-1 text-gray-500 text-xs uppercase tracking-wide">
            <FolderIcon className="w-3 h-3" /> Без раздела
          </div>
          {unassignedTestCases.map(testCase => (
            <div
              key={testCase.id}
              draggable
              onDragStart={(e) => handleDragStart(e, testCase)}
              onDragEnd={handleDragEnd}
              onClick={() => onTestCaseSelect(testCase)}
              className={`flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer ml-4 group ${
                selectedTestCaseId === testCase.id ? 'bg-blue-100' : ''
              } ${draggedTestCase?.id === testCase.id ? 'opacity-50' : ''}`}
            >
              <input
                type="checkbox"
                checked={selectedTestCases.has(testCase.id)}
                onChange={e => handleSelectTestCase(testCase.id, e.target.checked)}
                className="mr-2 accent-blue-500"
                onClick={e => e.stopPropagation()}
              />
              <DocumentTextIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm flex-1">{testCase.title}</span>
              <span className={`px-2 py-0.5 text-xs rounded ${
                testCase.priority === 'high' ? 'bg-red-100 text-red-700' :
                testCase.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {testCase.priority}
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTestCaseEdit(testCase);
                  }}
                  className="p-1 hover:bg-gray-200 rounded text-blue-500"
                  title="Редактировать"
                >
                  <PencilIcon className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prepareDeleteTestCase(testCase);
                  }}
                  className="p-1 hover:bg-gray-200 rounded text-red-500"
                  title="Удалить"
                >
                  <TrashIcon className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модалка создания тест-кейса */}
      {showCreateCaseModal && (
        <CreateTestCaseModal
          isOpen={showCreateCaseModal}
          onClose={() => setShowCreateCaseModal(false)}
          projectId={projectId}
          onSave={handleCaseCreated}
          sectionId={createCaseSectionId || undefined}
        />
      )}

      {/* Модалка подтверждения удаления раздела */}
      {showDeleteSectionModal && sectionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Удалить раздел</h3>
            <p className="text-gray-700 mb-6">
              Вы уверены, что хотите удалить раздел <strong>"{sectionToDelete.name}"</strong>?
              <br />
              <span className="text-sm text-gray-500">
                Все тест-кейсы в этом разделе останутся без раздела.
              </span>
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowDeleteSectionModal(false);
                  setSectionToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Отмена
              </button>
              <button
                onClick={() => deleteSection(sectionToDelete.id)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка подтверждения удаления тест-кейса */}
      {showDeleteTestCaseModal && testCaseToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Удалить тест-кейс</h3>
            <p className="text-gray-700 mb-6">
              Вы уверены, что хотите удалить тест-кейс <strong>"{testCaseToDelete.title}"</strong>?
              <br />
              <span className="text-sm text-gray-500">
                Это действие нельзя отменить.
              </span>
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowDeleteTestCaseModal(false);
                  setTestCaseToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Отмена
              </button>
              <button
                onClick={() => deleteTestCase(testCaseToDelete.id)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка подтверждения удаления пачки кейсов */}
      {showDeleteBatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Удалить выбранные тест-кейсы</h3>
            <p className="text-gray-700 mb-6">
              Вы уверены, что хотите удалить <b>{selectedTestCases.size}</b> выбранных тест-кейсов?
              <br />Это действие нельзя отменить.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteBatchModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Отмена
              </button>
              <button
                onClick={handleDeleteSelectedTestCases}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка подтверждения удаления раздела с кейсами */}
      {deleteSectionWithCases && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Удалить раздел</h3>
            <p className="text-gray-700 mb-6">
              Вы уверены, что хотите удалить раздел <strong>"{deleteSectionWithCases.section.name}"</strong>?
              <br />
              {deleteSectionWithCases.cases.length > 0 ? (
                <span className="text-sm text-gray-500">
                  В этом разделе и вложенных разделах найдено <b>{deleteSectionWithCases.cases.length}</b> тест-кейсов.<br />
                  <b>Удалить вместе с разделом?</b>
                </span>
              ) : (
                <span className="text-sm text-gray-500">В разделе нет тест-кейсов.</span>
              )}
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteSectionWithCases(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Отмена
              </button>
              <button
                onClick={() => deleteSection(deleteSectionWithCases.section.id, true)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Удалить раздел и кейсы
              </button>
              <button
                onClick={() => deleteSection(deleteSectionWithCases.section.id, false)}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Только раздел
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestCaseTree; 