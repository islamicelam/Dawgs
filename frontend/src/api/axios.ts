import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !error.config.url?.includes('/login') &&
      !error.config.url?.includes('/refresh') &&
      !originalRequest?._retry
    ) {
      originalRequest._retry = true;
      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/refresh`,
          {},
          { withCredentials: true },
        );
        return api(originalRequest);
      } catch {
        localStorage.removeItem('me');
        window.location.href = '/login';
      }
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
