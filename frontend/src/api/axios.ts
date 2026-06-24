import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let waitQueue: Array<{
  resolve: () => void;
  reject: (err: unknown) => void;
}> = [];

const flushQueue = (err: unknown) => {
  waitQueue.forEach((p) => (err ? p.reject(err) : p.resolve()));
  waitQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const is401 =
      error.response?.status === 401 &&
      !originalRequest?.url?.includes('/login') &&
      !originalRequest?.url?.includes('/refresh');

    if (!is401) {
      const message = error.response?.data?.message;
      const text = Array.isArray(message)
        ? message[0]
        : (message ?? 'Something went wrong');
      toast.error(text);
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Wait until the ongoing refresh finishes, then retry
      return new Promise<void>((resolve, reject) => {
        waitQueue.push({ resolve, reject });
      })
        .then(() => api(originalRequest))
        .catch(() => Promise.reject(error));
    }

    isRefreshing = true;
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/refresh`,
        {},
        { withCredentials: true },
      );
      flushQueue(null);
      return api(originalRequest);
    } catch (refreshErr) {
      flushQueue(refreshErr);
      localStorage.removeItem('me');
      window.location.href = '/login';
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
