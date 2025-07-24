import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectModal from '../components/ProjectModal.tsx';
import EditProjectModal from '../components/EditProjectModal.tsx';

interface Project {
  id: number;
  name: string;
  description?: string;
  gitRepoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        // Преобразуем git_repo_url -> gitRepoUrl для фронта
        setProjects(data.map((p: any) => ({
          ...p,
          gitRepoUrl: p.git_repo_url,
          createdAt: p.created_at,
          updatedAt: p.updated_at
        })));
      } else {
        console.error('Ошибка загрузки проектов');
      }
    } catch (error) {
      console.error('Ошибка загрузки проектов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (projectData: any) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...projectData,
          git_repo_url: projectData.gitRepoUrl
        }),
      });

      if (response.ok) {
        const newProject = await response.json();
        setProjects([newProject, ...projects]);
      } else {
        console.error('Ошибка создания проекта');
      }
    } catch (error) {
      console.error('Ошибка создания проекта:', error);
    }
  };

  const handleEditProject = async (projectData: Project) => {
    try {
      const response = await fetch(`/api/projects/${projectData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...projectData,
          git_repo_url: projectData.gitRepoUrl
        }),
      });

      if (response.ok) {
        const updatedProject = await response.json();
        setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
      } else {
        console.error('Ошибка обновления проекта');
      }
    } catch (error) {
      console.error('Ошибка обновления проекта:', error);
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот проект? Это действие нельзя отменить.')) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProjects(projects.filter(p => p.id !== projectId));
      } else {
        console.error('Ошибка удаления проекта');
      }
    } catch (error) {
      console.error('Ошибка удаления проекта:', error);
    }
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Проекты</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Создать проект
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">
            Проекты не найдены
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Создать первый проект
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {project.name}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(project)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                {project.description && (
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {project.description}
                  </p>
                )}
                
                {project.gitRepoUrl && (
                  <div className="text-sm text-gray-500 mb-4">
                    <a 
                      href={project.gitRepoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      📁 Git репозиторий
                    </a>
                  </div>
                )}
                
                <div className="text-sm text-gray-500 mb-4">
                  Создан: {new Date(project.createdAt || '').toLocaleDateString()}
                </div>
                
                <button
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Открыть проект →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно создания проекта */}
      <ProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateProject}
      />

      {/* Модальное окно редактирования проекта */}
      <EditProjectModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingProject(null);
        }}
        project={editingProject}
        onSave={handleEditProject}
      />
    </div>
  );
};

export default Projects; 