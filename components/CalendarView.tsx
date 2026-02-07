import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Space, TimeEntry } from '../types';
import { useLocalization } from '../context/AppProviders';

interface CalendarViewProps {
    space: Space;
    entries: TimeEntry[];
    onGoBack: () => void;
    onLogTime: (date: Date) => void;
    onEditEntry: (entry: TimeEntry) => void;
    onDeleteEntry: (entryId: string) => void;
    onViewDetails: (entry: TimeEntry) => void;
    onGoToStatistics: () => void;
}

const formatDurationFromHours = (hours: number): string => {
    if (isNaN(hours) || hours < 0) {
        return "0:00";
    }
    const totalMinutes = Math.round(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}:${String(m).padStart(2, '0')}`;
};

const CalendarView: React.FC<CalendarViewProps> = ({ space, entries, onGoBack, onLogTime, onEditEntry, onDeleteEntry, onViewDetails, onGoToStatistics }) => {
    const { t, locale } = useLocalization();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const { month, year, daysInMonth, firstDayOfMonth, monthName } = useMemo(() => {
        const date = new Date(currentDate);
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfWeek = new Date(year, month, 1).getDay(); // Sunday is 0, Monday is 1, etc.
        const firstDayOfMonth = (firstDayOfWeek === 0) ? 6 : firstDayOfWeek - 1; // Adjust so Monday is 0, Sunday is 6
        const monthName = date.toLocaleString(locale, { month: 'long' });
        return { month, year, daysInMonth, firstDayOfMonth, monthName };
    }, [currentDate, locale]);

    const dailyTotals = useMemo(() => {
        const totals: { [key: string]: number } = {};
        entries
            .filter(entry => {
                const entryDate = new Date(entry.date + 'T12:00:00');
                return entryDate.getFullYear() === year && entryDate.getMonth() === month;
            })
            .forEach(entry => {
                const day = new Date(entry.date + 'T12:00:00').getDate();
                totals[day] = (totals[day] || 0) + entry.duration;
            });
        return totals;
    }, [entries, month, year]);

    const selectedDayEntries = useMemo(() => {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const selectedDateString = `${year}-${month}-${day}`;
        return entries.filter(entry => entry.date === selectedDateString);
    }, [entries, selectedDate]);

    const isSameDay = (d1: Date, d2: Date) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

    const weekDays = t('weekdays_short') as unknown as string[];

    return (
        <div className="flex flex-col flex-1 h-full">
            <header className="flex items-center p-2 justify-between sticky top-0 z-10 glass-pane flex-shrink-0 bg-white/80 dark:bg-transparent backdrop-blur-sm">
                <button onClick={onGoBack} className="flex items-center justify-center rounded-full h-12 w-12 text-slate-900 dark:text-slate-200 glass-interactive">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex-shrink-0 size-8 rounded-lg ${space.color} flex items-center justify-center shadow-md`}>
                        {space.icon && <span className="material-symbols-outlined text-white text-base">{space.icon}</span>}
                    </div>
                    <h1 className="text-lg font-bold text-black dark:text-slate-100 truncate">{space.name}</h1>
                </div>
                <button onClick={onGoToStatistics} className="flex items-center justify-center rounded-full h-12 w-12 text-slate-900 dark:text-slate-200 glass-interactive">
                    <span className="material-symbols-outlined">bar_chart</span>
                </button>
            </header>
            <main className="flex-1 px-4 pt-4 overflow-y-auto scrollable-content">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 rounded-full glass-interactive text-slate-900 dark:text-slate-200" aria-label={t('previous_month')}><span className="material-symbols-outlined">chevron_left</span></button>
                    <h2 className="font-bold text-lg text-black dark:text-white">{monthName.charAt(0).toUpperCase() + monthName.slice(1)} {year}</h2>
                    <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 rounded-full glass-interactive text-slate-900 dark:text-slate-200" aria-label={t('next_month')}><span className="material-symbols-outlined">chevron_right</span></button>
                </div>
                <div className="grid grid-cols-7 text-center">
                    {weekDays.map((day, i) => <div key={`${day}-${i}`} className="text-slate-600 dark:text-slate-400 text-xs font-bold p-2">{day}</div>)}
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`}></div>)}
                    {Array.from({ length: daysInMonth }).map((_, day) => {
                        const dayNumber = day + 1;
                        const date = new Date(year, month, dayNumber);
                        const isSelected = isSameDay(date, selectedDate);
                        const isToday = isSameDay(date, new Date());

                        return (
                            <button key={dayNumber} onClick={() => setSelectedDate(date)} className="h-12 w-full text-sm font-medium text-black dark:text-slate-200">
                                <div className={`flex size-full flex-col items-center justify-center rounded-full transition-all border ${isSelected ? `${space.color} text-white border-transparent shadow-lg` : 'border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'} ${!isSelected && isToday ? 'ring-2 ring-primary' : ''}`}>
                                    <span>{dayNumber}</span>
                                    {dailyTotals[dayNumber] && (
                                        <span className={`text-xs ${isSelected ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>{formatDurationFromHours(dailyTotals[dayNumber])}</span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </main>
            <div className="flex flex-col glass-pane rounded-t-xl mt-4 flex-shrink-0">
                <h3 className="text-lg font-bold px-4 pb-2 pt-4 text-black dark:text-white">
                    {selectedDate.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                <div className="min-h-[150px] max-h-[220px] overflow-y-auto scrollable-content">
                    {selectedDayEntries.length > 0 ? (
                        selectedDayEntries.map(entry => (
                            <TimeEntryItem
                                key={entry.id}
                                entry={entry}
                                onEdit={() => onEditEntry(entry)}
                                onDelete={() => onDeleteEntry(entry.id)}
                                onViewDetails={() => onViewDetails(entry)}
                            />
                        ))
                    ) : (
                        <div className="flex items-center justify-center h-full min-h-[100px] text-slate-500 dark:text-slate-400">{t('no_entries_for_day')}</div>
                    )}
                </div>
                <div className="px-4 pt-4 pb-6 border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => onLogTime(selectedDate)}
                        className={`flex w-full cursor-pointer items-center justify-center rounded-lg h-12 text-white gap-2 text-base font-bold transition-all hover:brightness-110 shadow-lg ${space.color}`}>
                        <span className="material-symbols-outlined">add</span>
                        <span>{t('add_new_entry')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};


// FIX: Correctly type TimeEntryItem as a React.FC to resolve issues with the 'key' prop.
interface TimeEntryItemProps {
    entry: TimeEntry;
    onEdit: () => void;
    onDelete: () => void;
    onViewDetails: () => void;
}

const TimeEntryItem: React.FC<TimeEntryItemProps> = ({ entry, onEdit, onDelete, onViewDetails }) => {
    const { t } = useLocalization();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={`relative flex items-center gap-4 px-4 min-h-[72px] py-2 justify-between hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg ${menuOpen ? 'z-50' : ''}`}>
            <div onClick={onViewDetails} className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer">
                <div className="flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 size-12">
                    <span className="material-symbols-outlined text-slate-800 dark:text-slate-300">{entry.icon || 'description'}</span>
                </div>
                <div className="flex flex-col justify-center flex-1 min-w-0">
                    <p className="text-base font-medium truncate text-black dark:text-white">
                        {(entry.tags && entry.tags.length > 0) ? entry.tags[0] : (entry.description || t('no_description_provided'))}
                    </p>
                </div>
            </div>
            <div className="shrink-0 flex items-center">
                <div className="text-right">
                    {entry.isOngoing ? (
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider animate-pulse flex items-center gap-1">
                                <span className="size-1.5 rounded-full bg-primary"></span>
                                {t('ongoing')}
                            </span>
                            <p className="text-base font-bold text-black dark:text-white leading-tight">{entry.startTime} - ...</p>
                        </div>
                    ) : (
                        <p className="text-base font-normal text-black dark:text-white">{formatDurationFromHours(entry.duration)}</p>
                    )}
                </div>
                <div className="relative" ref={menuRef}>
                    <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-full glass-interactive" aria-label={t('options')}>
                        <span className="material-symbols-outlined text-slate-700 dark:text-slate-300 text-lg">more_vert</span>
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-40 glass-pane rounded-lg shadow-xl z-50">
                            <button onClick={() => { onEdit(); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-black dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-t-lg">{t('edit')}</button>
                            <button onClick={() => { onDelete(); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-b-lg">{t('delete')}</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


export default CalendarView;