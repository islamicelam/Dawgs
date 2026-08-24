import { useState, useEffect } from 'react';
import {
  createProject,
  getProjects,
  shareProject,
  unshareProject,
  updateProject,
  deleteProject,
} from '../api/projects';
import { createBoard } from '../api/boards';
import { getUsers } from '../api/users';
import type { Project, User } from '../types';
import Header from '../components/Header';
import ProjectCard from '../components/project/ProjectCard';
import ProjectFormModal from '../components/project/ProjectFormModal';
import ConfirmModal from '../components/common/ConfirmModal';
import { BUTTON_PRIMARY_CLS, GHOST_ICON_BUTTON_CLS } from '../constants/ui';

const ProjectsPage = () => {
  const me = JSON.parse(localStorage.getItem('me') ?? 'null') as {
    role?: string;
  } | null;
  const canDelete = me?.role === 'ADMIN';
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<number | null>(
    null,
  );
  const [sharingProject, setSharingProject] = useState<Project | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const loadProjects = async () => {
    const [projectsRes, usersRes] = await Promise.all([
      getProjects(),
      getUsers(),
    ]);
    setProjects(projectsRes.data);
    setAllUsers(usersRes.data);
  };

  useEffect(() => {
    void (async () => {
      try {
        await loadProjects();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleToggleShare = async (
    projectId: number,
    userId: number,
    shared: boolean,
  ) => {
    if (shared) await unshareProject(projectId, userId);
    else await shareProject(projectId, userId);
    const response = await getProjects();
    setProjects(response.data);
    const latest =
      response.data.find((project: Project) => project.id === projectId) ??
      null;
    setSharingProject(latest);
  };

  const handleCreate = async (name: string, description: string) => {
    await createProject({ name, description });
    setIsCreateOpen(false);
    await loadProjects();
  };

  const handleEdit = async (name: string, description: string) => {
    if (!editingProject) return;
    await updateProject(editingProject.id, { name, description });
    setEditingProject(null);
    await loadProjects();
  };

  const handleDelete = async () => {
    if (!deletingProjectId) return;
    await deleteProject(deletingProjectId);
    setDeletingProjectId(null);
    await loadProjects();
  };

  const handleAddBoard = async (projectId: number, name: string) => {
    await createBoard(projectId, { name });
    await loadProjects();
  };

  if (loading)
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-neutral-400 dark:text-neutral-500 text-sm tracking-widest uppercase">
          Loading...
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Header />

      <div className="bg-white/70 dark:bg-neutral-900/40 backdrop-blur border-b border-neutral-200 dark:border-neutral-800 px-4 lg:px-6 py-3.5 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Projects
          </h1>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            {projects.length} projects
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className={`${BUTTON_PRIMARY_CLS} text-sm`}
        >
          + New project
        </button>
      </div>

      <div className="p-4 lg:p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-4">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={setEditingProject}
            onDelete={setDeletingProjectId}
            canDelete={canDelete}
            onAddBoard={handleAddBoard}
            onManageShare={setSharingProject}
          />
        ))}
      </div>

      {isCreateOpen && (
        <ProjectFormModal
          onSubmit={handleCreate}
          onClose={() => setIsCreateOpen(false)}
        />
      )}

      {editingProject && (
        <ProjectFormModal
          project={editingProject}
          onSubmit={handleEdit}
          onClose={() => setEditingProject(null)}
        />
      )}

      {deletingProjectId && canDelete && (
        <ConfirmModal
          message="Are you sure you want to delete this project?"
          onConfirm={handleDelete}
          onCancel={() => setDeletingProjectId(null)}
        />
      )}

      {sharingProject && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-[2px] flex items-center justify-center z-50 animate-fade-in"
          onClick={() => setSharingProject(null)}
        >
          <div
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 w-[520px] max-h-[80vh] overflow-y-auto shadow-xl shadow-black/10 dark:shadow-black/40 animate-modal-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Share "{sharingProject.name}"
              </h2>
              <button
                onClick={() => setSharingProject(null)}
                className={GHOST_ICON_BUTTON_CLS}
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              {allUsers.map((user) => {
                const shared = !!sharingProject.members?.some(
                  (member) => member.id === user.id,
                );
                return (
                  <label
                    key={user.id}
                    className="flex items-center justify-between rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-2"
                  >
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      {user.name} ({user.email})
                    </span>
                    <input
                      type="checkbox"
                      checked={shared}
                      onChange={() =>
                        handleToggleShare(sharingProject.id, user.id, shared)
                      }
                      className="accent-indigo-600"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
