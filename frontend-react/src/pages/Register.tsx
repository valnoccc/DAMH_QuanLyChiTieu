// File: src/pages/Register.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axios';

const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await axiosInstance.post('/auth/register', { email, password, fullName });
            alert('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi đăng ký!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-[var(--bg-primary)] px-4">
            <div className="glass-card w-full max-w-md p-8 animate-fade-in text-center">
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-3xl shadow-lg">💰</div>
                <h2 className="mb-2 text-2xl font-bold text-white">Tạo tài khoản mới</h2>
                <p className="mb-6 text-sm text-slate-400">Tham gia quản lý tài chính thông minh</p>
                
                {error && <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}
                
                <form onSubmit={handleRegister} className="space-y-4 text-left">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-300">Họ và tên</label>
                        <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="input-field" required placeholder="Nguyễn Văn A" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-300">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" required placeholder="email@example.com" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-300">Mật khẩu</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" required placeholder="••••••••" minLength={6} />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary mt-2 w-full py-3 text-base">
                        {loading ? 'Đang xử lý...' : 'Đăng Ký'}
                    </button>
                </form>
                
                <p className="mt-6 text-sm text-slate-400">
                    Đã có tài khoản? <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">Đăng nhập ngay</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;