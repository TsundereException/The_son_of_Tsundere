import axios from 'axios';

// Створюємо інстанс axios з базовим URL нашого бекенду
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

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
          const { data } = await axios.post('http://localhost:8000/api/v1/auth/token/refresh/', {
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
