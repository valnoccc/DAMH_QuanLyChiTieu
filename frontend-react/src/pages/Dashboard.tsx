// File: src/pages/Dashboard.tsx

import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/StatsCard';
import ExpenseChart from '../components/ExpenseChart';
import ExpenseTable from '../components/ExpenseTable';
import AddExpenseModal from '../components/AddExpenseModal';
import ScanReceiptModal from '../components/ScanReceiptModal';
import MonthYearPicker from '../components/MonthYearPicker'; // <-- IMPORT COMPONENT MỚI Ở ĐÂY
import { expensesApi } from '../api/expenses';
import type { Expense, SummaryStats } from '../api/expenses';
import ThemeToggle from '../components/ThemeToggle';

const fmt = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const Dashboard: React.FC = () => {
    const now = new Date();
    const [activePage, setActivePage] = useState('overview');
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [stats, setStats] = useState<SummaryStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [showScan, setShowScan] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [expRes, statRes] = await Promise.all([
                expensesApi.getAll({ month, year }),
                expensesApi.getSummary(month, year),
            ]);
            setExpenses(expRes.data);
            setStats(statRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [month, year]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleDelete = async (id: number) => {
        if (!confirm('Xóa giao dịch này?')) return;
        await expensesApi.delete(id);
        loadData();
    };

    const topCategory = stats?.byCategory?.[0];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Sidebar activePage={activePage} setActivePage={setActivePage} />

            <main style={{ flex: 1, padding: '28px 32px', overflow: 'auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>
                            {activePage === 'overview' ? '📊 Tổng quan' : activePage === 'transactions' ? '💳 Giao dịch' : '📷 Scan hóa đơn'}
                        </h1>
                        <div style={{ fontSize: 13, color: '#64748b' }}>
                            Smart Finance AI — quản lý chi tiêu thông minh
                        </div>
                    </div>

                    {/* Month/Year + Actions */}
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>

                        {/* THAY THẾ 2 THẺ <select> CŨ BẰNG COMPONENT NÀY */}
                        <MonthYearPicker
                            month={month}
                            year={year}
                            onChange={(m, y) => {
                                setMonth(m);
                                setYear(y);
                            }}
                        />
                        {/* ----------------------------------------------- */}
                        <ThemeToggle />
                        <button className="btn-primary" onClick={() => setShowScan(true)}>
                            📷 Scan hóa đơn
                        </button>
                        <button className="btn-primary" onClick={() => setShowAdd(true)}>
                            ➕ Thêm giao dịch
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                {(activePage === 'overview' || activePage === 'transactions') && (
                    <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
                        <StatsCard
                            title={`Chi tiêu tháng ${month}`}
                            value={fmt(stats?.totalExpense || 0)}
                            icon="💸" color="#ef4444" trend="down"
                        />
                        <StatsCard
                            title={`Thu nhập tháng ${month}`}
                            value={fmt(stats?.totalIncome || 0)}
                            icon="💰" color="#10b981" trend="up"
                        />
                        <StatsCard
                            title="Số giao dịch"
                            value={`${stats?.transactionCount || 0}`}
                            icon="📋" color="#6366f1"
                            subtitle={`tháng ${month}/${year}`}
                        />
                        <StatsCard
                            title="Danh mục nhiều nhất"
                            value={topCategory ? `${topCategory.icon} ${topCategory.name}` : '—'}
                            icon="🏆" color="#f59e0b"
                            subtitle={topCategory ? fmt(parseFloat(topCategory.total)) : ''}
                        />
                    </div>
                )}

                {/* Charts — chỉ hiện ở trang overview */}
                {activePage === 'overview' && stats && (
                    <div style={{ marginBottom: 24 }}>
                        <ExpenseChart
                            byCategory={stats.byCategory}
                            last6Months={stats.last6Months}
                        />
                    </div>
                )}

                {/* Transaction Table */}
                {(activePage === 'overview' || activePage === 'transactions') && (
                    <ExpenseTable
                        expenses={expenses}
                        onDelete={handleDelete}
                        loading={loading}
                    />
                )}

                {/* Scan Page */}
                {activePage === 'scan' && (
                    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
                        <div className="glass-card animate-fade-in" style={{ padding: 48, textAlign: 'center', maxWidth: 480 }}>
                            <div style={{ fontSize: 64, marginBottom: 20 }}>🧾</div>
                            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>
                                Nhận diện hóa đơn bằng AI
                            </h2>
                            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 28, lineHeight: 1.6 }}>
                                Chụp ảnh hóa đơn và để AI tự động bóc tách tên cửa hàng, ngày tháng và tổng tiền. Sau đó lưu trực tiếp vào giao dịch.
                            </p>
                            <button className="btn-primary" onClick={() => setShowScan(true)} style={{ fontSize: 15, padding: '12px 32px' }}>
                                📷 Bắt đầu scan
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {showAdd && (
                <AddExpenseModal onClose={() => setShowAdd(false)} onSuccess={loadData} />
            )}
            {showScan && (
                <ScanReceiptModal
                    onClose={() => setShowScan(false)}
                    onSuccess={(savedDate?: string) => {
                        // Tự động nhảy sang tháng/năm của hóa đơn vừa lưu
                        if (savedDate) {
                            const d = new Date(savedDate);
                            if (!isNaN(d.getTime())) {
                                setMonth(d.getMonth() + 1);
                                setYear(d.getFullYear());
                            }
                        }
                        loadData();
                    }}
                />
            )}
        </div>
    );
};

export default Dashboard;