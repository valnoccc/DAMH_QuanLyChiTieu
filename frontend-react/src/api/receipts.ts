import axios from 'axios';

const axiosInstance = axios.create({ baseURL: 'http://localhost:3000' });

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export interface ScanResult {
    label: string;
    confidence: number;
    box: number[];
    text: string;
}

export const receiptsApi = {
    scan: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return axiosInstance.post<{ status: string; data: ScanResult[] }>(
            '/receipts/scan',
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
    },
};
