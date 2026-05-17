import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
    activePage: string;
    setActivePage: (page: string) => void;
}

const Sidebar: React.FC<Props> = ({ activePage, setActivePage }) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navItems = [
        { id: 'overview', icon: '📊', label: 'Tổng quan' },
        { id: 'transactions', icon: '💳', label: 'Giao dịch' },
        { id: 'scan', icon: '📷', label: 'Scan hóa đơn' },
    ];

    return (
        <aside style={{
            width: 240,
            minHeight: '100vh',
            background: '#111827',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px 16px',
            flexShrink: 0,
        }}>
            {/* Logo */}
            <div style={{ marginBottom: 32 }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 12px',
                }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18,
                    }}>💰</div>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Smart Finance</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>AI-powered</div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, marginBottom: 8, padding: '0 12px', letterSpacing: '0.05em' }}>
                    MENU
                </div>
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActivePage(item.id)}
                        className={`sidebar-link ${activePage === item.id ? 'active' : ''}`}
                        style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', marginBottom: 2 }}
                    >
                        <span style={{ fontSize: 18 }}>{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* User section */}
            <div style={{
                borderTop: '1px solid rgba(255,255,255,0.06)',
                paddingTop: 16, marginTop: 16,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 8 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, color: 'white',
                    }}>
                        {(user.full_name || user.email || 'U')[0].toUpperCase()}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {user.full_name || 'User'}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {user.email}
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="sidebar-link"
                    style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', color: '#ef4444' }}
                >
                    <span>🚪</span>
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
