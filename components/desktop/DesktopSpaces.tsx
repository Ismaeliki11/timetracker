import React, { useMemo, useState, useRef, useEffect } from 'react';
import type { Space, TimeEntry } from '../../types';
import { useLocalization } from '../../context/AppProviders';
import { useAuth } from '../../context/AuthContext';
import { getWelcomeMessageKey } from '../../utils/welcomeMessages';

interface DesktopSpacesProps {
  spaces: Space[];
  timeEntries: TimeEntry[];
  onSelectSpace: (id: string) => void;
  onCreateSpace: () => void;
  onEditSpace: (space: Space) => void;
  onDeleteSpace: (id: string, name: string) => void;
  onViewEntryDetails: (entry: TimeEntry) => void;
}

const formatDuration = (hours: number): string => {
  if (isNaN(hours) || hours < 0) return '0:00';
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
};

const DesktopSpaces: React.FC<DesktopSpacesProps> = ({
  spaces, timeEntries,
  onSelectSpace, onCreateSpace, onEditSpace, onDeleteSpace, onViewEntryDetails,
}) => {
  const { t } = useLocalization();
  const { user } = useAuth();

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
  const messageKey = useMemo(() => getWelcomeMessageKey(!user), [!!user]);
  const welcomeMessage = t(messageKey, { name: displayName });

  const todayStr = new Date().toISOString().split('T')[0];

  const totalHoursBySpace = useMemo(() => {
    const totals: Record<string, number> = {};
    spaces.forEach(s => (totals[s.id] = 0));
    timeEntries.forEach(e => {
      if (totals[e.spaceId] !== undefined) totals[e.spaceId] += e.duration;
    });
    return totals;
  }, [spaces, timeEntries]);

  const todayHoursBySpace = useMemo(() => {
    const totals: Record<string, number> = {};
    spaces.forEach(s => (totals[s.id] = 0));
    timeEntries.filter(e => e.date === todayStr).forEach(e => {
      if (totals[e.spaceId] !== undefined) totals[e.spaceId] += e.duration;
    });
    return totals;
  }, [spaces, timeEntries, todayStr]);

  const weekHoursBySpace = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(now);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    const totals: Record<string, number> = {};
    spaces.forEach(s => (totals[s.id] = 0));
    timeEntries.filter(e => new Date(e.date + 'T12:00') >= weekStart).forEach(e => {
      if (totals[e.spaceId] !== undefined) totals[e.spaceId] += e.duration;
    });
    return totals;
  }, [spaces, timeEntries]);

  const ongoingEntries = useMemo(() => timeEntries.filter(e => e.isOngoing), [timeEntries]);
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const calculateElapsed = (startTime: string, entryDate: string) => {
    try {
      const [h, m] = startTime.split(':').map(Number);
      const start = new Date(`${entryDate}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);
      if (isNaN(start.getTime()) || start > now) return '0:00';
      return formatDuration((now.getTime() - start.getTime()) / (1000 * 60 * 60));
    } catch { return '0:00'; }
  };

  const grandTotal = useMemo(() => Object.values(totalHoursBySpace).reduce((a, b) => a + b, 0), [totalHoursBySpace]);
  const todayTotal = useMemo(() => Object.values(todayHoursBySpace).reduce((a, b) => a + b, 0), [todayHoursBySpace]);
  const weekTotal = useMemo(() => Object.values(weekHoursBySpace).reduce((a, b) => a + b, 0), [weekHoursBySpace]);

  const getFontSizeClass = (text: string) => {
    if (text.length > 80) return 'text-xl';
    if (text.length > 50) return 'text-2xl';
    return 'text-3xl';
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Page Header */}
      <div className="px-8 py-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <h1 className={`font-black text-slate-900 dark:text-white tracking-tight ${getFontSizeClass(welcomeMessage)} transition-all duration-300`}>
              {welcomeMessage}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{t('select_space_prompt')}</p>
          </div>
          <button
            onClick={onCreateSpace}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-base">add</span>
            {t('create_new_space')}
          </button>
        </div>

        {/* Quick Stats Bar */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-base">timer</span>
            <span className="text-sm font-bold text-slate-800 dark:text-white">{formatDuration(grandTotal)}</span>
            <span className="text-xs text-slate-400">{t('tracked')}</span>
          </div>
          <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-500 text-base">today</span>
            <span className="text-sm font-bold text-slate-800 dark:text-white">{formatDuration(todayTotal)}</span>
            <span className="text-xs text-slate-400">{t('today_label') || 'today'}</span>
          </div>
          <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-500 text-base">date_range</span>
            <span className="text-sm font-bold text-slate-800 dark:text-white">{formatDuration(weekTotal)}</span>
            <span className="text-xs text-slate-400">{t('this_week_label') || 'this week'}</span>
          </div>
          <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500 text-base">grid_view</span>
            <span className="text-sm font-bold text-slate-800 dark:text-white">{spaces.length}</span>
            <span className="text-xs text-slate-400">{t('spaces_label') || 'spaces'}</span>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Ongoing Entries */}
        {ongoingEntries.length > 0 && (
          <div className="mb-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 mb-3">
              {t('ongoing')}
            </h2>
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
              {ongoingEntries.map(entry => {
                const space = spaces.find(s => s.id === entry.spaceId);
                return (
                  <div
                    key={entry.id}
                    onClick={() => onViewEntryDetails(entry)}
                    className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-5 cursor-pointer hover:bg-primary/10 transition-all"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary animate-pulse" />
                    <div className="flex items-center gap-3">
                      <div className={`size-10 rounded-xl ${space?.color || 'bg-slate-400'} flex items-center justify-center shadow-md relative flex-shrink-0`}>
                        <span className="material-symbols-outlined text-white text-sm">{space?.icon || 'timer'}</span>
                        <span className="absolute -top-1 -right-1 size-2.5 bg-primary rounded-full border-2 border-white dark:border-slate-900 animate-ping" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{space?.name}</p>
                        <p className="text-xs text-primary font-semibold">
                          {entry.startTime} · <span className="font-black">{calculateElapsed(entry.startTime || '', entry.date)}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Spaces Grid */}
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
            {t('spaces_label') || 'SPACES'}
          </h2>
          <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
            {spaces.map(space => (
              <SpaceCard
                key={space.id}
                space={space}
                totalHours={totalHoursBySpace[space.id] || 0}
                todayHours={todayHoursBySpace[space.id] || 0}
                weekHours={weekHoursBySpace[space.id] || 0}
                onSelect={() => onSelectSpace(space.id)}
                onEdit={() => onEditSpace(space)}
                onDelete={() => onDeleteSpace(space.id, space.name)}
                t={t}
              />
            ))}

            {/* Create New Space card */}
            <button
              onClick={onCreateSpace}
              className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary hover:bg-primary/5 text-slate-400 hover:text-primary transition-all group min-h-[200px]"
            >
              <div className="size-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary/10 transition-all">
                <span className="material-symbols-outlined text-2xl">add</span>
              </div>
              <span className="text-sm font-semibold">{t('create_new_space')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SpaceCardProps {
  space: Space;
  totalHours: number;
  todayHours: number;
  weekHours: number;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  t: (key: string, params?: any) => string;
}

const SpaceCard: React.FC<SpaceCardProps> = ({
  space, totalHours, todayHours, weekHours,
  onSelect, onEdit, onDelete, t,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="group relative rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
      {/* Color accent bar */}
      <div className={`h-1.5 w-full ${space.color} flex-shrink-0`} />

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`size-12 rounded-xl ${space.color} flex items-center justify-center shadow-md cursor-pointer hover:brightness-110 transition-all`}
            onClick={onSelect}
          >
            {space.icon && <span className="material-symbols-outlined text-white">{space.icon}</span>}
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-lg">more_horiz</span>
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

        <h3
          className="font-bold text-slate-900 dark:text-white text-base mb-4 cursor-pointer hover:text-primary transition-colors leading-tight"
          onClick={onSelect}
        >
          {space.name}
        </h3>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
            <p className="text-[10px] text-slate-400 mb-0.5 uppercase font-semibold tracking-wide">Total</p>
            <p className="text-sm font-black text-slate-800 dark:text-white">{formatDuration(totalHours)}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
            <p className="text-[10px] text-slate-400 mb-0.5 uppercase font-semibold tracking-wide">{t('today_label') || 'Today'}</p>
            <p className="text-sm font-black text-slate-800 dark:text-white">{formatDuration(todayHours)}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
            <p className="text-[10px] text-slate-400 mb-0.5 uppercase font-semibold tracking-wide">{t('week_short') || 'Week'}</p>
            <p className="text-sm font-black text-slate-800 dark:text-white">{formatDuration(weekHours)}</p>
          </div>
        </div>

        <button
          onClick={onSelect}
          className={`w-full mt-auto py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 ${space.color} shadow-sm flex items-center justify-center gap-1.5`}
        >
          <span className="material-symbols-outlined text-base">calendar_today</span>
          {t('open_calendar') || 'Open Calendar'}
        </button>
      </div>
    </div>
  );
};

export default DesktopSpaces;
