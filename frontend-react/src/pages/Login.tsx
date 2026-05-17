// File: src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axios';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await axiosInstance.post('/auth/login', { email, password });
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Sai email hoặc mật khẩu!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-[var(--bg-primary)] px-4">
            <div className="glass-card w-full max-w-md p-8 animate-fade-in text-center">
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-3xl shadow-lg">💰</div>
                <h2 className="mb-2 text-2xl font-bold text-white">Chào mừng trở lại</h2>
                <p className="mb-6 text-sm text-slate-400">Đăng nhập để quản lý chi tiêu</p>
                
                {error && <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}
                
                <form onSubmit={handleLogin} className="space-y-4 text-left">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-300">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" required placeholder="email@example.com" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-300">Mật khẩu</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" required placeholder="••••••••" />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary mt-2 w-full py-3 text-base">
                        {loading ? 'Đang kiểm tra...' : 'Đăng Nhập'}
                    </button>
                </form>
                
                <p className="mt-6 text-sm text-slate-400">
                    Chưa có tài khoản? <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">Đăng ký ngay</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;