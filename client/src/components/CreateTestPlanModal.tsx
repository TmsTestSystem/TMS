import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface Project {
  id: string;
  name: string;
  description?: string;
}

interface CreateTestPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (testPlan: any) => void;
  editMode?: boolean;
  initialData?: any;
  onUpdate?: (testPlan: any) => void;
}

const CreateTestPlanModal: React.FC<CreateTestPlanModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editMode = false,
  initialData = null,
  onUpdate
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState({
    projectId: '',
    name: '',
    description: '',
    status: 'draft'
  });

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
      if (editMode && initialData) {
        setFormData({
          projectId: initialData.project_id?.toString() || '',
          name: initialData.name || '',
          description: initialData.description || '',
          status: initialData.status || 'draft'
        });
      } else {
        setFormData({
          projectId: '',
          name: '',
          description: '',
          status: 'draft'
        });
      }
    }
  }, [isOpen, editMode, initialData]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Ошибка загрузки проектов:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let response;
      if (editMode && initialData) {
        response = await fetch(`/api/test-plans/${initialData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: formData.projectId,
            name: formData.name,
            description: formData.description,
            status: formData.status
          })
        });
      } else {
        response = await fetch('/api/test-plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: formData.projectId,
            name: formData.name,
            description: formData.description,
            status: formData.status
          })
        });
      }
      if (response.ok) {
        const testPlan = await response.json();
        if (editMode && onUpdate) {
          onUpdate(testPlan);
        } else if (onSave) {
          onSave(testPlan);
        }
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.error || (editMode ? 'Ошибка обновления тест-плана' : 'Ошибка создания тест-плана'));
      }
    } catch (error) {
      console.error(editMode ? 'Ошибка обновления тест-плана:' : 'Ошибка создания тест-плана:', error);
      toast.error(editMode ? 'Ошибка обновления тест-плана' : 'Ошибка создания тест-плана');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{editMode ? 'Редактировать тест-план' : 'Создать тест-план'}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Проект *
            </label>
            <select
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={editMode}
            >
              <option value="">Выберите проект</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите название тест-плана"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Описание тест-плана"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Статус
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Черновик</option>
              <option value="active">Активный</option>
              <option value="completed">Завершен</option>
              <option value="archived">Архив</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg px-5 py-2 font-semibold shadow hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {editMode ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTestPlanModal; 