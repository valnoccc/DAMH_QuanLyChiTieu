// File: src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const userData = localStorage.getItem('user');

        // Nếu không có token, đẩy ra ngoài trang login
        if (!token) {
            navigate('/login');
        } else if (userData) {
            setUser(JSON.parse(userData));
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <h1 className="text-xl font-bold text-blue-600">Smart Finance AI</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-700">Xin chào, {user?.full_name || user?.email}</span>
                        <button
                            onClick={handleLogout}
                            className="rounded bg-red-100 px-3 py-1 text-sm text-red-600 hover:bg-red-200"
                        >
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </nav>

            <main className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="rounded-lg bg-white p-6 shadow">
                    <h2 className="mb-4 text-2xl font-bold text-gray-800">Quản lý tài chính cá nhân</h2>
                    <p className="text-gray-600">Giao diện tải hóa đơn và biểu đồ chi tiêu sẽ được hiển thị tại đây.</p>
                    {/* Nơi bạn sẽ ghép component Upload Hóa Đơn vào sau này */}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;