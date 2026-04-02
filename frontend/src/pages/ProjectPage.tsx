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
    const response = await getProjects();
    setProjects(response.data);
  };

  useEffect(() => {
    loadProjects().finally(() => setLoading(false));
    void getUsers().then((res) => setAllUsers(res.data));
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400 text-sm tracking-widest uppercase">
          Loading...
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-100 via-cyan-100 to-amber-100">
      <Header />

      <div className="bg-white/80 backdrop-blur border-b border-indigo-100 px-4 lg:px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Projects</h1>
          <p className="text-sm text-slate-400">{projects.length} projects</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700 transition-colors"
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[520px] max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">
                Share "{sharingProject.name}"
              </h2>
              <button
                onClick={() => setSharingProject(null)}
                className="text-slate-400"
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
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
                  >
                    <span className="text-sm text-slate-700">
                      {user.name} ({user.email})
                    </span>
                    <input
                      type="checkbox"
                      checked={shared}
                      onChange={() =>
                        handleToggleShare(sharingProject.id, user.id, shared)
                      }
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
