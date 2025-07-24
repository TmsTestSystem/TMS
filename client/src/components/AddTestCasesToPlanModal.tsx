import React, { useEffect, useState } from 'react';

interface TestCase {
  id: number;
  title: string;
  status: string;
  priority: string;
  section_id: number | null;
}

interface Section {
  id: number;
  name: string;
  parent_id: number | null;
}

interface AddTestCasesToPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  testPlanId: number;
  onAdded: () => void;
}

const AddTestCasesToPlanModal: React.FC<AddTestCasesToPlanModalProps> = ({ isOpen, onClose, projectId, testPlanId, onAdded }) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [selectedCases, setSelectedCases] = useState<Set<number>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
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
      const response = await fetch(`/api/test-cases/project/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setTestCases(data.filter((tc: any) => !tc.test_plan_id || tc.test_plan_id === null));
      }
    } finally {
      setLoading(false);
    }
  };

  const getChildSections = (parentId: number | null) => sections.filter(s => s.parent_id === parentId);
  const getSectionTestCases = (sectionId: number | null) => testCases.filter(tc => tc.section_id === sectionId);

  const handleToggleSection = (sectionId: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId); else next.add(sectionId);
      return next;
    });
  };

  const handleToggleCase = (caseId: number) => {
    setSelectedCases(prev => {
      const next = new Set(prev);
      if (next.has(caseId)) next.delete(caseId); else next.add(caseId);
      return next;
    });
  };

  const handleToggleSectionCheckbox = (sectionId: number) => {
    // Выделить/снять все кейсы в разделе (и вложенных)
    const collectCases = (sid: number): number[] => {
      let ids = getSectionTestCases(sid).map(tc => tc.id);
      for (const child of getChildSections(sid)) {
        ids = ids.concat(collectCases(child.id));
      }
      return ids;
    };
    const allIds = collectCases(sectionId);
    const allSelected = allIds.every(id => selectedCases.has(id));
    setSelectedCases(prev => {
      const next = new Set(prev);
      if (allSelected) {
        allIds.forEach(id => next.delete(id));
      } else {
        allIds.forEach(id => next.add(id));
      }
      return next;
    });
  };

  const renderSection = (section: Section, level = 0) => {
    const childSections = getChildSections(section.id);
    const sectionCases = getSectionTestCases(section.id);
    // Определяем, выбраны ли все кейсы в разделе (и вложенных)
    const collectCases = (sid: number): number[] => {
      let ids = getSectionTestCases(sid).map(tc => tc.id);
      for (const child of getChildSections(sid)) {
        ids = ids.concat(collectCases(child.id));
      }
      return ids;
    };
    const allIds = collectCases(section.id);
    const allSelected = allIds.length > 0 && allIds.every(id => selectedCases.has(id));
    const someSelected = allIds.some(id => selectedCases.has(id));
    return (
      <div key={section.id} style={{ marginLeft: level * 16 }}>
        <div className="flex items-center py-1">
          {childSections.length > 0 || sectionCases.length > 0 ? (
            <button type="button" onClick={() => handleToggleSection(section.id)} className="mr-1 text-gray-500 hover:text-gray-800">
              {expandedSections.has(section.id) ? '▼' : '▶'}
            </button>
          ) : <span className="mr-4" />}
          <input
            type="checkbox"
            checked={allSelected}
            ref={el => { if (el) el.indeterminate = !allSelected && someSelected; }}
            onChange={() => handleToggleSectionCheckbox(section.id)}
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
    <div key={tc.id} style={{ marginLeft: level * 16 + 24 }} className="flex items-center py-1">
      <input
        type="checkbox"
        checked={selectedCases.has(tc.id)}
        onChange={() => handleToggleCase(tc.id)}
        className="mr-2"
      />
      <span className="text-gray-900">{tc.title}</span>
      <span className="ml-2 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{tc.priority}</span>
      <span className="ml-2 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{tc.status}</span>
    </div>
  );

  const handleAdd = async () => {
    setLoading(true);
    try {
      await Promise.all(Array.from(selectedCases).map(tcId =>
        fetch(`/api/test-cases/${tcId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ testPlanId })
        })
      ));
      setSelectedCases(new Set());
      onAdded();
      onClose();
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