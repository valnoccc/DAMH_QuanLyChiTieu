import axiosInstance from './axios';

export interface Category {
    id: number;
    name: string;
    icon: string;
    color: string;
    type: 'expense' | 'income' | 'both';
}

export const categoriesApi = {
    getAll: (type?: 'expense' | 'income') =>
        axiosInstance.get<Category[]>('/categories', { params: type ? { type } : undefined }),
};
