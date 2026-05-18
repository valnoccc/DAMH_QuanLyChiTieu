import React, { useState, useEffect } from 'react';
import { expensesApi } from '../api/expenses';
import type { CreateExpensePayload } from '../api/expenses';
import { categoriesApi } from '../api/categories';
import type { Category } from '../api/categories';

interface Props { onClose: () => void; onSuccess: () => void; }

const AddExpenseModal: React.FC<Props> = ({ onClose, onSuccess }) => {
    const [form, setForm] = useState<CreateExpensePayload>({
        storeName: '',
        amount: 0,
        categoryId: undefined,
        description: '',
        transactionDate: new Date().toISOString().split('T')[0],
        type: 'expense',
    });
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        categoriesApi.getAll().then(r => setCategories(r.data)).catch(() => {});
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await expensesApi.create({ ...form, amount: Number(form.amount) });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const set = (k: keyof CreateExpensePayload, v: any) => setForm(f => ({ ...f, [k]: v }));

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>➕ Thêm giao dịch</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 20, cursor: 'pointer' }}>✕</button>
                </div>

                {error && <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#f87171' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Loại giao dịch */}
                    <div style={{ display: 'flex', gap: 8 }}>
                        {(['expense', 'income'] as const).map(t => (
                            <button key={t} type="button" onClick={() => set('type', t)} style={{
                                flex: 1, padding: '9px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                border: form.type === t ? `1px solid ${t === 'expense' ? '#ef4444' : '#10b981'}` : '1px solid rgba(255,255,255,0.1)',
                                background: form.type === t ? (t === 'expense' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)') : 'transparent',
                                color: form.type === t ? (t === 'expense' ? '#f87171' : '#34d399') : '#64748b',
                            }}>
                                {t === 'expense' ? '💸 Chi tiêu' : '💰 Thu nhập'}
                            </button>
                        ))}
                    </div>

                    <div>
                        <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Tên cửa hàng / Giao dịch *</label>
                        <input className="input-field" required value={form.storeName} onChange={e => set('storeName', e.target.value)} placeholder="VD: Nhà hàng ABC, Tiki..." />
                    </div>

                    <div>
                        <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Số tiền (VNĐ) *</label>
                        <input className="input-field" type="number" required min={0} value={form.amount || ''} onChange={e => set('amount', e.target.value)} placeholder="0" />
                    </div>

                    <div>
                        <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Danh mục</label>
                        <select className="input-field" value={form.categoryId || ''} onChange={e => set('categoryId', e.target.value ? Number(e.target.value) : undefined)}>
                            <option value="">-- Chọn danh mục --</option>
                            {categories.filter(c => c.type === form.type || c.type === 'both').map(c => (
                                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Ngày *</label>
                        <input className="input-field" type="date" required value={form.transactionDate} onChange={e => set('transactionDate', e.target.value)} />
                    </div>

                    <div>
                        <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Ghi chú</label>
                        <textarea className="input-field" rows={2} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Ghi chú thêm..." style={{ resize: 'none' }} />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 4, width: '100%', opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Đang lưu...' : 'Lưu giao dịch'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddExpenseModal;
