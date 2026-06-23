import api from './axios';

export const getLabels = (projectId: number) =>
  api.get(`/projects/${projectId}/labels`);

export const createLabel = (
  projectId: number,
  data: { name: string; color: string },
) => api.post(`/projects/${projectId}/labels`, data);

export const updateLabel = (
  id: number,
  data: { name?: string; color?: string },
) => api.patch(`/labels/${id}`, data);

export const deleteLabel = (id: number) => api.delete(`/labels/${id}`);
