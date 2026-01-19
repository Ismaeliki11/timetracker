import React, { useState, useEffect, useMemo } from 'react';
import type { TimeEntry } from '../types';
import { useLocalization } from '../context/AppProviders';

interface FinancialCalculatorModalProps {
    entries: TimeEntry[];
    onClose: () => void;
    initialRange?: 'week' | 'month' | 'custom';
    initialCustomStart?: string;
    initialCustomEnd?: string;
}

type PeriodType = 'week' | 'month' | 'custom';

const FinancialCalculatorModal: React.FC<FinancialCalculatorModalProps> = ({
    entries,
    onClose,
    initialRange = 'week',
    initialCustomStart = '',
    initialCustomEnd = ''
}) => {
    const { t, locale } = useLocalization();

    // State
    const [periodType, setPeriodType] = useState<PeriodType>(initialRange);
    const [rate, setRate] = useState<string>('');
    const [selectedTag, setSelectedTag] = useState<string>('');
    const [customStart, setCustomStart] = useState<string>(initialCustomStart);
    const [customEnd, setCustomEnd] = useState<string>(initialCustomEnd);

    // --- Period Logic ---
    const getPeriodRange = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        let start = new Date(now);
        let end = new Date(now);

        if (periodType === 'week') {
            const day = start.getDay();
            const diff = start.getDate() - day + (day === 0 ? -6 : 1);
            start.setDate(diff); // Monday
            end.setDate(diff + 6); // Sunday
            end.setHours(23, 59, 59, 999);
        } else if (periodType === 'month') {
            start.setDate(1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        } else {
            // Custom
            if (customStart) start = new Date(customStart);
            if (customEnd) end = new Date(customEnd);
            end.setHours(23, 59, 59, 999);
        }

        return { start, end };
    }, [periodType, customStart, customEnd]);

    // --- Filtering ---
    const filteredEntries = useMemo(() => {
        const { start, end } = getPeriodRange;
        return entries.filter(e => {
            const d = new Date(e.date + 'T12:00:00');
            return d >= start && d <= end && (!selectedTag || (e.tags && e.tags.includes(selectedTag)));
        });
    }, [entries, getPeriodRange, selectedTag]);

    // --- Calculation ---
    const totalHours = filteredEntries.reduce((sum, e) => sum + e.duration, 0);
    const hourlyRate = parseFloat(rate) || 0;
    const earnings = totalHours * hourlyRate;

    // --- Tags for Dropdown ---
    // Only show tags that exist in the selected period
    const availableTags = useMemo(() => {
        const tags = new Set<string>();
        const { start, end } = getPeriodRange;
        // Filter entries just by date first to populate dropdown
        const dateFiltered = entries.filter(e => {
            const d = new Date(e.date + 'T12:00:00');
            return d >= start && d <= end;
        });

        dateFiltered.forEach(e => e.tags?.forEach(tag => tags.add(tag)));
        return Array.from(tags).sort();
    }, [entries, getPeriodRange]);


    // --- Projection Logic ---
    // Rule: Need >= 7 days range AND activity on >= 3 unique days
    const projectionData = useMemo(() => {
        if (!rate || hourlyRate <= 0) return null;

        const { start, end } = getPeriodRange;
        const daysInRange = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;

        // Count unique active days
        const activeDays = new Set(filteredEntries.map(e => e.date)).size;

        if (daysInRange < 7 || activeDays < 3) {
            return { locked: true };
        }

        // Standardize to daily average
        const dailyAverageHours = totalHours / daysInRange; // Simple average over the range
        const dailyAverageEarnings = dailyAverageHours * hourlyRate;

        return {
            locked: false,
            monthly: dailyAverageEarnings * 30,
            yearly: dailyAverageEarnings * 365
        };
    }, [filteredEntries, hourlyRate, getPeriodRange, totalHours, rate]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-indigo-500">calculate</span>
                        {t('financial_calculator')}
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="overflow-y-auto p-4 space-y-6">

                    {/* 1. Period Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            {t('select_period')}
                        </label>
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                            {(['week', 'month', 'custom'] as const).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPeriodType(p)}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${periodType === p ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}
                                >
                                    {p === 'week' ? t('week') : p === 'month' ? t('month') : t('custom_range')}
                                </button>
                            ))}
                        </div>

                        {periodType === 'custom' && (
                            <div className="flex gap-2 mt-2">
                                <input
                                    type="date"
                                    value={customStart}
                                    onChange={e => setCustomStart(e.target.value)}
                                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm"
                                />
                                <input
                                    type="date"
                                    value={customEnd}
                                    onChange={e => setCustomEnd(e.target.value)}
                                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm"
                                />
                            </div>
                        )}
                    </div>

                    {/* 2. Filter & Rate */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1 h-full justify-between">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                {t('select_tags')}
                            </label>
                            <select
                                value={selectedTag}
                                onChange={e => setSelectedTag(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-sm text-slate-800 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-indigo-500"
                            >
                                <option value="">{t('all_tags')}</option>
                                {availableTags.map(tag => (
                                    <option key={tag} value={tag}>{tag}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1 h-full justify-between">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                {t('hourly_rate')}
                            </label>
                            <input
                                type="number"
                                value={rate}
                                onChange={e => setRate(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-sm text-slate-800 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-indigo-500 font-mono"
                            />
                        </div>
                    </div>

                    <hr className="border-slate-100 dark:border-slate-800" />

                    {/* 3. Results */}
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 text-center">
                        <p className="text-sm font-medium text-slate-500 dark:text-indigo-300 mb-1">{t('total_earnings')}</p>
                        <h3 className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
                            {earnings.toLocaleString(locale, { style: 'currency', currency: 'EUR' })}
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-indigo-200 mt-2">
                            {totalHours.toFixed(1)}h × {hourlyRate > 0 ? hourlyRate.toLocaleString(locale, { style: 'currency', currency: 'EUR' }) : '0€'}/h
                        </p>
                    </div>

                    {/* 4. Projection Module */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-slate-700 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-purple-500">trending_up</span>
                            {t('projected_earnings')}
                        </h4>

                        {!projectionData ? (
                            <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-center text-slate-400 text-sm">
                                {t('enter_rate')}
                            </div>
                        ) : projectionData.locked ? (
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                                <span className="material-symbols-outlined text-slate-400">lock</span>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                                    {t('insufficient_data_msg')}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <p className="text-xs text-slate-400 mb-1">{t('projection_monthly')}</p>
                                    <p className="text-lg font-bold text-slate-800 dark:text-white">
                                        {projectionData.monthly.toLocaleString(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                                    </p>
                                </div>
                                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <p className="text-xs text-slate-400 mb-1">{t('projection_yearly')}</p>
                                    <p className="text-lg font-bold text-slate-800 dark:text-white">
                                        {projectionData.yearly.toLocaleString(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default FinancialCalculatorModal;
