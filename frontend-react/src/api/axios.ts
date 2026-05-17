// File: src/api/axios.ts
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000',
    headers: { 'Content-Type': 'application/json' },
});

// Tự động gắn JWT token vào mọi request
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Tự động logout khi token hết hạn (401)
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;