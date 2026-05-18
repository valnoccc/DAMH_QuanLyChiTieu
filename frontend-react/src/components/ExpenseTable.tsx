import React, { useState } from 'react';
import type { Expense } from '../api/expenses';

interface Props {
    expenses: Expense[];
    onDelete: (id: number) => void;
    loading: boolean;
}

const fmt = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

// Hàm format ngày tháng an toàn, chống lỗi Invalid Date
const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('vi-VN');
};

const ExpenseTable: React.FC<Props> = ({ expenses, onDelete, loading }) => {
    const [filter, setFilter] = useState<'all' | 'expense' | 'income'>('all');

    const filtered = expenses.filter(e => filter === 'all' || e.type === filter);

    return (
        <div className="glass-card animate-fade-in" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Danh sách giao dịch
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {(['all', 'expense', 'income'] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)} style={{
                            padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            border: filter === f ? '1px solid var(--accent)' : '1px solid var(--border)',
                            background: filter === f ? 'rgba(99,102,241,0.15)' : 'transparent',
                            color: filter === f ? 'var(--accent)' : 'var(--text-muted)',
                            transition: 'all 0.2s',
                        }}>
                            {f === 'all' ? 'Tất cả' : f === 'expense' ? 'Chi tiêu' : 'Thu nhập'}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Đang tải...</div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 14 }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                    Chưa có giao dịch nào
                </div>
            ) : (
                <div>
                    {filtered.map(expense => {
                        const isIncome = expense.type === 'income';
                        const color = expense.category?.color || '#6366f1';

                        // Xử lý lấy tên biến linh hoạt đề phòng Backend đổi tên từ storeName sang title
                        const displayName = (expense as any).title || expense.storeName || 'Không có tên';
                        const displayDate = (expense as any).date || expense.transactionDate;

                        return (
                            <div key={expense.id} style={{
                                display: 'flex', alignItems: 'center', gap: 14,
                                padding: '12px 0',
                                borderBottom: '1px solid var(--border)', // Đổi màu viền bottom
                                transition: 'background 0.15s',
                            }}>
                                {/* Icon danh mục */}
                                <div style={{
                                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                                    background: `${color}22`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                                }}>
                                    {expense.category?.icon || '💰'}
                                </div>

                                {/* Thông tin */}
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {displayName}
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                        {expense.category?.name || 'Khác'} · {formatDate(displayDate)}
                                    </div>
                                    {expense.description && (
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                            {expense.description}
                                        </div>
                                    )}
                                </div>

                                {/* Số tiền */}
                                <div style={{
                                    fontSize: 15, fontWeight: 700, flexShrink: 0,
                                    color: isIncome ? 'var(--success)' : 'var(--danger)',
                                }}>
                                    {isIncome ? '+' : '-'}{fmt(expense.amount)}
                                </div>

                                {/* Nút xóa */}
                                <button
                                    className="btn-danger"
                                    onClick={() => onDelete(expense.id)}
                                    style={{ flexShrink: 0 }}
                                >
                                    🗑️
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ExpenseTable;