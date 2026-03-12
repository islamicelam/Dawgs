import api from "./axios";

export const getStatuses = (boardId: number) =>
  api.get(`/statuses/boards/${boardId}`);

export const createStatus = (
  boardId: number,
  data: { name: string; category: string },
) => api.post(`/statuses/boards/${boardId}`, data);

export const deleteStatus = (statusId: number) =>
  api.delete(`/statuses/${statusId}`);
