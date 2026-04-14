import api from './axios';

export const improveText = (text: string): Promise<string> =>
  api.post('/ai/improve-text', { text }).then((res) => res.data);
