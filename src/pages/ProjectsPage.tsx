import { useState, useEffect } from 'react';
import { getProjects } from '../api/projects';
import type { Project } from '../types';
const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjects()
      .then((response) => {
        setProjects(response.data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Projects</h1>
      <div className="grid grid-cols-3 gap-4">
        {projects.map((project) => (
          <div key={project.id} className="bg-orange-200 p-4 rounded-lg shadow">
            <h2 className="font-bold">{project.name}</h2>
            <p className="text-gray-500">{project.description}</p>
            {project.boards.map((board) => (
                <div key={board.id} className="bg-red-50 p-2 mt-2 rounded">
                <h3 className='text-gray-400'>{board.name}</h3>
                </div>
))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;