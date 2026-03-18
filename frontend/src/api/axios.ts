import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: 'http://localhost:3001',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config.url?.includes('/login')
    ) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else {
      const message = error.response?.data?.message;
      const text = Array.isArray(message)
        ? message[0]
        : (message ?? 'Something went wrong');
      toast.error(text);
    }
    return Promise.reject(error);
  },
);

export default api;
