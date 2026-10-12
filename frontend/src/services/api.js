import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para injetar o Token JWT automaticamente em todas as requisições autenticadas
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fmttema_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de resposta para capturar 401 e deslogar se token expirar
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Se a rota for diferente de /auth/login e retornar 401, remove o token expirado
      if (!error.config.url?.includes('/auth/login')) {
        localStorage.removeItem('fmttema_token');
        localStorage.removeItem('fmttema_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
