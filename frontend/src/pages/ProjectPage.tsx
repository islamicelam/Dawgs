import { useState, useEffect } from "react";
import {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
} from "../api/projects";
import { createBoard } from "../api/boards";
import type { Project } from "../types";
import Header from "../components/Header";
import ProjectCard from "../components/project/ProjectCard";
import ProjectFormModal from "../components/project/ProjectFormModal";
import ConfirmModal from "../components/common/ConfirmModal";

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<number | null>(
    null,
  );

  const loadProjects = async () => {
    const response = await getProjects();
    setProjects(response.data);
  };

  useEffect(() => {
    loadProjects().finally(() => setLoading(false));
  }, []);

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
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
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

      <div className="p-8 grid grid-cols-4 gap-5">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={setEditingProject}
            onDelete={setDeletingProjectId}
            onAddBoard={handleAddBoard}
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

      {deletingProjectId && (
        <ConfirmModal
          message="Are you sure you want to delete this project?"
          onConfirm={handleDelete}
          onCancel={() => setDeletingProjectId(null)}
        />
      )}
    </div>
  );
};

export default ProjectsPage;
