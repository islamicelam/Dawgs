import api from "./axios";

export const getBoards = (projectId: number) =>
  api.get(`/boards/projects/${projectId}`);

export const getBoard = (boardId: number) => api.get(`/boards/${boardId}`);

export const createBoard = (projectId: number, data: { name: string }) =>
  api.post(`/boards/projects/${projectId}`, data);

export const updateBoard = (
  boardId: number,
  data?: { name: string; description?: string },
) => api.patch(`/boards/${boardId}`, data);

export const deleteBoardId = (boardId: number) =>
  api.delete(`/boards/${boardId}`);
