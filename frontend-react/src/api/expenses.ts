import axiosInstance from './axios';

export interface Expense {
    id: number;
    storeName: string;
    amount: number;
    categoryId: number;
    category?: { id: number; name: string; icon: string; color: string };
    description?: string;
    transactionDate: string;
    type: 'expense' | 'income';
    createdAt: string;
}

export interface CreateExpensePayload {
    storeName: string;
    amount: number;
    categoryId?: number;
    description?: string;
    transactionDate: string;
    type?: 'expense' | 'income';
    receiptImageUrl?: string;
}

export interface SummaryStats {
    totalExpense: number;
    totalIncome: number;
    transactionCount: number;
    byCategory: { name: string; icon: string; color: string; total: string }[];
    last6Months: { year: string; month: string; total: string }[];
}

export const expensesApi = {
    getAll: (params?: { month?: number; year?: number }) =>
        axiosInstance.get<Expense[]>('/expenses', { params }),

    getSummary: (month: number, year: number) =>
        axiosInstance.get<SummaryStats>('/expenses/stats/summary', { params: { month, year } }),

    create: (data: CreateExpensePayload) =>
        axiosInstance.post<Expense>('/expenses', data),

    update: (id: number, data: Partial<CreateExpensePayload>) =>
        axiosInstance.patch<Expense>(`/expenses/${id}`, data),

    delete: (id: number) =>
        axiosInstance.delete(`/expenses/${id}`),
};
