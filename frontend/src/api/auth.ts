import api from './axios';

export const login = (email: string, password: string) =>
  api.post('/login', { email, password });

export const refresh = (refresh_token: string) =>
  api.post('/refresh', { refresh_token });

export const register = (name: string, email: string, password: string) =>
  api.post('/users', { name, email, password });

export const getMe = () => api.get('/me');
