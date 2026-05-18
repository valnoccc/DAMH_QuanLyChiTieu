import React from 'react';

interface Props {
    title: string;
    value: string;
    subtitle?: string;
    icon: string;
    color: string;
    trend?: 'up' | 'down' | 'neutral';
}

const StatsCard: React.FC<Props> = ({ title, value, subtitle, icon, color, trend }) => {
    const trendColor = trend === 'up' ? 'var(--success)' : trend === 'down' ? 'var(--danger)' : 'var(--text-muted)';

    return (
        <div className="glass-card animate-fade-in" style={{ padding: 20, flex: 1, minWidth: 180 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: `${color}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                }}>
                    {icon}
                </div>
                {trend && (
                    <span style={{ fontSize: 11, color: trendColor, fontWeight: 600 }}>
                        {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'}
                    </span>
                )}
            </div>
            {/* Đổi mã màu cứng thành var(--text-primary) */}
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4, transition: 'color 0.3s ease' }}>
                {value}
            </div>
            {/* Đổi mã màu cứng thành var(--text-muted) */}
            <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, transition: 'color 0.3s ease' }}>{title}</div>
            {subtitle && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, transition: 'color 0.3s ease' }}>{subtitle}</div>}
        </div>
    );
};

export default StatsCard;