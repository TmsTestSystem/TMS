import React, { useEffect, useState } from 'react';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface TestCase {
  id: string;
  title: string;
  status: string;
  priority: string;
  section_id: string | null;
}

interface Section {
  id: string;
  name: string;
  parent_id: string | null;
}

interface AddTestCasesToPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  testPlanId: string;
  onAdded: () => void;
}

const AddTestCasesToPlanModal: React.FC<AddTestCasesToPlanModalProps> = ({ isOpen, onClose, projectId, testPlanId, onAdded }) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchSections();
      fetchTestCases();
    }
  }, [isOpen, projectId]);

  const fetchSections = async () => {
    try {
      const response = await fetch(`/api/test-case-sections/project/${projectId}`);
      if (response.ok) {
        setSections(await response.json());
      }
    } catch {}
  };

  const fetchTestCases = async () => {
    setLoading(true);
    try {
      console.log('Fetching test cases for project:', projectId);
      const response = await fetch(`/api/test-cases/project/${projectId}?excludePlanId=${testPlanId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Available test cases:', data);
        setTestCases(data);
      }
    } finally {
      setLoading(false);
    }
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

  const handleToggleCase = (caseId: string) => {
    console.log('Toggle case:', caseId);
    setSelectedCases(prev => {
      const next = new Set(prev);
      if (next.has(caseId)) {
        next.delete(caseId);
        console.log('Removed case:', caseId);
      } else {
        next.add(caseId);
        console.log('Added case:', caseId);
      }
      // Принудительно обновляем состояние
      setTimeout(() => {
        setSelectedCases(current => new Set(current));
      }, 0);
      return next;
    });
  };

  const handleToggleSectionCheckbox = (sectionId: string) => {
    console.log('Toggle section:', sectionId);
    // Выделить/снять все кейсы в разделе (и вложенных)
    const collectCases = (sid: string): string[] => {
      let ids = getSectionTestCases(sid).map(tc => tc.id);
      for (const child of getChildSections(sid)) {
        ids = ids.concat(collectCases(child.id));
      }
      return ids;
    };
    const allIds = collectCases(sectionId);
    const allSelected = allIds.every(id => selectedCases.has(id));
    console.log('All IDs:', allIds, 'All selected:', allSelected);
    setSelectedCases(prev => {
      const next = new Set(prev);
      if (allSelected) {
        allIds.forEach(id => next.delete(id));
        console.log('Removed all cases from section');
      } else {
        allIds.forEach(id => next.add(id));
        console.log('Added all cases from section');
      }
      // Принудительно обновляем состояние
      setTimeout(() => {
        setSelectedCases(current => new Set(current));
      }, 0);
      return next;
    });
  };

  const renderSection = (section: Section, level = 0) => {
    const selectedCasesKey = Array.from(selectedCases).join(',');
    const childSections = getChildSections(section.id);
    const sectionCases = getSectionTestCases(section.id);
    // Определяем, выбраны ли все кейсы в разделе (и вложенных)
    const collectCases = (sid: string): string[] => {
      let ids = getSectionTestCases(sid).map(tc => tc.id);
      for (const child of getChildSections(sid)) {
        ids = ids.concat(collectCases(child.id));
      }
      return ids;
    };
    const allIds = collectCases(section.id);
    const allSelected = allIds.length > 0 && allIds.every(id => selectedCases.has(id));
    const someSelected = allIds.some(id => selectedCases.has(id));
    
    // Показываем раздел, если в нем есть тест-кейсы или дочерние разделы с тест-кейсами
    const hasTestCasesInSection = allIds.length > 0;
    console.log('Section:', section.name, 'has cases:', hasTestCasesInSection, 'allIds:', allIds);
    if (!hasTestCasesInSection) {
      return null;
    }
    return (
      <div key={`${section.id}-${selectedCasesKey}`} style={{ marginLeft: level * 16 }}>
        <div className="flex items-center py-1">
          {childSections.length > 0 || sectionCases.length > 0 ? (
            <button 
              type="button" 
              onClick={() => handleToggleSection(section.id)} 
              className="mr-1 p-0.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-800 focus:outline-none"
              style={{ lineHeight: 0 }}
            >
              {expandedSections.has(section.id) ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
            </button>
          ) : <span className="mr-4" />}
          <input
            type="checkbox"
            checked={allSelected}
            ref={el => { 
              if (el) {
                el.indeterminate = !allSelected && someSelected;
              }
            }}
            onChange={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleToggleSectionCheckbox(section.id);
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="mr-2"
          />
          <span className="font-semibold text-gray-800">{section.name}</span>
        </div>
        {expandedSections.has(section.id) && (
          <div>
            {sectionCases.map(tc => renderCase(tc, level + 1))}
            {childSections.map(child => renderSection(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderCase = (tc: TestCase, level = 0) => (
    <div key={`${tc.id}-${selectedCases.has(tc.id)}`} style={{ marginLeft: level * 16 + 24 }} className="flex items-center py-1">
      <input
        type="checkbox"
        checked={selectedCases.has(tc.id)}
        onChange={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleToggleCase(tc.id);
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="mr-2"
      />
      <span className="text-gray-900">{tc.title}</span>
      <span className="ml-2 text-xs px-2 px-2 py-1 rounded-full bg-gray-100 text-gray-700">{tc.priority}</span>
      <span className="ml-2 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{tc.status}</span>
    </div>
  );

  const handleAdd = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/test-plans/${testPlanId}/test-cases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testCaseIds: Array.from(selectedCases) })
      });
      
      if (response.ok) {
        setSelectedCases(new Set());
        onAdded();
        onClose();
      } else {
        console.error('Ошибка добавления тест-кейсов в план');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Добавить тест-кейсы в план</h2>
        {loading ? (
          <div className="text-center py-8">Загрузка...</div>
        ) : (
          <form onSubmit={e => { e.preventDefault(); handleAdd(); }}>
                    <div className="mb-4">
          {/* Отображаем разделы в иерархическом виде */}
          {sections.filter(s => !s.parent_id).map(section => renderSection(section))}
          {/* Кейсы без раздела */}
          {getSectionTestCases(null).map(tc => renderCase(tc, 0))}
        </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">Отмена</button>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700" disabled={selectedCases.size === 0 || loading}>Добавить</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddTestCasesToPlanModal; 