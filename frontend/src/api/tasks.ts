import api from './axios';

export const getTasks = (boardId: number) =>
  api.get(`/tasks/boards/${boardId}`);

export const createTask = (
  boardId: number,
  data: {
    title: string;
    description?: string;
    statusId?: number;
    assignId?: number;
  },
) => api.post(`/tasks/boards/${boardId}`, data);

export const updateTask = (
  taskId: number,
  data: {
    title?: string;
    description?: string;
    statusId?: number;
    assignId?: number;
  },
) => api.patch(`/tasks/${taskId}`, data);

export const deleteTask = (id: number) => api.delete(`/tasks/${id}`);
