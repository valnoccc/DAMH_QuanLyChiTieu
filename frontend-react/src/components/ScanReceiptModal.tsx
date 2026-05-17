import React, { useState, useRef } from 'react';
import { receiptsApi } from '../api/receipts';
import type { ScanResult } from '../api/receipts';
import { expensesApi } from '../api/expenses';

interface Props { onClose: () => void; onSuccess: () => void; }

const fmtLabel = (label: string) => {
    const map: Record<string, string> = {
        store_name: '🏪 Tên cửa hàng',
        date: '📅 Ngày',
        total: '💰 Tổng tiền',
    };
    return map[label] || label;
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
            setResults(res.data.data || []);
            setScanned(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'AI Engine chưa khởi động hoặc có lỗi xảy ra');
        } finally {
            setScanning(false);
        }
    };

    const handleSaveAsExpense = async () => {
        const totalResult = results.find(r => r.label === 'total');
        const titleResult = results.find(r => r.label === 'store_name');
        const dateResult = results.find(r => r.label === 'date');

        const amount = parseFloat((totalResult?.text || '0').replace(/[^0-9.]/g, '')) || 0;
        const title = titleResult?.text || 'Hóa đơn scan';
        const date = dateResult?.text || new Date().toISOString().split('T')[0];

        setSaving(true);
        try {
            await expensesApi.create({
                storeName: title,
                amount,
                transactionDate: date,
                description: `AI scan từ hóa đơn. Ngày gốc: ${date}`,
                type: 'expense',
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError('Lỗi khi lưu giao dịch');
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

                {/* Kết quả AI */}
                {scanned && results.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 10 }}>
                            ✅ Kết quả nhận diện ({results.length} trường):
                        </div>
                        {results.map((r, i) => (
                            <div key={i} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '10px 14px', marginBottom: 6,
                                background: 'rgba(99,102,241,0.08)', borderRadius: 10,
                                border: '1px solid rgba(99,102,241,0.15)',
                            }}>
                                <div>
                                    <span style={{ fontSize: 12, color: '#8b5cf6', fontWeight: 600 }}>{fmtLabel(r.label)}</span>
                                    <span style={{ fontSize: 11, color: '#475569', marginLeft: 8 }}>({(r.confidence * 100).toFixed(0)}%)</span>
                                </div>
                                <span style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{r.text || '—'}</span>
                            </div>
                        ))}
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
