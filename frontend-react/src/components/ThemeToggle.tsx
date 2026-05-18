import React, { useEffect, useState } from 'react';

const ThemeToggle: React.FC = () => {
    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem('theme') !== 'light';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.removeAttribute('data-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            root.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    return (
        <button
            onClick={() => setIsDark(!isDark)}
            title="Đổi chủ đề"
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '18px',
                transition: 'all 0.2s ease'
            }}
        >
            {isDark ? '☀️' : '🌙'}
        </button>
    );
};

export default ThemeToggle;