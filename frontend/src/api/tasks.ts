import api from './axios';
import type { TaskPriority } from '../types';

export const getTasks = (boardId: number) =>
  api.get(`/tasks/boards/${boardId}`);

export const createTask = (
  boardId: number,
  data: {
    title: string;
    description?: string;
    statusId?: number;
    assignId?: number;
    type?: 'TASK' | 'USER_STORY' | 'EPIC';
    priority?: TaskPriority;
    dueDate?: string | null;
    linkedTaskIds?: number[];
    subtasks?: { id: string; text: string; done: boolean }[];
    parentEpicId?: number | null;
    parentStoryId?: number | null;
  },
) => api.post(`/tasks/boards/${boardId}`, data);

export const updateTask = (
  taskId: number,
  data: {
    title?: string;
    description?: string;
    statusId?: number;
    assignId?: number;
    type?: 'TASK' | 'USER_STORY' | 'EPIC';
    priority?: TaskPriority;
    dueDate?: string | null;
    linkedTaskIds?: number[];
    subtasks?: { id: string; text: string; done: boolean }[];
    parentEpicId?: number | null;
    parentStoryId?: number | null;
  },
) => api.patch(`/tasks/${taskId}`, data);

export const deleteTask = (id: number) => api.delete(`/tasks/${id}`);

export const reorderTasks = (taskIds: number[]) =>
  api.patch('/tasks/reorder', { taskIds });

export const addTaskComment = (id: number, text: string) =>
  api.post(`/tasks/${id}/comments`, { text });
