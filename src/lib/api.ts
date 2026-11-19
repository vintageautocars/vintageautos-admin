import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3033/api/v1',
  withCredentials: true,
});

// Unwrap the backend's { success, data, timestamp } envelope so callers get the payload directly
api.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl: string = error.config?.url ?? '';
      // Auth probes (login, logout, /auth/me, profile, password) are handled
      // by the caller — AuthProvider or the settings page. Everything else:
      // tell AuthProvider the session died, and let it navigate via React Router.
      const isAuthProbe = /\/auth\//.test(requestUrl);
      if (!isAuthProbe) {
        window.dispatchEvent(new Event('auth:logout'));
      }
    }
    return Promise.reject(error);
  },
);

export default api;
