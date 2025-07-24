import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronRightIcon, ChevronDownIcon, PlayIcon, PauseIcon, StopIcon, PencilIcon, XMarkIcon, CheckCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import TestRunCaseSidebar from '../components/TestRunCaseSidebar.tsx';

interface TestRun {
  id: number;
  name: string;
  description?: string;
  status: string;
  test_plan_id: number;
  test_plan_name: string;
  project_id: number;
  project_name: string;
}

interface Section {
  id: number;
  parent_id: number | null;
  name: string;
  order_index: number;
}

interface TestResult {
  id: number;
  test_case_id: number;
  test_case_title: string;
  test_case_description?: string;
  test_case_priority: string;
  status: string;
  notes?: string;
  duration?: number;
  executed_by_name?: string;
  executed_at?: string;
  section_id?: number;
  steps?: string;
  expected_result?: string;
  preconditions?: string;
}

const TestRunDetail: React.FC = () => {
  const { id } = useParams();
  const [testRun, setTestRun] = useState<TestRun | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [activeTimers, setActiveTimers] = useState<{ [key: number]: { running: boolean; seconds: number; paused: boolean } }>({});
  const [modalCase, setModalCase] = useState<TestResult | null>(null);
  const [modalStatus, setModalStatus] = useState('passed');
  const [modalComment, setModalComment] = useState('');
  const [modalTime, setModalTime] = useState('');
  const [sidebarCaseId, setSidebarCaseId] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      fetchData(Number(id));
    }
  }, [id]);

  // Таймеры
  useEffect(() => {
    // Восстановление таймеров из localStorage
    const saved = localStorage.getItem('testRunTimers');
    if (saved) {
      setActiveTimers(JSON.parse(saved));
    }
    const interval = setInterval(() => {
      setActiveTimers(prev => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach(id => {
          if (next[+id].running && !next[+id].paused) {
            next[+id].seconds += 1;
            changed = true;
          }
          // Если статус не in_progress, сбрасываем таймер
          if (!results.find(r => r.test_case_id === +id && r.status === 'in_progress')) {
            next[+id] = { running: false, seconds: 0, paused: false };
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem('testRunTimers', JSON.stringify(next));
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [results]);

  // Формат времени
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const fetchData = async (testRunId: number) => {
    setLoading(true);
    try {
      // Получаем инфо о прогоне
      const runRes = await fetch(`/api/test-runs/${testRunId}`);
      const runData = await runRes.json();
      setTestRun(runData);

      // Получаем дерево разделов проекта
      if (runData && runData.test_plan_id) {
        // Получаем id проекта через тест-план
        const planRes = await fetch(`/api/test-plans/${runData.test_plan_id}`);
        const planData = await planRes.json();
        const projectId = planData.project_id;
        if (projectId) {
          const sectionsRes = await fetch(`/api/test-case-sections/project/${projectId}`);
          setSections(await sectionsRes.json());
        }
      }

      // Получаем результаты кейсов прогона
      const resultsRes = await fetch(`/api/test-runs/${testRunId}/results`);
      setResults(await resultsRes.json());
    } catch (e) {
      // TODO: обработка ошибок
    } finally {
      setLoading(false);
    }
  };

  // Получить подразделы
  const getChildSections = (parentId: number | null) =>
    sections.filter(s => s.parent_id === parentId);

  // Получить кейсы раздела (только те, что есть в results)
  const getSectionResults = (sectionId: number | null) => results.filter(r => r.section_id === sectionId);

  // Рекурсивный рендер раздела
  const renderSection = (section: Section, level: number = 0) => {
    const isExpanded = expandedSections.has(section.id);
    const childSections = getChildSections(section.id);
    const sectionResults = getSectionResults(section.id);
    return (
      <div key={section.id} style={{ marginLeft: level * 16 }}>
        <div className="flex items-center font-semibold text-gray-800 py-1 cursor-pointer" style={{ fontSize: 14 }}
          onClick={() => {
            setExpandedSections(prev => {
              const next = new Set(prev);
              if (next.has(section.id)) next.delete(section.id); else next.add(section.id);
              return next;
            });
          }}
        >
          {(childSections.length > 0 || sectionResults.length > 0) && (
            isExpanded ? <ChevronDownIcon className="w-4 h-4 mr-1" /> : <ChevronRightIcon className="w-4 h-4 mr-1" />
          )}
          {section.name}
        </div>
        {isExpanded && (
          <div>
            {childSections.map(child => renderSection(child, level + 1))}
            {sectionResults.map(result => renderTestCase(result, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Управление кейсом
  const handleStart = (result: TestResult) => {
    setActiveTimers(prev => ({ ...prev, [result.test_case_id]: { running: true, seconds: prev[result.test_case_id]?.seconds || 0, paused: false } }));
    console.log('handleStart: updateCaseStatus(', result.test_case_id, ', in_progress)');
    updateCaseStatus(result.test_case_id, 'in_progress');
  };
  const handlePause = (result: TestResult) => {
    setActiveTimers(prev => ({ ...prev, [result.test_case_id]: { ...prev[result.test_case_id], paused: !prev[result.test_case_id]?.paused } }));
  };
  const handleStop = (result: TestResult) => {
    setModalCase(result);
    setModalStatus('passed');
    setModalComment('');
    setModalTime(activeTimers[result.test_case_id]?.seconds ? formatTime(activeTimers[result.test_case_id].seconds) : '');
  };
  const handleModalSave = async () => {
    if (!modalCase) return;
    await updateCaseStatus(modalCase.test_case_id, modalStatus, modalComment, modalTime);
    setModalCase(null);
    setActiveTimers(prev => ({ ...prev, [modalCase.test_case_id]: { running: false, seconds: 0, paused: false } }));
  };

  // Обновление статуса кейса
  const updateCaseStatus = async (testCaseId: number, status: string, notes?: string, durationStr?: string) => {
    const duration = durationStr ? parseInt(durationStr.split(':')[0]) * 60 + parseInt(durationStr.split(':')[1]) : undefined;
    console.log('PUT /api/test-runs/', testRun?.id, '/results/', testCaseId, { status, notes, duration });
    try {
      await fetch(`/api/test-runs/${testRun?.id}/results/${testCaseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes, duration })
      });
      // После успешного обновления подтягиваем актуальные данные
      if (testRun?.id) fetchData(testRun.id);
      setResults(results => results.map(r => r.test_case_id === testCaseId ? { ...r, status, notes, duration } : r));
      // Управление таймером
      setActiveTimers(prev => {
        const next = { ...prev };
        if (status === 'in_progress') {
          next[testCaseId] = { running: true, seconds: prev[testCaseId]?.seconds || 0, paused: false };
        } else {
          next[testCaseId] = { running: false, seconds: 0, paused: false };
        }
        localStorage.setItem('testRunTimers', JSON.stringify(next));
        return next;
      });
    } catch {}
  };

  // Рендер тест-кейса
  const renderTestCase = (result: TestResult, level: number) => {
    // Получаем таймер для кейса из состояния или localStorage
    let timerData = activeTimers[result.test_case_id];
    if (!timerData) {
      const saved = localStorage.getItem('testRunTimers');
      if (saved) {
        const timers = JSON.parse(saved);
        if (timers[result.test_case_id]) timerData = timers[result.test_case_id];
      }
    }
    const seconds = timerData?.seconds || 0;
    const running = timerData?.running || false;
    const paused = timerData?.paused || false;
    // Для завершённых кейсов отображаем duration, если есть
    const showDuration = (result.status === 'passed' || result.status === 'failed') && result.duration !== undefined;
    return (
      <div key={result.test_case_id} style={{ marginLeft: level * 16 }} className="flex items-center py-1 text-sm hover:bg-blue-50 rounded cursor-pointer"
        onClick={() => setSidebarCaseId(result.test_case_id)}>
        <span className="w-2 h-2 rounded-full mr-2" style={{ background: result.status === 'passed' ? '#22c55e' : result.status === 'failed' ? '#ef4444' : result.status === 'in_progress' ? '#3b82f6' : '#a3a3a3' }}></span>
        <span className="flex-1 font-medium flex items-center gap-2">
          {result.test_case_title}
          {/* Таймер/длительность и кнопки управления */}
          <span className="font-mono text-xs ml-2">
            {showDuration ? formatTime(result.duration ?? 0) : formatTime(seconds)}
          </span>
          {running ? (
            <>
              <button className="ml-1 p-1 text-yellow-600 hover:bg-yellow-100 rounded btn-icon-sm" title="Пауза" onClick={e => { e.stopPropagation(); handlePause(result); }}>
                {paused ? <PlayIcon className="w-4 h-4" /> : <PauseIcon className="w-4 h-4" />}
              </button>
              <button className="ml-1 p-1 text-red-600 hover:bg-red-100 rounded btn-icon-sm" title="Стоп" onClick={e => { e.stopPropagation(); handleStop(result); setActiveTimers(prev => { const next = { ...prev, [result.test_case_id]: { ...prev[result.test_case_id], running: false, paused: false } }; localStorage.setItem('testRunTimers', JSON.stringify(next)); return next; }); }}>
                <StopIcon className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button className="ml-1 p-1 text-blue-600 hover:bg-blue-100 rounded btn-icon-sm" title="Начать кейс" onClick={e => { e.stopPropagation(); handleStart(result); }}>
              <PlayIcon className="w-4 h-4" />
            </button>
          )}
          {(result.status === 'passed' || result.status === 'failed') && (
            <button className="ml-1 p-1 text-gray-500 hover:bg-gray-200 rounded btn-icon-sm" title="Редактировать результат" onClick={e => { e.stopPropagation(); handleEditResult(result); }}>
              <PencilIcon className="w-4 h-4" />
            </button>
          )}
        </span>
        <span className="ml-2 text-xs text-gray-500">{getStatusText(result.status)}</span>
      </div>
    );
  };

  // Добавляю функцию handleEditResult
  const handleEditResult = (result: TestResult) => {
    setModalCase(result);
    setModalStatus(result.status);
    setModalComment(result.notes || '');
    setModalTime(result.duration ? formatTime(result.duration) : '');
  };

  // Кейсы без раздела
  const unassignedResults = getSectionResults(null);

  // Модалка завершения кейса
  const renderModal = () => modalCase && (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Завершение тест-кейса</h2>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Статус</label>
          <select value={modalStatus} onChange={e => setModalStatus(e.target.value)} className="w-full border rounded px-2 py-1">
            <option value="passed">Выполнен</option>
            <option value="failed">Ошибка</option>
          </select>
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Комментарий</label>
          <textarea value={modalComment} onChange={e => setModalComment(e.target.value)} className="w-full border rounded px-2 py-1" rows={2} />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Время выполнения (мм:сс)</label>
          <input type="text" value={modalTime} onChange={e => setModalTime(e.target.value)} className="w-full border rounded px-2 py-1 font-mono" placeholder="0:00" />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={() => setModalCase(null)} className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">Отмена</button>
          <button onClick={handleModalSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Сохранить</button>
        </div>
      </div>
    </div>
  );

  // Сайдбар подробностей по кейсу
  // Заменяю renderSidebar на использование TestRunCaseSidebar

  const getStatusText = (status: string) => {
    switch (status) {
      case 'not_run': return 'Не пройдено';
      case 'in_progress': return 'Выполняется';
      case 'passed': return 'Выполнен';
      case 'failed': return 'Ошибка';
      default: return status;
    }
  };

  // Суммарное время выполнения всех кейсов
  const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);

  // Данные для диаграммы
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const blocked = results.filter(r => r.status === 'blocked').length;
  const notRun = results.filter(r => r.status === 'not_run').length;
  const total = results.length;
  const percent = (n: number) => total ? Math.round((n / total) * 100) : 0;

  // Pie chart angles
  const passedAngle = total ? (passed / total) * 360 : 0;
  const failedAngle = total ? (failed / total) * 360 : 0;
  const blockedAngle = total ? (blocked / total) * 360 : 0;
  // Pie chart paths
  function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return [
      'M', start.x, start.y,
      'A', r, r, 0, largeArcFlag, 0, end.x, end.y,
      'L', cx, cy,
      'Z'
    ].join(' ');
  }
  function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
    const rad = (angle - 90) * Math.PI / 180.0;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }
  let start = 0;
  const arcs = [
    { color: '#22c55e', value: passed, angle: passedAngle },
    { color: '#ef4444', value: failed, angle: failedAngle },
    { color: '#facc15', value: blocked, angle: blockedAngle },
  ].map(({ color, value, angle }, i) => {
    const path = describeArc(50, 50, 40, start, start + angle);
    const el = <path key={i} d={path} fill={color} />;
    start += angle;
    return el;
  });

  if (loading) return <div className="p-8 text-center">Загрузка...</div>;
  if (!testRun) return <div className="p-8 text-center text-red-500">Прогон не найден</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Тестовый прогон: {testRun?.test_plan_name}</h1>
      <div className="text-gray-600 mb-4">{testRun?.description}</div>
      {testRun?.status === 'completed' && total > 0 && (
        <div className="mb-8 flex justify-center">
          <div className="bg-white rounded-2xl shadow-xl px-8 py-6 flex flex-col md:flex-row md:items-center gap-8 w-full max-w-2xl border border-gray-100">
            <div className="flex flex-col items-center">
              <div className="mb-2 text-lg font-bold text-gray-800">Результаты прогона</div>
              <svg width="120" height="120" viewBox="0 0 100 100" className="transition-all duration-700">
                {arcs}
                <circle cx="50" cy="50" r="28" fill="#fff" />
                <text x="50" y="55" textAnchor="middle" fontSize="22" fill="#222" fontWeight="bold">{percent(passed)}%</text>
              </svg>
              <div className="flex flex-col gap-2 mt-4 w-full">
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full" style={{background:'#22c55e'}}></span>
                  <span className="font-semibold text-gray-700">Выполнено</span>
                  <span className="ml-auto flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold"><CheckCircleIcon className="w-4 h-4" />{passed} ({percent(passed)}%)</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full" style={{background:'#ef4444'}}></span>
                  <span className="font-semibold text-gray-700">Ошибка</span>
                  <span className="ml-auto flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-bold"><XMarkIcon className="w-4 h-4" />{failed} ({percent(failed)}%)</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full" style={{background:'#facc15'}}></span>
                  <span className="font-semibold text-gray-700">Заблокировано</span>
                  <span className="ml-auto flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-bold"><PauseIcon className="w-4 h-4" />{blocked} ({percent(blocked)}%)</span>
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="text-gray-500 text-sm mb-1">Общее время выполнения</div>
              <div className="text-green-700 font-bold text-2xl tracking-tight">{formatTime(totalDuration)}</div>
            </div>
          </div>
        </div>
      )}
      <div>
        {sections.filter(s => s.parent_id === null).map(section => renderSection(section))}
        {getSectionResults(null).length > 0 && (
          <div className="mt-2">
            <div className="font-semibold text-gray-700" style={{ fontSize: 14 }}>Без раздела</div>
            {getSectionResults(null).map(result => renderTestCase(result, 1))}
          </div>
        )}
      </div>
      {renderModal()}
      <TestRunCaseSidebar
        isOpen={sidebarCaseId !== null}
        onClose={() => setSidebarCaseId(null)}
        testResult={sidebarCaseId !== null ? results.find(r => r.test_case_id === sidebarCaseId) || null : null}
        timerData={sidebarCaseId !== null ? activeTimers[sidebarCaseId] : undefined}
        onPause={handlePause}
        onStart={handleStart}
        onStop={handleStop}
        onEdit={handleEditResult}
        formatTime={formatTime}
      />
    </div>
  );
};

export default TestRunDetail; 