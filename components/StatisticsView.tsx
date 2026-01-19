import React, { useMemo, useState, useEffect } from 'react';
import type { Space, TimeEntry } from '../types';
import { useLocalization } from '../context/AppProviders';
import { generateInsight, InsightResult } from '../utils/insightEngine';
import FinancialCalculatorModal from './FinancialCalculatorModal';
import StatisticsInfoPanel from './StatisticsInfoPanel';

interface StatisticsViewProps {
    space: Space;
    entries: TimeEntry[];
    onGoBack: () => void;
}

const StatisticsView: React.FC<StatisticsViewProps> = ({ space, entries, onGoBack }) => {
    const { t, locale } = useLocalization();
    const [range, setRange] = useState<'week' | 'month' | 'custom'>('week');
    const [anchorDate, setAnchorDate] = useState(new Date());
    const [customStart, setCustomStart] = useState<string>(new Date().toISOString().split('T')[0]);
    const [customEnd, setCustomEnd] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedBar, setSelectedBar] = useState<number | null>(null);

    // --- Modals State ---
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    // --- History & URL Sync for Local Modals ---
    // We handle 'modal' param: 'calculator' | 'statsInfo'
    useEffect(() => {
        // Initial URL Check
        const params = new URLSearchParams(window.location.search);
        const modal = params.get('modal');
        setIsCalculatorOpen(modal === 'calculator');
        setIsInfoOpen(modal === 'statsInfo');

        // Popstate Listener
        const handlePopState = () => {
            const p = new URLSearchParams(window.location.search);
            const m = p.get('modal');
            setIsCalculatorOpen(m === 'calculator');
            setIsInfoOpen(m === 'statsInfo');
            // If m is null or other, both false (handled above). 
            // IMPORTANT: This won't conflict with App's popstate for top-level routing 
            // because App only changes View if spaceId/view params change. 
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const updateHistory = (modalName: string | null) => {
        const url = new URL(window.location.href);
        if (modalName) {
            url.searchParams.set('modal', modalName);
            window.history.pushState({}, '', url);
        } else {
            url.searchParams.delete('modal');
            window.history.back(); // Use back to close
            // Note: back() will trigger popstate, which sets state to false.
            // But for safety/immediacy we often set state too? 
            // In a strict history-driven app, we wait for popstate or set state + push.
            // When closing with back(), we DON'T push, we just pop. 
        }
    };

    const handleOpenCalculator = () => {
        setIsCalculatorOpen(true);
        const url = new URL(window.location.href);
        url.searchParams.set('modal', 'calculator');
        window.history.pushState({}, '', url);
    };

    const handleCloseCalculator = () => {
        window.history.back();
        // State updated by popstate listener
    }

    const handleOpenInfo = () => {
        setIsInfoOpen(true);
        const url = new URL(window.location.href);
        url.searchParams.set('modal', 'statsInfo');
        window.history.pushState({}, '', url);
    };

    const handleCloseInfo = () => {
        window.history.back();
    }


    // --- Statistics Logic ---
    const stats = useMemo(() => {
        // Reset time to avoid inconsistencies
        const anchor = new Date(anchorDate);
        anchor.setHours(0, 0, 0, 0);

        let currentStart: Date;
        let currentEnd: Date;
        let previousStart: Date;
        let previousEnd: Date;
        let rangeLabel = '';

        if (range === 'week') {
            // Get Monday of the current week
            const day = anchor.getDay();
            const diff = anchor.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
            currentStart = new Date(anchor.setDate(diff));
            currentEnd = new Date(currentStart);
            currentEnd.setDate(currentStart.getDate() + 6);
            currentEnd.setHours(23, 59, 59, 999);

            // Previous Week
            previousStart = new Date(currentStart);
            previousStart.setDate(currentStart.getDate() - 7);
            previousEnd = new Date(previousStart);
            previousEnd.setDate(previousStart.getDate() + 6);
            previousEnd.setHours(23, 59, 59, 999);

            const startStr = currentStart.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
            const endStr = currentEnd.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
            rangeLabel = `${startStr} - ${endStr}`;

        } else if (range === 'month') {
            // Month Logic
            currentStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
            currentEnd = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0, 23, 59, 59, 999);

            // Previous Month
            previousStart = new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1);
            previousEnd = new Date(anchor.getFullYear(), anchor.getMonth(), 0, 23, 59, 59, 999);

            rangeLabel = currentStart.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
        } else {
            // Custom Logic
            currentStart = new Date(customStart + 'T00:00:00');
            currentEnd = new Date(customEnd + 'T23:59:59.999');

            // Calculate duration in days to find previous period
            const durationMs = currentEnd.getTime() - currentStart.getTime();

            previousEnd = new Date(currentStart.getTime() - 1); // End of previous is just before start of current
            previousStart = new Date(previousEnd.getTime() - durationMs);

            rangeLabel = t('custom_range');
        }

        // Filter Entries
        const currentEntries = entries.filter(e => {
            const d = new Date(e.date + 'T12:00:00');
            return d >= currentStart && d <= currentEnd;
        });

        const previousEntries = entries.filter(e => {
            const d = new Date(e.date + 'T12:00:00');
            return d >= previousStart && d <= previousEnd;
        });

        // Totals
        const totalHours = currentEntries.reduce((sum, e) => sum + e.duration, 0);
        const previousHours = previousEntries.reduce((sum, e) => sum + e.duration, 0);
        const diffHours = totalHours - previousHours;

        // Group by Tag (or Description) for Current Period
        const byActivity: Record<string, number> = {};
        currentEntries.forEach(entry => {
            if (entry.tags && entry.tags.length > 0) {
                entry.tags.forEach(tag => {
                    byActivity[tag] = (byActivity[tag] || 0) + entry.duration;
                });
            } else {
                const desc = entry.description || t('no_description');
                byActivity[desc] = (byActivity[desc] || 0) + entry.duration;
            }
        });

        const topActivities = Object.entries(byActivity)
            .map(([name, hours]) => ({ name, hours, percentage: totalHours > 0 ? (hours / totalHours) * 100 : 0 }))
            .sort((a, b) => b.hours - a.hours)
            .slice(0, 5);

        // Daily Data for Chart
        let dailyData: { date: string, hours: number, label: string }[] = [];

        // Calculate days between start and end
        const daysDiff = Math.ceil((currentEnd.getTime() - currentStart.getTime()) / (1000 * 3600 * 24));
        const chartDays = Math.max(1, daysDiff);

        dailyData = Array.from({ length: chartDays }, (_, i) => {
            const d = new Date(currentStart.getTime() + i * 24 * 60 * 60 * 1000);
            const dateStr = d.toISOString().split('T')[0]; // Safe ISO date
            // Handle edge case where ISO string might be yesterday if timezone offset (but here we used timestamp addition)
            // Safer to construct date parts
            const safeDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

            const hours = currentEntries
                .filter(e => e.date === safeDateStr)
                .reduce((sum, e) => sum + e.duration, 0);

            // Label Logic
            let label = '';
            if (range === 'week') {
                label = d.toLocaleDateString(locale, { weekday: 'narrow' });
            } else if (range === 'month') {
                label = (i + 1) % 5 === 1 || i === chartDays - 1 ? (i + 1).toString() : '';
            } else {
                // Custom: Show day if short range, date if long
                label = chartDays <= 14 ? d.getDate().toString() : (i % 5 === 0 ? d.getDate().toString() : '');
            }

            return { date: safeDateStr, hours, label };
        });

        const maxDailyHours = Math.max(...dailyData.map(d => d.hours), 1);

        // --- NEW INSIGHT ENGINE ---
        const insightResult = generateInsight(currentEntries, previousEntries, totalHours, previousHours, t);

        return {
            totalHours,
            diffHours,
            topActivities,
            dailyData,
            maxDailyHours,
            insight: insightResult,
            rangeLabel
        };
    }, [entries, range, anchorDate, customStart, customEnd, t, locale]);

    const handleNavigate = (direction: 'prev' | 'next') => {
        if (range === 'custom') return; // No nav for custom
        const newDate = new Date(anchorDate);
        if (range === 'week') {
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        } else {
            newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        }
        setAnchorDate(newDate);
    };

    const formatHours = (h: number) => {
        const hours = Math.floor(Math.abs(h));
        const minutes = Math.round((Math.abs(h) - hours) * 60);
        const sign = h < 0 ? '-' : '';
        return `${sign}${hours}h ${minutes}m`;
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-black/20">
            {/* Header with Range Toggle */}
            <div className="flex flex-col gap-2 p-4 flex-shrink-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <button onClick={onGoBack} className="h-10 w-10 flex items-center justify-center rounded-full glass-interactive text-slate-700 dark:text-slate-200">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="flex bg-slate-200 dark:bg-slate-800 rounded-lg p-1">
                        <button
                            onClick={() => { setRange('week'); setAnchorDate(new Date()); }}
                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${range === 'week' ? 'bg-white dark:bg-slate-600 shadow' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            {t('week')}
                        </button>
                        <button
                            onClick={() => { setRange('month'); setAnchorDate(new Date()); }}
                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${range === 'month' ? 'bg-white dark:bg-slate-600 shadow' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            {t('month')}
                        </button>
                        <button
                            onClick={() => setRange('custom')}
                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${range === 'custom' ? 'bg-white dark:bg-slate-600 shadow' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            {t('custom_range')}
                        </button>
                    </div>

                    {/* Info Button - Replaces w-10 spacer */}
                    <button
                        onClick={handleOpenInfo}
                        className="h-10 w-10 flex items-center justify-center rounded-full glass-interactive text-slate-700 dark:text-slate-200"
                    >
                        <span className="material-symbols-outlined">info</span>
                    </button>
                </div>

                {/* Period Controls OR Date Inputs */}
                {range === 'custom' ? (
                    <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-800 rounded-xl p-2 shadow-sm border border-slate-100 dark:border-slate-700 animate-fade-in w-full">
                        <input
                            type="date"
                            value={customStart}
                            onChange={(e) => setCustomStart(e.target.value)}
                            className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-700 border-none rounded-lg p-1.5 text-xs text-slate-700 dark:text-slate-200 font-bold text-center"
                        />
                        <span className="text-slate-300 dark:text-slate-600">-</span>
                        <input
                            type="date"
                            value={customEnd}
                            onChange={(e) => setCustomEnd(e.target.value)}
                            className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-700 border-none rounded-lg p-1.5 text-xs text-slate-700 dark:text-slate-200 font-bold text-center"
                        />
                    </div>
                ) : (
                    <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-2 shadow-sm border border-slate-100 dark:border-slate-700">
                        <button onClick={() => handleNavigate('prev')} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400">
                            <span className="material-symbols-outlined text-lg">chevron_left</span>
                        </button>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 capitalize">
                            {stats.rangeLabel}
                        </span>
                        <button onClick={() => handleNavigate('next')} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400">
                            <span className="material-symbols-outlined text-lg">chevron_right</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8 space-y-4">

                {/* 1. Summary Card with Context */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t('total_time')}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-4xl font-bold text-slate-900 dark:text-white">{formatHours(stats.totalHours)}</h3>
                    </div>
                    <p className={`text-xs font-medium mt-2 flex items-center gap-1 ${stats.diffHours >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                        <span className="material-symbols-outlined text-sm">{stats.diffHours >= 0 ? 'trending_up' : 'trending_down'}</span>
                        {stats.diffHours > 0 ? '+' : ''}{formatHours(stats.diffHours)} {t('vs_previous')}
                    </p>
                </div>

                {/* 2. Insight Card - CONDITIONALLY RENDERED */}
                {stats.insight && (
                    <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 flex items-start gap-3 animate-fade-in">
                        <span className="material-symbols-outlined text-indigo-500 dark:text-indigo-400 mt-0.5">{stats.insight.icon}</span>
                        <div>
                            <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-wider mb-1">{t('insight')}</h4>
                            <p className="text-sm text-slate-700 dark:text-indigo-100 leading-snug">
                                {t(stats.insight.textKey, stats.insight.textParams)}
                            </p>
                        </div>
                    </div>
                )}

                {/* 3. Interactive Chart */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-lg">bar_chart</span>
                            {t('time_distribution')}
                        </h4>
                        {selectedBar !== null && (
                            <span className="text-xs font-bold text-primary animate-fade-in">
                                {formatHours(stats.dailyData[selectedBar].hours)}
                            </span>
                        )}
                    </div>

                    <div className="h-40 flex items-end gap-1 overflow-x-auto scrollable-content pb-2">
                        {stats.dailyData.map((day, index) => (
                            <div
                                key={day.date}
                                className="flex flex-col items-center gap-1 min-w-[30px] flex-1 group cursor-pointer"
                                onClick={() => setSelectedBar(index === selectedBar ? null : index)} // Toggle selection
                                onMouseEnter={() => setSelectedBar(index)}
                                onMouseLeave={() => setSelectedBar(null)}
                            >
                                <div className={`w-full relative flex items-end justify-center rounded-t-lg transition-all duration-300 ${index === selectedBar ? 'bg-slate-200 dark:bg-slate-700' : 'bg-slate-100 dark:bg-slate-700/50'}`} style={{ height: '100px' }}>
                                    <div
                                        className={`w-full rounded-t-lg transition-all duration-500 ${index === selectedBar ? 'bg-primary' : 'bg-primary/70 group-hover:bg-primary'}`}
                                        style={{ height: `${(day.hours / stats.maxDailyHours) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="text-[10px] text-slate-400 truncate">{day.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. Top Activities with Percentages */}
                <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-500 text-lg">pie_chart</span>
                        {t('top_activities')}
                    </h4>
                    <div className="space-y-3">
                        {stats.topActivities.length > 0 ? (
                            stats.topActivities.map((activity, index) => (
                                <div key={index} className="space-y-1">
                                    <div className="flex justify-between text-sm items-end">
                                        <span className="font-medium text-slate-700 dark:text-slate-200">{activity.name}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{Math.round(activity.percentage)}%</span>
                                            <span className="text-slate-700 dark:text-slate-300 font-bold">{formatHours(activity.hours)}</span>
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                                            style={{ width: `${activity.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-500 dark:text-slate-400 italic text-center py-4">{t('no_data')}</p>
                        )}
                    </div>
                </div>

                {/* 5. Financial Calculator Button */}
                <button
                    onClick={handleOpenCalculator}
                    className="w-full py-4 mt-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 shadow-sm transition-all"
                >
                    <span className="material-symbols-outlined text-indigo-500">payments</span>
                    <span className="font-semibold">{t('financial_calculator')}</span>
                </button>

            </div>

            {/* Modals */}
            {isCalculatorOpen && (
                <FinancialCalculatorModal
                    entries={entries}
                    onClose={handleCloseCalculator}
                    initialRange={range}
                    initialCustomStart={customStart}
                    initialCustomEnd={customEnd}
                />
            )}

            <StatisticsInfoPanel
                isOpen={isInfoOpen}
                onClose={handleCloseInfo}
            />
        </div>
    );
};

export default StatisticsView;
