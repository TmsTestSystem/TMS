import React, { useRef, useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { 
  Home, 
  FolderOpen, 
  FileText, 
  ClipboardList, 
  Play, 
  LogOut,
  User,
  Menu,
} from 'lucide-react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [dumpLoading, setDumpLoading] = React.useState(false);
  const [importLoading, setImportLoading] = React.useState(false);
  const [toast, setToast] = React.useState<string|null>(null);
  const [importModalOpen, setImportModalOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    // Удаляю showImportBanner, dumpsInfo, importingDump, handleImportLatestDump, и сам баннер из JSX
  }, []);
  React.useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const navigation = [
    { name: 'Дашборд', href: '/', icon: Home },
    { name: 'Проекты', href: '/projects', icon: FolderOpen },
    { name: 'Тест-кейсы', href: '/test-cases', icon: FileText },
    { name: 'Тест-планы', href: '/test-plans', icon: ClipboardList },
    { name: 'Тестовые прогоны', href: '/test-runs', icon: Play },
  ];

  // Кастомный тултип для кнопки Импортировать дамп
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<'top'|'bottom'>('bottom');
  const importBtnRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleTooltip = (show: boolean) => {
    if (show && importBtnRef.current) {
      const rect = importBtnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setTooltipPos(spaceBelow < 120 ? 'top' : 'bottom');
    }
    setShowTooltip(show);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Мобильный hamburger */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-white rounded-full p-2 shadow"
        onClick={() => setSidebarOpen(true)}
        aria-label="Открыть меню"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* Sidebar */}
      {/* Desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-50 md:w-64 md:block sidebar bg-white border-r border-gray-200 h-full overflow-y-auto">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">ТМС для СПР</h1>
          </div>
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          {/* User info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center mb-3">
              <User className="w-5 h-5 text-gray-500 mr-2" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="my-4 border-t border-gray-200 pt-4 space-y-2">
              <button
                onClick={async () => {
                  setDumpLoading(true);
                  try {
                    const res = await fetch('/api/db/dump');
                    if (res.ok) {
                      const blob = await res.blob();
                      const now = new Date();
                      const pad = (n: number) => n.toString().padStart(2, '0');
                      const dateStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
                      const filename = `dump-${dateStr}.sql`;
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = filename;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      window.URL.revokeObjectURL(url);
                      setToast('Дамп успешно скачан!');
                    } else {
                      setToast('Ошибка при создании дампа БД');
                    }
                  } finally {
                    setDumpLoading(false);
                  }
                }}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={dumpLoading}
              >
                <FileText className="w-4 h-4 mr-2" />
                {dumpLoading ? 'Скачивание...' : 'Скачать дамп БД'}
              </button>
              <button
                ref={importBtnRef}
                onClick={() => setImportModalOpen(true)}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-green-700 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                onMouseEnter={() => handleTooltip(true)}
                onMouseLeave={() => handleTooltip(false)}
                onFocus={() => handleTooltip(true)}
                onBlur={() => handleTooltip(false)}
              >
                <FileText className="w-4 h-4 mr-2" />
                Импортировать дамп
                <span className="relative group ml-2">
                  <InformationCircleIcon className="w-4 h-4 text-green-600 cursor-pointer" />
                  {showTooltip && (
                    <div
                      ref={tooltipRef}
                      className={`absolute left-1/2 z-50 w-72 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-xs text-gray-800 transition-opacity duration-200 ${tooltipPos === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}`}
                      style={{ transform: 'translateX(-50%)' }}
                    >
                      <b>Зачем это нужно?</b><br/>
                      Импорт дампа полностью заменяет вашу локальную базу на версию из файла. Это нужно, чтобы синхронизировать данные с командой или восстановить актуальное состояние.<br/><br/>
                      <b>Внимание:</b> все локальные изменения будут потеряны!
                    </div>
                  )}
                </span>
              </button>
            </div>
            {toast && (
              <div className="fixed bottom-4 left-4 z-50 bg-gray-900 text-white px-4 py-2 rounded shadow-lg animate-fade-in">
                {toast}
              </div>
            )}
            {importModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs relative">
                  <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
                    onClick={() => setImportModalOpen(false)}
                    aria-label="Закрыть"
                  >
                    ×
                  </button>
                  <h2 className="text-lg font-semibold mb-4">Импорт дампа БД</h2>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const fileInput = fileInputRef.current;
                      if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
                        setToast('Выберите файл дампа для импорта');
                        return;
                      }
                      setImportLoading(true);
                      const formData = new FormData();
                      formData.append('dump', fileInput.files[0]);
                      const res = await fetch('/api/db/import', {
                        method: 'POST',
                        body: formData,
                      });
                      if (res.ok) {
                        setToast('Дамп успешно импортирован!');
                        setImportModalOpen(false);
                        window.location.reload();
                      } else {
                        const err = await res.json().catch(() => ({}));
                        setToast('Ошибка при импорте дампа: ' + (err.details || err.error || 'Неизвестная ошибка'));
                      }
                      setImportLoading(false);
                      if (fileInput) fileInput.value = '';
                    }}
                  >
                    <input
                      type="file"
                      name="importDump"
                      accept=".sql"
                      className="block w-full text-xs text-gray-700 border border-gray-200 rounded mb-3"
                      required
                      ref={fileInputRef}
                      disabled={importLoading}
                    />
                    <button
                      type="submit"
                      className="flex items-center w-full px-3 py-2 text-sm font-medium text-green-700 rounded-lg hover:bg-green-100 transition-colors border border-green-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      disabled={importLoading}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {importLoading ? 'Импорт...' : 'Импортировать дамп'}
                    </button>
                    <div className="text-xs text-gray-400 mt-2">Только .sql файлы. Импорт полностью заменяет данные!</div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile sidebar (drawer) */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black bg-opacity-40 md:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg flex flex-col md:hidden animate-slide-in">
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
              <h1 className="text-xl font-bold text-gray-900">ТМС для СПР</h1>
              <button onClick={() => setSidebarOpen(false)} aria-label="Закрыть меню" className="p-2">
                ✕
              </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center mb-3">
                <User className="w-5 h-5 text-gray-500 mr-2" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <div className="my-4 border-t border-gray-200 pt-4 space-y-2">
                <button
                  onClick={async () => {
                    setDumpLoading(true);
                    try {
                      const res = await fetch('/api/db/dump');
                      if (res.ok) {
                        const blob = await res.blob();
                        const now = new Date();
                        const pad = (n: number) => n.toString().padStart(2, '0');
                        const dateStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
                        const filename = `dump-${dateStr}.sql`;
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(url);
                        setToast('Дамп успешно скачан!');
                      } else {
                        setToast('Ошибка при создании дампа БД');
                      }
                    } finally {
                      setDumpLoading(false);
                    }
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm font-medium text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={dumpLoading}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {dumpLoading ? 'Скачивание...' : 'Скачать дамп БД'}
                </button>
                <button
                  onClick={() => setImportModalOpen(true)}
                  className="flex items-center w-full px-3 py-2 text-sm font-medium text-green-700 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Импортировать дамп
                  <span className="relative group ml-2">
                    <InformationCircleIcon className="w-4 h-4 text-green-600 cursor-pointer" />
                    <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-xs text-gray-800 z-50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200">
                      <b>Зачем это нужно?</b><br/>
                      Импорт дампа полностью заменяет вашу локальную базу на версию из файла. Это нужно, чтобы синхронизировать данные с командой или восстановить актуальное состояние.<br/><br/>
                      <b>Внимание:</b> все локальные изменения будут потеряны!
                    </span>
                  </span>
                </button>
              </div>
              {toast && (
                <div className="fixed bottom-4 left-4 z-50 bg-gray-900 text-white px-4 py-2 rounded shadow-lg animate-fade-in">
                  {toast}
                </div>
              )}
              {importModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs relative">
                    <button
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
                      onClick={() => setImportModalOpen(false)}
                      aria-label="Закрыть"
                    >
                      ×
                    </button>
                    <h2 className="text-lg font-semibold mb-4">Импорт дампа БД</h2>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const fileInput = fileInputRef.current;
                        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
                          setToast('Выберите файл дампа для импорта');
                          return;
                        }
                        setImportLoading(true);
                        const formData = new FormData();
                        formData.append('dump', fileInput.files[0]);
                        const res = await fetch('/api/db/import', {
                          method: 'POST',
                          body: formData,
                        });
                        if (res.ok) {
                          setToast('Дамп успешно импортирован!');
                          setImportModalOpen(false);
                          window.location.reload();
                        } else {
                          const err = await res.json().catch(() => ({}));
                          setToast('Ошибка при импорте дампа: ' + (err.details || err.error || 'Неизвестная ошибка'));
                        }
                        setImportLoading(false);
                        if (fileInput) fileInput.value = '';
                      }}
                    >
                      <input
                        type="file"
                        name="importDump"
                        accept=".sql"
                        className="block w-full text-xs text-gray-700 border border-gray-200 rounded mb-3"
                        required
                        ref={fileInputRef}
                        disabled={importLoading}
                      />
                      <button
                        type="submit"
                        className="flex items-center w-full px-3 py-2 text-sm font-medium text-green-700 rounded-lg hover:bg-green-100 transition-colors border border-green-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={importLoading}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        {importLoading ? 'Импорт...' : 'Импортировать дамп'}
                      </button>
                      <div className="text-xs text-gray-400 mt-2">Только .sql файлы. Импорт полностью заменяет данные!</div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
      {/* Main content */}
      <div className="flex-1 md:pl-64 pl-0 transition-all min-w-0">
        <main className="p-2 sm:p-4 md:p-6 max-w-full w-full mx-auto min-h-[calc(100vh-64px)] overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout; 