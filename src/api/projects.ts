import api from "./axios";

export const getProjects = () => api.get(`/projects`);

export const getProject = (projectId: number) =>
  api.get(`/projects/${projectId}`);

export const createProject = (data: { name: string; description?: string }) =>
  api.post(`/projects`, data);

export const updateProject = (
  id: number,
  data: { name?: string; description?: string },
) => api.patch(`/projects/${id}`, data);

export const deleteProject = (id: number) => api.delete(`/projects/${id}`);
