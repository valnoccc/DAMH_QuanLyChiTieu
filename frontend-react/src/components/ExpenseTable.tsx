import React, { useState } from 'react';
import type { Expense } from '../api/expenses';

interface Props {
    expenses: Expense[];
    onDelete: (id: number) => void;
    loading: boolean;
}

const fmt = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const ExpenseTable: React.FC<Props> = ({ expenses, onDelete, loading }) => {
    const [filter, setFilter] = useState<'all' | 'expense' | 'income'>('all');

    const filtered = expenses.filter(e => filter === 'all' || e.type === filter);

    return (
        <div className="glass-card animate-fade-in" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>
                    Danh sách giao dịch
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {(['all', 'expense', 'income'] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)} style={{
                            padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            border: filter === f ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
                            background: filter === f ? 'rgba(99,102,241,0.2)' : 'transparent',
                            color: filter === f ? '#6366f1' : '#64748b',
                            transition: 'all 0.2s',
                        }}>
                            {f === 'all' ? 'Tất cả' : f === 'expense' ? 'Chi tiêu' : 'Thu nhập'}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Đang tải...</div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#475569', fontSize: 14 }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                    Chưa có giao dịch nào
                </div>
            ) : (
                <div>
                    {filtered.map(expense => {
                        const isIncome = expense.type === 'income';
                        const color = expense.category?.color || '#6366f1';
                        
                        return (
                            <div key={expense.id} style={{
                                display: 'flex', alignItems: 'center', gap: 14,
                                padding: '12px 0',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
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
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {expense.storeName}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                                        {expense.category?.name || 'Khác'} · {new Date(expense.transactionDate).toLocaleDateString('vi-VN')}
                                    </div>
                                    {expense.description && (
                                        <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
                                            {expense.description}
                                        </div>
                                    )}
                                </div>

                                {/* Số tiền */}
                                <div style={{
                                    fontSize: 15, fontWeight: 700, flexShrink: 0,
                                    color: isIncome ? '#10b981' : '#f87171',
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
