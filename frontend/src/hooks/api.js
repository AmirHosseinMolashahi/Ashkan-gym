import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true, 
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (originalRequest.url.includes('/account/login/')) {
      return Promise.reject(error); // پیام خطا مستقیم میره به React
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      // ⛔ جلوگیری از حلقه‌ی بی‌پایان هنگام تلاش برای refresh
      if (originalRequest.url.includes('/account/refresh/')) {
        return Promise.reject(error); // فقط ریجکت کن، ریدایرکت نکن!
      }

      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/account/refresh/');
        isRefreshing = false;
        processQueue(null);
        return api(originalRequest);
      } catch (err) {
        isRefreshing = false;
        processQueue(err, null);
        // فقط خطا رو برگردون. واکنش درون React انجام میشه.
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;