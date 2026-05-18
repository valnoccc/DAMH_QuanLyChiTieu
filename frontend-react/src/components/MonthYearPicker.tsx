import React, { useState, useRef, useEffect } from 'react';

interface MonthYearPickerProps {
    month: number;
    year: number;
    onChange: (month: number, year: number) => void;
}

const MonthYearPicker: React.FC<MonthYearPickerProps> = ({ month, year, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Xử lý click ra ngoài vùng popover thì tự động đóng lại
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Lùi 1 tháng
    const handlePrev = () => {
        if (month === 1) {
            onChange(12, year - 1);
        } else {
            onChange(month - 1, year);
        }
    };

    // Tiến 1 tháng
    const handleNext = () => {
        if (month === 12) {
            onChange(1, year + 1);
        } else {
            onChange(month + 1, year);
        }
    };

    const handleSelectMonth = (m: number) => {
        onChange(m, year);
        setIsOpen(false); // Đóng popover sau khi chọn xong
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(month, parseInt(e.target.value));
    };

    // Render danh sách 12 tháng và mốc 10 năm gần nhất
    const months = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

    return (
        <div className="relative inline-flex items-center bg-[#1e293b] rounded-xl border border-slate-700 p-1 shadow-sm" ref={popoverRef}>
            {/* Nút lùi */}
            <button
                onClick={handlePrev}
                className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors flex items-center justify-center"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>

            {/* Nút mở Popover */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="px-4 py-2 text-sm font-semibold text-white hover:text-indigo-400 transition-colors min-w-[130px] text-center"
            >
                Tháng {month}, {year}
            </button>

            {/* Nút tiến */}
            <button
                onClick={handleNext}
                className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors flex items-center justify-center"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </button>

            {/* Khung Popover chọn nhanh */}
            {isOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl z-50 p-4">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-700/50">
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Chọn nhanh</span>
                        <select
                            value={year}
                            onChange={handleYearChange}
                            className="bg-slate-800 text-white border border-slate-600 rounded-md px-2 py-1 outline-none text-sm font-medium focus:border-indigo-500 cursor-pointer"
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {months.map((mStr, idx) => {
                            const mNum = idx + 1;
                            const isSelected = mNum === month;
                            return (
                                <button
                                    key={mNum}
                                    onClick={() => handleSelectMonth(mNum)}
                                    className={`py-2 rounded-lg text-sm transition-all duration-200 ${isSelected
                                            ? 'bg-indigo-500 text-white font-bold shadow-[0_0_10px_rgba(99,102,241,0.4)]'
                                            : 'text-slate-300 hover:bg-slate-700/80 hover:text-white'
                                        }`}
                                >
                                    {mStr}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MonthYearPicker;