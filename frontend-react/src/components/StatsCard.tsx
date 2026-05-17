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
    const trendColor = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#64748b';

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
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>
                {value}
            </div>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{title}</div>
            {subtitle && <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{subtitle}</div>}
        </div>
    );
};

export default StatsCard;
