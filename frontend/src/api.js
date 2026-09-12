import axios from 'axios';

export const TOKEN_KEY = 'token';

// Relative baseURL: Vite proxies /api to the backend in dev, and the same path
// keeps working if the SPA is later served from the API's origin.
const api = axios.create({ baseURL: '/api' });

// One place attaches the token, so no component handles it directly.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
