import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Space, TimeEntry } from '../../types';
import { useLocalization } from '../../context/AppProviders';

interface DesktopCalendarProps {
  space: Space;
  entries: TimeEntry[];
  onLogTime: (date: Date) => void;
  onEditEntry: (entry: TimeEntry) => void;
  onDeleteEntry: (id: string) => void;
  onViewDetails: (entry: TimeEntry) => void;
  onGoToStatistics: () => void;
  onOpenLabels: () => void;
}

const formatDuration = (hours: number): string => {
  if (isNaN(hours) || hours < 0) return '0:00';
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
};

const DesktopCalendar: React.FC<DesktopCalendarProps> = ({
  space, entries, onLogTime, onEditEntry, onDeleteEntry, onViewDetails, onGoToStatistics, onOpenLabels,
}) => {
  const { t, locale } = useLocalization();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { month, year, daysInMonth, firstDayOfMonth, monthName } = useMemo(() => {
    const d = new Date(currentDate);
    const y = d.getFullYear();
    const mo = d.getMonth();
    const dim = new Date(y, mo + 1, 0).getDate();
    const fdow = new Date(y, mo, 1).getDay();
    return {
      month: mo,
      year: y,
      daysInMonth: dim,
      firstDayOfMonth: fdow === 0 ? 6 : fdow - 1,
      monthName: d.toLocaleString(locale, { month: 'long' }),
    };
  }, [currentDate, locale]);

  const dailyTotals = useMemo(() => {
    const totals: Record<number, number> = {};
    entries
      .filter(e => {
        const d = new Date(e.date + 'T12:00:00');
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .forEach(e => {
        const day = new Date(e.date + 'T12:00:00').getDate();
        totals[day] = (totals[day] || 0) + e.duration;
      });
    return totals;
  }, [entries, month, year]);

  const selectedDayEntries = useMemo(() => {
    const y = selectedDate.getFullYear();
    const mo = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');
    return entries.filter(e => e.date === `${y}-${mo}-${d}`);
  }, [entries, selectedDate]);

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const weekDays = t('weekdays_short') as unknown as string[];

  const monthTotal = useMemo(() => Object.values(dailyTotals).reduce((a, b) => a + b, 0), [dailyTotals]);
  const daysWorked = useMemo(() => Object.values(dailyTotals).filter(h => h > 0).length, [dailyTotals]);
  const selectedDayTotal = useMemo(() => selectedDayEntries.reduce((s, e) => s + e.duration, 0), [selectedDayEntries]);

  // Max daily hours for the mini bar chart in cells
  const maxDailyHours = useMemo(() => Math.max(...Object.values(dailyTotals), 0.1), [dailyTotals]);

  return (
    <div className="h-full flex overflow-hidden">
      {/* LEFT: Calendar Panel */}
      <div className="flex flex-col w-[420px] xl:w-[480px] flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">

        {/* Month Navigation */}
        <div className="px-5 pt-5 pb-3 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={t('previous_month')}
            >
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">chevron_left</span>
            </button>
            <h2 className="font-bold text-lg text-slate-900 dark:text-white capitalize">
              {monthName.charAt(0).toUpperCase() + monthName.slice(1)} {year}
            </h2>
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={t('next_month')}
            >
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">chevron_right</span>
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {weekDays.map((day, i) => (
              <div key={i} className="text-center text-xs font-bold text-slate-400 dark:text-slate-500 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const date = new Date(year, month, dayNum);
              const isSelected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, new Date());
              const hours = dailyTotals[dayNum] || 0;
              const hasEntries = hours > 0;
              const barHeight = hasEntries ? Math.max(3, (hours / maxDailyHours) * 10) : 0;

              return (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDate(date)}
                  className="aspect-square p-0.5"
                >
                  <div className={`h-full w-full flex flex-col items-center justify-center rounded-xl transition-all relative overflow-hidden
                    ${isSelected ? `${space.color} shadow-md` : ''}
                    ${!isSelected && isToday ? 'ring-2 ring-primary ring-inset' : ''}
                    ${!isSelected ? 'hover:bg-slate-100 dark:hover:bg-slate-800' : ''}
                  `}>
                    {/* Mini fill bar at bottom */}
                    {hasEntries && !isSelected && (
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-primary/20 dark:bg-primary/30 rounded-b-xl"
                        style={{ height: `${barHeight}px` }}
                      />
                    )}
                    <span className={`text-xs font-semibold relative z-10 ${isSelected ? 'text-white' : isToday ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>
                      {dayNum}
                    </span>
                    {hasEntries && (
                      <span className={`text-[8px] font-bold relative z-10 ${isSelected ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                        {formatDuration(hours)}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Month Summary Card */}
        <div className="mx-4 mb-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex-shrink-0">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 mb-2">
            {t('month_summary') || 'Month Summary'}
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{formatDuration(monthTotal)}</p>
              <p className="text-xs text-slate-400 mt-0.5">{daysWorked} {t('days_worked') || 'days worked'}</p>
            </div>
            <div className={`size-12 rounded-xl ${space.color} flex items-center justify-center shadow-md`}>
              <span className="material-symbols-outlined text-white">{space.icon || 'timer'}</span>
            </div>
          </div>
        </div>

        {/* Go to Statistics */}
        <div className="px-4 pb-4 flex-shrink-0">
          <button
            onClick={onGoToStatistics}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium transition-all"
          >
            <span className="material-symbols-outlined text-base">bar_chart</span>
            {t('statistics')}
          </button>
        </div>
      </div>

      {/* RIGHT: Day Detail Panel */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Day Header */}
        <div className="px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
              {selectedDate.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            {selectedDayTotal > 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {formatDuration(selectedDayTotal)} total · {selectedDayEntries.length} {selectedDayEntries.length === 1 ? 'entry' : 'entries'}
              </p>
            ) : (
              <p className="text-sm text-slate-400 mt-0.5">{t('no_entries_for_day')}</p>
            )}
          </div>
          <button
            onClick={() => onLogTime(selectedDate)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm transition-all hover:brightness-110 shadow-md ${space.color}`}
          >
            <span className="material-symbols-outlined text-base">add</span>
            {t('add_new_entry')}
          </button>
        </div>

        {/* Entries List */}
        <div className="flex-1 overflow-y-auto p-4">
          {selectedDayEntries.length > 0 ? (
            <div className="space-y-2 max-w-2xl">
              {selectedDayEntries.map(entry => (
                <DesktopEntryCard
                  key={entry.id}
                  entry={entry}
                  onEdit={() => onEditEntry(entry)}
                  onDelete={() => onDeleteEntry(entry.id)}
                  onViewDetails={() => onViewDetails(entry)}
                  t={t}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className={`size-20 rounded-3xl ${space.color} opacity-15 flex items-center justify-center`}>
                <span className="material-symbols-outlined text-white text-4xl">{space.icon || 'timer'}</span>
              </div>
              <div>
                <p className="font-semibold text-slate-600 dark:text-slate-400 text-lg">{t('no_entries_for_day')}</p>
                <p className="text-sm text-slate-400 mt-1">{t('add_entry_hint') || 'Click "Add New Entry" to start tracking'}</p>
              </div>
              <button
                onClick={() => onLogTime(selectedDate)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm transition-all hover:brightness-110 shadow-md ${space.color} mt-2`}
              >
                <span className="material-symbols-outlined text-base">add</span>
                {t('add_new_entry')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface EntryCardProps {
  entry: TimeEntry;
  onEdit: () => void;
  onDelete: () => void;
  onViewDetails: () => void;
  t: (key: string, params?: any) => string;
}

const DesktopEntryCard: React.FC<EntryCardProps> = ({ entry, onEdit, onDelete, onViewDetails, t }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const primaryLabel = entry.tags?.length ? entry.tags[0] : (entry.description || t('no_description_provided'));
  const extraTags = entry.tags && entry.tags.length > 1 ? entry.tags.slice(1) : [];

  return (
    <div className={`group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-3 flex items-center gap-3 hover:shadow-sm transition-all ${menuOpen ? 'z-10' : ''}`}>
      {/* Icon */}
      <div
        className="flex items-center justify-center size-11 rounded-xl bg-slate-100 dark:bg-slate-700 flex-shrink-0 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        onClick={onViewDetails}
      >
        <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">{entry.icon || 'description'}</span>
      </div>

      {/* Label + tags + description */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onViewDetails}>
        <p className="font-semibold text-slate-900 dark:text-white truncate">{primaryLabel}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {extraTags.map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">{tag}</span>
          ))}
          {entry.description && entry.tags && entry.tags.length > 0 && (
            <p className="text-xs text-slate-400 truncate">{entry.description}</p>
          )}
        </div>
        {entry.startTime && entry.endTime && !entry.isOngoing && (
          <p className="text-xs text-slate-400 mt-0.5">{entry.startTime} — {entry.endTime}</p>
        )}
      </div>

      {/* Duration + menu */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {entry.isOngoing ? (
          <div className="text-right">
            <span className="text-xs font-bold text-primary animate-pulse flex items-center gap-1 justify-end">
              <span className="size-1.5 rounded-full bg-primary" />
              {t('ongoing')}
            </span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{entry.startTime} →</p>
          </div>
        ) : (
          <div className="text-right">
            <p className="text-xl font-black text-slate-900 dark:text-white">{formatDuration(entry.duration)}</p>
          </div>
        )}

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
          >
            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">more_vert</span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50">
              <button
                onClick={() => { onEdit(); setMenuOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-t-xl flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                {t('edit')}
              </button>
              <button
                onClick={() => { onDelete(); setMenuOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-xl flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                {t('delete')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesktopCalendar;
