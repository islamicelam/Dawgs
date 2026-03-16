import api from "./axios";

export const getBoards = (projectId: number) =>
  api.get(`/boards/projects/${projectId}`);

export const getBoard = (boardId: number) => api.get(`/boards/${boardId}`);

export const createBoard = (projectId: number, data: { name: string }) =>
  api.post(`/boards/projects/${projectId}`, data);

export const updateBoard = (id: number, data: { name: string }) =>
  api.patch(`/boards/${id}`, data);

export const deleteBoard = (id: number) => api.delete(`/boards/${id}`);
