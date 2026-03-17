import api from './axios';

export const getUsers = () => api.get('/users');

export const updateUser = (
  id: number,
  data: {
    name?: string;
    email?: string;
    password?: string;
    currentPassword?: string;
  },
) => api.patch(`/users/${id}`, data);
