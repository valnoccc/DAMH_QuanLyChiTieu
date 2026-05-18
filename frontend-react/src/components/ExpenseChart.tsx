import React, { useMemo } from 'react';

interface CategoryData { name: string; icon: string; color: string; total: string; }
interface MonthData { year: string; month: string; total: string; }

interface Props {
    byCategory: CategoryData[];
    last6Months: MonthData[];
}

const MONTH_NAMES = ['', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

const ExpenseChart: React.FC<Props> = ({ byCategory, last6Months }) => {
    // Pie chart
    const total = useMemo(() => byCategory.reduce((s, c) => s + parseFloat(c.total || '0'), 0), [byCategory]);
    const slices = useMemo(() => {
        let angle = -90;
        return byCategory.map(c => {
            const pct = total > 0 ? (parseFloat(c.total) / total) : 0;
            const start = angle;
            angle += pct * 360;
            return { ...c, pct, start, end: angle };
        });
    }, [byCategory, total]);

    const polarToCartesian = (cx: number, cy: number, r: number, deg: number) => {
        const rad = (deg * Math.PI) / 180;
        return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    };

    const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
        if (endAngle - startAngle >= 360) endAngle = startAngle + 359.99;
        const s = polarToCartesian(cx, cy, r, startAngle);
        const e = polarToCartesian(cx, cy, r, endAngle);
        const large = endAngle - startAngle > 180 ? 1 : 0;
        return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
    };

    // Bar chart
    const maxBar = useMemo(() => Math.max(...last6Months.map(m => parseFloat(m.total || '0')), 1), [last6Months]);

    const fmt = (n: number) => n >= 1_000_000
        ? `${(n / 1_000_000).toFixed(1)}M`
        : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : `${n}`;

    return (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {/* Pie chart */}
            <div className="glass-card animate-fade-in" style={{ flex: 1, minWidth: 280, padding: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>
                    Chi tiêu theo danh mục
                </div>
                {byCategory.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#475569', padding: 40, fontSize: 14 }}>
                        Chưa có dữ liệu tháng này
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                        <svg width={120} height={120} viewBox="0 0 120 120">
                            {slices.map((s, i) => (
                                <path
                                    key={i}
                                    d={describeArc(60, 60, 50, s.start, s.end)}
                                    stroke={s.color || '#6366f1'}
                                    strokeWidth={18}
                                    fill="none"
                                    strokeLinecap="round"
                                    opacity={0.9}
                                />
                            ))}
                            <circle cx={60} cy={60} r={34} fill="#111827" />
                            <text x={60} y={56} textAnchor="middle" fill="#f1f5f9" fontSize={11} fontWeight={700}>
                                {byCategory.length}
                            </text>
                            <text x={60} y={70} textAnchor="middle" fill="#64748b" fontSize={9}>
                                danh mục
                            </text>
                        </svg>
                        <div style={{ flex: 1 }}>
                            {slices.map((s, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color || '#6366f1', flexShrink: 0 }} />
                                    <span style={{ fontSize: 12, color: '#94a3b8', flex: 1 }}>{s.icon} {s.name}</span>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9' }}>
                                        {(s.pct * 100).toFixed(0)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bar chart */}
            <div className="glass-card animate-fade-in" style={{ flex: 1, minWidth: 280, padding: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>
                    Chi tiêu 6 tháng gần nhất
                </div>
                {last6Months.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#475569', padding: 40, fontSize: 14 }}>
                        Chưa có dữ liệu
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 130 }}>
                        {last6Months.map((m, i) => {
                            const val = parseFloat(m.total || '0');
                            const h = (val / maxBar) * 100;
                            return (
                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                    <span style={{ fontSize: 10, color: '#64748b' }}>{fmt(val)}</span>
                                    <div style={{ width: '100%', position: 'relative', height: 80, display: 'flex', alignItems: 'flex-end' }}>
                                        <div style={{
                                            width: '100%', height: `${h}%`, minHeight: 4,
                                            borderRadius: '6px 6px 0 0',
                                            background: 'linear-gradient(180deg, #6366f1, #8b5cf6)',
                                            transition: 'height 0.6s ease',
                                        }} />
                                    </div>
                                    <span style={{ fontSize: 10, color: '#64748b' }}>{MONTH_NAMES[parseInt(m.month)]}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpenseChart;
