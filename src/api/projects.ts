import api from "./axios";

export const getProjects = () => api.get(`/projects`);

export const getProject = (projectId: number) =>
  api.get(`/projects/${projectId}`);

export const createProject = (data: { name: string; description?: string }) =>
  api.post(`/projects`, data);

export const updateProject = (
  projectId: number,
  data?: { name: string; description?: string },
) => api.patch(`/projects/${projectId}`, data);

export const deleteProject = (projectId: number) =>
    api.delete(`/projects/${projectId}`);