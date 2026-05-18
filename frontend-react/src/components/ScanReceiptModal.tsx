import React, { useState, useRef, useEffect } from 'react';
import { receiptsApi } from '../api/receipts';
import type { ScanResult } from '../api/receipts';
import { expensesApi } from '../api/expenses';
import { categoriesApi, type Category } from '../api/categories';

interface Props { onClose: () => void; onSuccess: (savedDate?: string) => void; }

// Chuyển đổi từ dd/mm/yyyy → yyyy-mm-dd cho MySQL
const parseDate = (dateStr: string): string => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    // Nếu đã là yyyy-mm-dd thì giữ nguyên
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    // Chuyển từ dd/mm/yyyy
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return new Date().toISOString().split('T')[0];
};

const ScanReceiptModal: React.FC<Props> = ({ onClose, onSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');
    const [results, setResults] = useState<ScanResult[]>([]);
    const [scanning, setScanning] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [scanned, setScanned] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    // States cho danh mục
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryId, setCategoryId] = useState<number | ''>('');

    // Form states
    const [formTitle, setFormTitle] = useState('');
    const [formAmount, setFormAmount] = useState<number | string>('');
    const [formDate, setFormDate] = useState('');

    // Fetch Categories ngay khi mở modal
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await categoriesApi.getAll();
                const expenseCats = res.data.filter((c: Category) => c.type === 'expense' || c.type === 'both');
                setCategories(expenseCats);

                if (expenseCats.length > 0) {
                    setCategoryId(expenseCats[0].id);
                }
            } catch (err) {
                console.error("Lỗi lấy danh mục:", err);
            }
        };
        fetchCategories();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);
        setPreview(URL.createObjectURL(f));
        setResults([]);
        setScanned(false);
        setError('');
    };

    const handleScan = async () => {
        if (!file) return;
        setScanning(true);
        setError('');
        try {
            const res = await receiptsApi.scan(file);
            const scanData: ScanResult[] = res.data.data || [];
            setResults(scanData);

            // Tìm và pre-fill form
            const totalResult = scanData.find(r => r.label === 'Total_Amount');
            const titleResult = scanData.find(r => r.label === 'Store_Name');
            const dateResult = scanData.find(r => r.label === 'Date');

            setFormTitle(titleResult?.text || 'Hóa đơn scan');
            let rawText = totalResult?.text || '';
            rawText = rawText.replace(/[,.]00$/, ''); // 1. Chặt bỏ đuôi .00 hoặc ,00 (nếu có)
            rawText = rawText.replace(/[^0-9]/g, ''); // 2. Xóa hết các dấu phẩy, chấm hàng nghìn còn lại

            setFormAmount(Number(rawText) || '');
            setFormDate(parseDate(dateResult?.text || ''));
            setScanned(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'AI Engine chưa khởi động hoặc có lỗi xảy ra');
        } finally {
            setScanning(false);
        }
    };

    const handleSaveAsExpense = async () => {
        if (!categoryId) {
            setError('Vui lòng chọn danh mục!');
            return;
        }

        setSaving(true);
        try {
            await expensesApi.create({
                title: formTitle,
                amount: Number(formAmount) || 0,
                date: formDate,
                categoryId: Number(categoryId),
                description: `AI scan từ hóa đơn.`,
                type: 'expense',
            });
            onSuccess(formDate);
            onClose();
        } catch (err: any) {
            const backendError = err.response?.data?.message;
            const errorMessage = Array.isArray(backendError) ? backendError[0] : backendError;

            setError(errorMessage || 'Lỗi hệ thống khi lưu giao dịch');
            console.error("Chi tiết lỗi Backend:", err.response?.data);
        } finally {
            setSaving(false);
        }
    };


    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>📷 Scan hóa đơn AI</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 20, cursor: 'pointer' }}>✕</button>
                </div>

                {error && (
                    <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#f87171' }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Upload area */}
                <div
                    onClick={() => fileRef.current?.click()}
                    style={{
                        border: `2px dashed ${file ? '#6366f1' : 'rgba(255,255,255,0.12)'}`,
                        borderRadius: 14, padding: file ? 0 : 40,
                        textAlign: 'center', cursor: 'pointer', marginBottom: 16,
                        overflow: 'hidden', transition: 'border-color 0.2s',
                        background: 'rgba(255,255,255,0.02)',
                    }}
                >
                    {preview ? (
                        <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: 220, objectFit: 'contain', borderRadius: 12 }} />
                    ) : (
                        <>
                            <div style={{ fontSize: 48, marginBottom: 12 }}>🧾</div>
                            <div style={{ fontSize: 14, color: '#94a3b8' }}>Nhấn để chọn ảnh hóa đơn</div>
                            <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>JPG, PNG, WEBP · Tối đa 10MB</div>
                        </>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                </div>

                {/* Form chỉnh sửa kết quả AI */}
                {scanned && results.length > 0 && (
                    <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>
                            ✏️ Vui lòng kiểm tra và chỉnh sửa nếu AI nhận diện sai:
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: 12, color: '#8b5cf6', fontWeight: 600, marginBottom: 6 }}>🏪 Tên cửa hàng</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formTitle}
                                onChange={e => setFormTitle(e.target.value)}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: 12, color: '#8b5cf6', fontWeight: 600, marginBottom: 6 }}>💰 Tổng tiền (VNĐ)</label>
                            <input
                                type="number"
                                className="input-field"
                                value={formAmount}
                                onChange={e => {
                                    let val = e.target.value;
                                    // Xóa tất cả các số 0 thừa ở đầu nếu phía sau nó là một chữ số
                                    // (Ví dụ: "01" -> "1", "005" -> "5", nhưng gõ "0." thì vẫn giữ nguyên để bấm số thập phân)
                                    val = val.replace(/^0+(?=\d)/, '');
                                    setFormAmount(val);
                                }}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: 12, color: '#8b5cf6', fontWeight: 600, marginBottom: 6 }}>📅 Ngày giao dịch</label>
                            <input
                                type="date"
                                className="input-field"
                                value={formDate}
                                onChange={e => setFormDate(e.target.value)}
                                style={{ width: '100%' }}
                            />
                        </div>

                        {/* Ô Chọn Danh Mục Mới */}
                        <div>
                            <label style={{ display: 'block', fontSize: 12, color: '#8b5cf6', fontWeight: 600, marginBottom: 6 }}>🏷️ Danh mục</label>
                            <select
                                className="input-field"
                                value={categoryId}
                                onChange={(e) => setCategoryId(Number(e.target.value))}
                                style={{ width: '100%', cursor: 'pointer' }}
                            >
                                <option value="" disabled>-- Chọn danh mục --</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.icon} {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {scanned && results.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 16, color: '#64748b', fontSize: 13, marginBottom: 16 }}>
                        Không nhận diện được thông tin từ hóa đơn này
                    </div>
                )}

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 10 }}>
                    {!scanned ? (
                        <button className="btn-primary" onClick={handleScan} disabled={!file || scanning} style={{ flex: 1 }}>
                            {scanning ? '🔍 Đang quét...' : '🔍 Quét hóa đơn'}
                        </button>
                    ) : results.length > 0 ? (
                        <button className="btn-primary" onClick={handleSaveAsExpense} disabled={saving} style={{ flex: 1 }}>
                            {saving ? 'Đang lưu...' : '💾 Lưu thành giao dịch'}
                        </button>
                    ) : null}
                    <button onClick={onClose} style={{
                        padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
                        background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 14, fontWeight: 500,
                    }}>
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScanReceiptModal;