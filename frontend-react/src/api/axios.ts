// File: src/api/axios.ts
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000', // Đảm bảo backend NestJS đang chạy ở cổng này
    headers: {
        'Content-Type': 'application/json',
    },
});

export default axiosInstance;