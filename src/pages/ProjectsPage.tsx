import { useState, useEffect } from "react";
import { createProject, getProjects } from "../api/projects";
import { useNavigate } from "react-router-dom";
import type { Project } from "../types";
import { createBoard } from "../api/boards";

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");

  const [isAddingBoard, setIsAddingBoard] = useState<number | null>(null);
  const [newBoardName, setNewBoardName] = useState("");

  const navigate = useNavigate();

  const handleCreateProject = async () => {
    await createProject({
      name: newProjectName,
      description: newProjectDescription,
    });
    setIsModalOpen(false);
    setNewProjectName("");
    setNewProjectDescription("");
    const response = await getProjects();
    setProjects(response.data);
  };

  const handleCreateBoard = async (projectId: number) => {
    await createBoard(projectId, { name: newBoardName });
    setIsAddingBoard(null);
    setNewBoardName("");
    const response = await getProjects();
    setProjects(response.data);
  };

  useEffect(() => {
    getProjects()
      .then((response) => setProjects(response.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400 text-sm tracking-widest uppercase">
          Loading...
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 w-full">
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              New project
            </h2>
            <input
              type="text"
              placeholder="Project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-blue-400"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:border-blue-400"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateProject}
                className="flex-1 bg-slate-800 text-white rounded-lg py-2 text-sm hover:bg-slate-700 transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-slate-100 text-slate-500 rounded-lg py-2 text-sm hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Projects</h1>
          <p className="text-sm text-slate-400">{projects.length} projects</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700 transition-colors"
        >
          + New project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="p-8 grid grid-cols-4 gap-5">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="p-5 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">{project.name}</h2>
              <p className="text-sm text-slate-400 mt-1">
                {project.description}
              </p>
            </div>
            <div className="p-3 flex flex-col gap-2">
              {project.boards.length === 0 && (
                <p className="text-xs text-slate-300 text-center py-2">
                  No boards yet
                </p>
              )}
              {project.boards.map((board) => (
                <div
                  key={board.id}
                  onClick={() => navigate(`/boards/${board.id}`)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors group"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-400 group-hover:bg-blue-500 transition-colors" />
                  <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                    {board.name}
                  </span>
                </div>
              ))}
              {isAddingBoard === project.id ? (
                <div className="flex gap-2 mt-2">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Board name..."
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleCreateBoard(project.id)
                    }
                    className="flex-1 border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-blue-400"
                  />
                  <button
                    onClick={() => setIsAddingBoard(null)}
                    className="text-xs text-slate-400"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingBoard(project.id)}
                  className="w-full text-left text-xs text-slate-300 hover:text-slate-500 mt-2 py-1 transition-colors"
                >
                  + Add board
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;
