import api from './axios';
import type { SearchResult } from '../types';

export const searchTasks = (q: string) =>
  api.get<SearchResult[]>('/search', { params: { q } });
