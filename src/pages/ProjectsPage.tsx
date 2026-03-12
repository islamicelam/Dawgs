import { useState, useEffect } from "react";
import { createProject, getProjects } from "../api/projects";
import { useNavigate } from "react-router-dom";

import type { Project } from "../types";

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");

  const navigate = useNavigate();

  const handleCreateProject = async () => {
    await createProject({
      name: newProjectName,
      description: newProjectDescription,
    });
    setIsModalOpen(false);
    const response = await getProjects();
    setProjects(response.data);
  };

  useEffect(() => {
    getProjects()
      .then((response) => setProjects(response.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Create project</h2>
            <input
              type="text"
              placeholder="Name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="w-full border p-2 rounded mb-3"
            />
            <input
              type="text"
              placeholder="Description"
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateProject}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Create
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create project
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {projects.map((project) => (
          <div key={project.id} className="bg-orange-200 p-4 rounded-lg shadow">
            <h2 className="font-bold">{project.name}</h2>
            <p className="text-gray-500">{project.description}</p>
            {project.boards.map((board) => (
              <div
                key={board.id}
                className="bg-indigo-500 cursor-pointer hover:bg-fuchsia-500 p-2 mt-2 rounded"
                onClick={() => navigate(`/boards/${board.id}`)}
              >
                <h3 className="text-white">{board.name}</h3>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;
