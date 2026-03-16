import api from './axios';

export const getStatuses = (boardId: number) =>
  api.get(`/statuses/boards/${boardId}`);

export const createStatus = (
  boardId: number,
  data: { name: string; category: string },
) => api.post(`/statuses/boards/${boardId}`, data);

export const deleteStatus = (id: number) => api.delete(`/statuses/${id}`);

export const updateStatus = (
  id: number,
  data: { name?: string; category?: string },
) => api.patch(`/statuses/${id}`, data);

export const updateStatusOrder = (ids: number[]) =>
  api.patch(`/statuses/order`, { ids });
