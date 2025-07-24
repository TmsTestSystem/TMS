import React, { useState, useEffect } from 'react';

interface DashboardStats {
  projects: number;
  testPlans: number;
  testCases: number;
  testRuns: number;
  activeTestRuns: number;
  completedTestRuns: number;
  passedTests: number;
  failedTests: number;
  blockedTests: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    projects: 0,
    testPlans: 0,
    testCases: 0,
    testRuns: 0,
    activeTestRuns: 0,
    completedTestRuns: 0,
    passedTests: 0,
    failedTests: 0,
    blockedTests: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Получаем статистику по проектам
      const projectsResponse = await fetch('/api/projects');
      const projects = await projectsResponse.json();
      
      // Получаем статистику по тест-планам
      const testPlansResponse = await fetch('/api/test-plans');
      const testPlans = await testPlansResponse.json();
      
      // Получаем статистику по тест-кейсам
      const testCasesResponse = await fetch('/api/test-cases');
      const testCases = await testCasesResponse.json();
      
      // Получаем статистику по тестовым прогонам
      const testRunsResponse = await fetch('/api/test-runs');
      const testRuns = await testRunsResponse.json();
      
      // Вычисляем статистику
      const activeTestRuns = testRuns.filter((run: any) => run.status === 'in_progress').length;
      const completedTestRuns = testRuns.filter((run: any) => run.status === 'completed').length;
      
      let passedTests = 0;
      let failedTests = 0;
      let blockedTests = 0;
      
      testRuns.forEach((run: any) => {
        passedTests += run.passed_count || 0;
        failedTests += run.failed_count || 0;
        blockedTests += run.blocked_count || 0;
      });
      
      setStats({
        projects: projects.length,
        testPlans: testPlans.length,
        testCases: testCases.length,
        testRuns: testRuns.length,
        activeTestRuns,
        completedTestRuns,
        passedTests,
        failedTests,
        blockedTests
      });
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setLoading(false);
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Дашборд</h1>
        <p className="text-gray-600">Обзор системы управления тестированием</p>
      </div>

      {/* Основная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Проекты</p>
              <p className="text-2xl font-semibold text-gray-900">{Number(stats.projects)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Тест-планы</p>
              <p className="text-2xl font-semibold text-gray-900">{Number(stats.testPlans)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Тест-кейсы</p>
              <p className="text-2xl font-semibold text-gray-900">{Number(stats.testCases)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Тестовые прогоны</p>
              <p className="text-2xl font-semibold text-gray-900">{Number(stats.testRuns)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Статистика тестирования */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Статус тестовых прогонов</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Активные</span>
              </div>
              <span className="font-semibold text-gray-900">{Number(stats.activeTestRuns)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Завершенные</span>
              </div>
              <span className="font-semibold text-gray-900">{Number(stats.completedTestRuns)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Запланированные</span>
              </div>
              <span className="font-semibold text-gray-900">{Number(stats.testRuns - stats.activeTestRuns - stats.completedTestRuns)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Результаты тестов</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Пройдено</span>
              </div>
              <span className="font-semibold text-gray-900">{Number(stats.passedTests)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Провалено</span>
              </div>
              <span className="font-semibold text-gray-900">{Number(stats.failedTests)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Заблокировано</span>
              </div>
              <span className="font-semibold text-gray-900">{Number(stats.blockedTests)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Быстрые действия</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.location.href = '/projects'}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <div className="text-left">
              <p className="font-medium text-gray-900">Создать проект</p>
              <p className="text-sm text-gray-600">Добавить новый проект</p>
            </div>
          </button>

          <button
            onClick={() => window.location.href = '/test-plans'}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="text-left">
              <p className="font-medium text-gray-900">Создать тест-план</p>
              <p className="text-sm text-gray-600">Планировать тестирование</p>
            </div>
          </button>

          <button
            onClick={() => window.location.href = '/test-runs'}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-6 h-6 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-left">
              <p className="font-medium text-gray-900">Запустить прогон</p>
              <p className="text-sm text-gray-600">Начать тестирование</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 