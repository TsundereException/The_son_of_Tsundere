import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Створюємо інстанс axios з базовим URL нашого бекенду
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const formatApiError = (error, fallback = 'Сталася помилка') => {
  const data = error?.response?.data;
  if (!data) return error?.message || fallback;
  if (typeof data === 'string') return data;
  if (data.detail) return data.detail;

  const collect = (value) => {
    if (Array.isArray(value)) return value.flatMap(collect);
    if (value && typeof value === 'object') {
      return Object.entries(value).flatMap(([key, nested]) =>
        collect(nested).map((message) => `${key}: ${message}`)
      );
    }
    return [String(value)];
  };

  return collect(data).filter(Boolean).join(' ') || fallback;
};

// Перехоплювач запитів: додає JWT токен, якщо він є у localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Перехоплювач відповідей: автоматично оновлює токен при 401 помилці
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Якщо помилка 401 (Unauthorized) і ми ще не пробували оновити токен
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          // Робимо запит на оновлення токена
          const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          // Зберігаємо новий access токен
          localStorage.setItem('access_token', data.access);
          
          // Оновлюємо заголовок в оригінальному запиті і повторюємо його
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Якщо refresh токен теж недійсний - очищаємо сторедж і редіректимо на логін
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/auth'; // Примусовий редірект
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
