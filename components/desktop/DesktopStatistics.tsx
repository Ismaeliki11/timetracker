import React, { useMemo, useState, useRef } from 'react';
import type { Space, TimeEntry } from '../../types';
import { useLocalization } from '../../context/AppProviders';
import { generateInsight } from '../../utils/insightEngine';
import FinancialCalculatorModal from '../FinancialCalculatorModal';
import StatisticsInfoPanel from '../StatisticsInfoPanel';

interface DesktopStatisticsProps {
  space: Space;
  entries: TimeEntry[];
}

const formatHours = (h: number) => {
  const hours = Math.floor(Math.abs(h));
  const minutes = Math.round((Math.abs(h) - hours) * 60);
  return `${h < 0 ? '-' : ''}${hours}h ${minutes}m`;
};

const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const getHeatClass = (hours: number) => {
  if (hours === 0) return 'bg-slate-100 dark:bg-slate-800';
  if (hours < 1) return 'bg-emerald-200 dark:bg-emerald-900';
  if (hours < 2) return 'bg-emerald-300 dark:bg-emerald-700';
  if (hours < 4) return 'bg-emerald-400 dark:bg-emerald-600';
  return 'bg-emerald-500 dark:bg-emerald-500';
};

const DesktopStatistics: React.FC<DesktopStatisticsProps> = ({ space, entries }) => {
  const { t, locale } = useLocalization();
  const [range, setRange] = useState<'week' | 'month' | 'custom'>('week');
  const [anchorDate, setAnchorDate] = useState(new Date());
  const [customStart, setCustomStart] = useState(new Date().toISOString().split('T')[0]);
  const [customEnd, setCustomEnd] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBar, setSelectedBar] = useState<number | null>(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [heatTooltip, setHeatTooltip] = useState<{ date: string; hours: number; x: number; y: number } | null>(null);
  const heatmapRef = useRef<HTMLDivElement>(null);

  // ─── Period stats ────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const anchor = new Date(anchorDate);
    anchor.setHours(0, 0, 0, 0);

    let currentStart: Date, currentEnd: Date, previousStart: Date, previousEnd: Date, rangeLabel = '';

    if (range === 'week') {
      const day = anchor.getDay();
      const diff = anchor.getDate() - day + (day === 0 ? -6 : 1);
      currentStart = new Date(anchor); currentStart.setDate(diff); currentStart.setHours(0, 0, 0, 0);
      currentEnd = new Date(currentStart); currentEnd.setDate(currentStart.getDate() + 6); currentEnd.setHours(23, 59, 59, 999);
      previousStart = new Date(currentStart); previousStart.setDate(currentStart.getDate() - 7);
      previousEnd = new Date(previousStart); previousEnd.setDate(previousStart.getDate() + 6); previousEnd.setHours(23, 59, 59, 999);
      rangeLabel = `${currentStart.toLocaleDateString(locale, { day: 'numeric', month: 'short' })} – ${currentEnd.toLocaleDateString(locale, { day: 'numeric', month: 'short' })}`;
    } else if (range === 'month') {
      currentStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
      currentEnd = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0, 23, 59, 59, 999);
      previousStart = new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1);
      previousEnd = new Date(anchor.getFullYear(), anchor.getMonth(), 0, 23, 59, 59, 999);
      rangeLabel = currentStart.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
    } else {
      currentStart = new Date(customStart + 'T00:00:00');
      currentEnd = new Date(customEnd + 'T23:59:59.999');
      const durationMs = currentEnd.getTime() - currentStart.getTime();
      previousEnd = new Date(currentStart.getTime() - 1);
      previousStart = new Date(previousEnd.getTime() - durationMs);
      rangeLabel = t('custom_range');
    }

    const currentEntries = entries.filter(e => { const d = new Date(e.date + 'T12:00:00'); return d >= currentStart && d <= currentEnd; });
    const previousEntries = entries.filter(e => { const d = new Date(e.date + 'T12:00:00'); return d >= previousStart && d <= previousEnd; });

    const totalHours = currentEntries.reduce((s, e) => s + e.duration, 0);
    const previousHours = previousEntries.reduce((s, e) => s + e.duration, 0);
    const diffHours = totalHours - previousHours;

    const byActivity: Record<string, number> = {};
    currentEntries.forEach(entry => {
      if (entry.tags?.length) { entry.tags.forEach(tag => { byActivity[tag] = (byActivity[tag] || 0) + entry.duration; }); }
      else { const desc = entry.description || t('no_description'); byActivity[desc] = (byActivity[desc] || 0) + entry.duration; }
    });
    const topActivities = Object.entries(byActivity)
      .map(([name, hours]) => ({ name, hours, percentage: totalHours > 0 ? (hours / totalHours) * 100 : 0 }))
      .sort((a, b) => b.hours - a.hours).slice(0, 8);

    const daysDiff = Math.ceil((currentEnd.getTime() - currentStart.getTime()) / (1000 * 3600 * 24));
    const chartDays = Math.max(1, daysDiff);
    const dailyData = Array.from({ length: chartDays }, (_, i) => {
      const d = new Date(currentStart.getTime() + i * 86400000);
      const safeDateStr = toDateStr(d);
      const hours = currentEntries.filter(e => e.date === safeDateStr).reduce((s, e) => s + e.duration, 0);
      let label = '';
      if (range === 'week') label = d.toLocaleDateString(locale, { weekday: 'short' });
      else if (range === 'month') label = (i + 1) % 5 === 1 || i === chartDays - 1 ? (i + 1).toString() : '';
      else label = chartDays <= 14 ? d.getDate().toString() : (i % 5 === 0 ? d.getDate().toString() : '');
      return { date: safeDateStr, hours, label };
    });

    const maxDailyHours = Math.max(...dailyData.map(d => d.hours), 1);
    const insightResult = generateInsight(currentEntries, previousEntries, totalHours, previousHours, t);
    const activeDays = dailyData.filter(d => d.hours > 0);
    const avgDaily = activeDays.length > 0 ? totalHours / activeDays.length : 0;
    const bestDay = Math.max(...dailyData.map(d => d.hours), 0);

    return { totalHours, diffHours, topActivities, dailyData, maxDailyHours, insight: insightResult, rangeLabel, avgDaily, activeDays: activeDays.length, bestDay };
  }, [entries, range, anchorDate, customStart, customEnd, t, locale]);

  // ─── All-time stats ───────────────────────────────────────────────────────────
  const allTime = useMemo(() => {
    const active = entries.filter(e => !e.isOngoing);
    const hoursMap: Record<string, number> = {};
    active.forEach(e => { hoursMap[e.date] = (hoursMap[e.date] || 0) + e.duration; });

    // Heatmap: build 52 full weeks ending today
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayStr = toDateStr(today);

    // Start from the Monday 52 weeks ago
    const heatStart = new Date(today);
    heatStart.setDate(today.getDate() - 52 * 7);
    const startDow = heatStart.getDay();
    heatStart.setDate(heatStart.getDate() - (startDow === 0 ? 6 : startDow - 1));

    const heatmapWeeks: Array<Array<{ date: string; hours: number; isFuture: boolean }>> = [];
    let cursor = new Date(heatStart);
    while (cursor <= today) {
      const week: Array<{ date: string; hours: number; isFuture: boolean }> = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = toDateStr(cursor);
        week.push({ date: dateStr, hours: hoursMap[dateStr] || 0, isFuture: cursor > today });
        cursor.setDate(cursor.getDate() + 1);
      }
      heatmapWeeks.push(week);
    }

    // Month labels: first week of each new month
    const monthLabels: Array<{ label: string; weekIdx: number }> = [];
    let lastMonth = -1;
    heatmapWeeks.forEach((week, wi) => {
      const firstDay = week.find(c => !c.isFuture);
      if (firstDay) {
        const m = new Date(firstDay.date + 'T12:00:00').getMonth();
        if (m !== lastMonth) {
          monthLabels.push({ label: new Date(firstDay.date + 'T12:00:00').toLocaleDateString(locale, { month: 'short' }), weekIdx: wi });
          lastMonth = m;
        }
      }
    });

    // Streaks
    const allDates = [...new Set(active.map(e => e.date))].sort();
    let longestStreak = allDates.length > 0 ? 1 : 0;
    let tempStreak = 1;
    for (let i = 1; i < allDates.length; i++) {
      const prev = new Date(allDates[i - 1] + 'T12:00:00');
      const curr = new Date(allDates[i] + 'T12:00:00');
      const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
      if (diff === 1) { tempStreak++; longestStreak = Math.max(longestStreak, tempStreak); }
      else tempStreak = 1;
    }
    let currentStreak = 0;
    if (allDates.length > 0) {
      const lastTracked = allDates[allDates.length - 1];
      const yesterdayStr = toDateStr(new Date(today.getTime() - 86400000));
      if (lastTracked === todayStr || lastTracked === yesterdayStr) {
        currentStreak = 1;
        for (let i = allDates.length - 2; i >= 0; i--) {
          const a = new Date(allDates[i] + 'T12:00:00');
          const b = new Date(allDates[i + 1] + 'T12:00:00');
          if (Math.round((b.getTime() - a.getTime()) / 86400000) === 1) currentStreak++;
          else break;
        }
      }
    }

    // Day-of-week pattern (Mon=0 … Sun=6)
    const dowHours = [0, 0, 0, 0, 0, 0, 0];
    const dowUniqueDays: Set<string>[] = Array.from({ length: 7 }, () => new Set());
    active.forEach(e => {
      const d = new Date(e.date + 'T12:00:00');
      const dow = d.getDay() === 0 ? 6 : d.getDay() - 1;
      dowHours[dow] += e.duration;
      dowUniqueDays[dow].add(e.date);
    });
    const dowLabels = locale.startsWith('es')
      ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dowData = dowHours.map((h, i) => ({
      label: dowLabels[i],
      avg: dowUniqueDays[i].size > 0 ? h / dowUniqueDays[i].size : 0,
    }));

    // Weekly trend: last 12 weeks
    const weeklyTrend: Array<{ label: string; hours: number }> = [];
    for (let w = 11; w >= 0; w--) {
      const wStart = new Date(today);
      const dow = wStart.getDay();
      wStart.setDate(wStart.getDate() - (dow === 0 ? 6 : dow - 1) - w * 7);
      wStart.setHours(0, 0, 0, 0);
      const wEnd = new Date(wStart); wEnd.setDate(wStart.getDate() + 6); wEnd.setHours(23, 59, 59, 999);
      const hours = active.filter(e => { const d = new Date(e.date + 'T12:00:00'); return d >= wStart && d <= wEnd; }).reduce((s, e) => s + e.duration, 0);
      const label = w === 0 ? '▸' : '';
      weeklyTrend.push({ label, hours });
    }

    const allTimeTotal = active.reduce((s, e) => s + e.duration, 0);
    const totalLoggedDays = allDates.length;

    return { heatmapWeeks, monthLabels, currentStreak, longestStreak, dowData, weeklyTrend, allTimeTotal, totalLoggedDays };
  }, [entries, locale]);

  const handleNavigate = (dir: 'prev' | 'next') => {
    if (range === 'custom') return;
    const d = new Date(anchorDate);
    if (range === 'week') d.setDate(d.getDate() + (dir === 'next' ? 7 : -7));
    else d.setMonth(d.getMonth() + (dir === 'next' ? 1 : -1));
    setAnchorDate(d);
  };

  const maxDow = Math.max(...allTime.dowData.map(d => d.avg), 0.1);
  const maxWeekly = Math.max(...allTime.weeklyTrend.map(w => w.hours), 0.1);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">

      {/* Controls Bar */}
      <div className="px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 flex-shrink-0 flex-wrap">
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-0.5">
          {(['week', 'month', 'custom'] as const).map(r => (
            <button key={r} onClick={() => { setRange(r); if (r !== 'custom') setAnchorDate(new Date()); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${range === r ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
              {r === 'week' ? t('week') : r === 'month' ? t('month') : t('custom_range')}
            </button>
          ))}
        </div>

        {range === 'custom' ? (
          <div className="flex items-center gap-2">
            <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <span className="text-slate-400">—</span>
            <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        ) : (
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-2 py-1">
            <button onClick={() => handleNavigate('prev')} className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined text-slate-500 text-lg">chevron_left</span>
            </button>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 min-w-[150px] text-center capitalize px-1">{stats.rangeLabel}</span>
            <button onClick={() => handleNavigate('next')} className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined text-slate-500 text-lg">chevron_right</span>
            </button>
          </div>
        )}

        <div className="flex-1" />

        <button onClick={() => setIsCalculatorOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium transition-all">
          <span className="material-symbols-outlined text-indigo-500 text-base">payments</span>
          {t('financial_calculator')}
        </button>
        <button onClick={() => setIsInfoOpen(true)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-all">
          <span className="material-symbols-outlined">info</span>
        </button>
      </div>

      {/* Main two-column layout */}
      <div className="flex-1 overflow-hidden flex">

        {/* LEFT: main content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Hero summary */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('total_time')}</p>
                <h2 className="text-5xl font-black text-slate-900 dark:text-white leading-none">{formatHours(stats.totalHours)}</h2>
                <p className={`text-sm font-semibold mt-3 flex items-center gap-1.5 ${stats.diffHours >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                  <span className="material-symbols-outlined text-base">{stats.diffHours >= 0 ? 'trending_up' : 'trending_down'}</span>
                  {stats.diffHours > 0 ? '+' : ''}{formatHours(stats.diffHours)} {t('vs_previous')}
                </p>
              </div>
              <div className={`size-16 rounded-2xl ${space.color} flex items-center justify-center shadow-lg`}>
                <span className="material-symbols-outlined text-white text-3xl">{space.icon || 'timer'}</span>
              </div>
            </div>
          </div>

          {/* Insight */}
          {stats.insight && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-5 border border-indigo-100 dark:border-indigo-800/30 flex items-start gap-4">
              <span className="material-symbols-outlined text-indigo-500 dark:text-indigo-400 text-2xl mt-0.5 flex-shrink-0">{stats.insight.icon}</span>
              <div>
                <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-300 uppercase tracking-wider mb-1">{t('insight')}</h4>
                <p className="text-sm text-slate-700 dark:text-indigo-100 leading-relaxed">{t(stats.insight.textKey, stats.insight.textParams)}</p>
              </div>
            </div>
          )}

          {/* Activity Heatmap */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-500 text-lg">grid_view</span>
                {t('activity_heatmap')}
              </h4>
              <span className="text-xs text-slate-400">{t('last_52_weeks')}</span>
            </div>

            {allTime.heatmapWeeks.length === 0 ? (
              <p className="text-sm text-slate-400 italic text-center py-6">{t('no_activity_heatmap')}</p>
            ) : (
              <div ref={heatmapRef} className="relative overflow-x-auto">
                {/* Month labels */}
                <div className="flex mb-1" style={{ gap: '2px' }}>
                  {allTime.heatmapWeeks.map((_, wi) => {
                    const label = allTime.monthLabels.find(m => m.weekIdx === wi);
                    return (
                      <div key={wi} style={{ width: '10px', flexShrink: 0 }}>
                        {label && <span className="text-[9px] text-slate-400 whitespace-nowrap">{label.label}</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Day-row labels + grid */}
                <div className="flex items-start gap-1">
                  {/* Day labels (Mon / Wed / Fri) */}
                  <div className="flex flex-col flex-shrink-0" style={{ gap: '2px' }}>
                    {['M', '', 'W', '', 'F', '', ''].map((l, i) => (
                      <div key={i} className="text-[8px] text-slate-400 text-right pr-0.5" style={{ height: '10px', lineHeight: '10px' }}>{l}</div>
                    ))}
                  </div>

                  {/* Week columns */}
                  <div className="flex" style={{ gap: '2px' }}>
                    {allTime.heatmapWeeks.map((week, wi) => (
                      <div key={wi} className="flex flex-col" style={{ gap: '2px' }}>
                        {week.map((cell, di) => (
                          <div
                            key={di}
                            className={`rounded-sm cursor-default transition-transform hover:scale-125 ${cell.isFuture ? 'opacity-0 pointer-events-none' : getHeatClass(cell.hours)}`}
                            style={{ width: '10px', height: '10px', flexShrink: 0 }}
                            onMouseEnter={e => {
                              if (!cell.isFuture) {
                                const rect = (e.target as HTMLElement).getBoundingClientRect();
                                const containerRect = heatmapRef.current?.getBoundingClientRect();
                                if (containerRect) setHeatTooltip({ date: cell.date, hours: cell.hours, x: rect.left - containerRect.left + 5, y: rect.top - containerRect.top - 36 });
                              }
                            }}
                            onMouseLeave={() => setHeatTooltip(null)}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tooltip */}
                {heatTooltip && (
                  <div className="absolute z-10 pointer-events-none bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 shadow-xl whitespace-nowrap"
                    style={{ left: heatTooltip.x, top: heatTooltip.y }}>
                    <span className="font-semibold">{heatTooltip.hours > 0 ? formatHours(heatTooltip.hours) : 'No activity'}</span>
                    <span className="text-slate-300 ml-1.5">{new Date(heatTooltip.date + 'T12:00:00').toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                )}

                {/* Legend */}
                <div className="flex items-center gap-1.5 mt-2 justify-end">
                  <span className="text-[9px] text-slate-400">Less</span>
                  {['bg-slate-100 dark:bg-slate-800', 'bg-emerald-200 dark:bg-emerald-900', 'bg-emerald-300 dark:bg-emerald-700', 'bg-emerald-400 dark:bg-emerald-600', 'bg-emerald-500 dark:bg-emerald-500'].map((cls, i) => (
                    <div key={i} className={`rounded-sm ${cls}`} style={{ width: '10px', height: '10px' }} />
                  ))}
                  <span className="text-[9px] text-slate-400">More</span>
                </div>
              </div>
            )}
          </div>

          {/* Period bar chart */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-5">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">bar_chart</span>
                {t('time_distribution')}
              </h4>
              {selectedBar !== null && stats.dailyData[selectedBar] && (
                <div className="text-right">
                  <span className="text-sm font-bold text-primary">{formatHours(stats.dailyData[selectedBar].hours)}</span>
                  <span className="text-xs text-slate-400 ml-1">{stats.dailyData[selectedBar].date}</span>
                </div>
              )}
            </div>
            <div className="h-44 flex items-end gap-1 overflow-x-auto pb-1">
              {stats.dailyData.map((day, i) => (
                <div key={day.date} className="flex flex-col items-center gap-1 flex-1 min-w-[28px] cursor-pointer group"
                  onClick={() => setSelectedBar(i === selectedBar ? null : i)}
                  onMouseEnter={() => setSelectedBar(i)} onMouseLeave={() => setSelectedBar(null)}>
                  <div className={`w-full relative flex items-end justify-center rounded-t-lg transition-all ${i === selectedBar ? 'bg-slate-200 dark:bg-slate-700' : 'bg-slate-100 dark:bg-slate-700/50'}`} style={{ height: '160px' }}>
                    <div className={`w-full rounded-t-lg transition-all duration-500 ${i === selectedBar ? 'bg-primary' : 'bg-primary/55 group-hover:bg-primary/80'}`}
                      style={{ height: `${(day.hours / stats.maxDailyHours) * 100}%` }} />
                  </div>
                  <span className="text-[9px] text-slate-400 truncate max-w-full">{day.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly trend — last 12 weeks */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-violet-500 text-lg">show_chart</span>
              {t('weekly_trend')}
              <span className="text-xs text-slate-400 font-normal ml-1">(12w)</span>
            </h4>
            <div className="flex items-end gap-1.5" style={{ height: '72px' }}>
              {allTime.weeklyTrend.map((week, i) => {
                const heightPct = maxWeekly > 0 ? (week.hours / maxWeekly) * 100 : 0;
                const isCurrentWeek = i === allTime.weeklyTrend.length - 1;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5 group relative" style={{ height: '72px' }}>
                    <div className={`w-full rounded-t-md transition-all duration-500 ${isCurrentWeek ? 'bg-violet-500 dark:bg-violet-400' : 'bg-violet-200 dark:bg-violet-900 group-hover:bg-violet-400 dark:group-hover:bg-violet-600'}`}
                      style={{ height: `${heightPct}%`, minHeight: week.hours > 0 ? '3px' : '0' }} />
                    {week.label && <span className="text-[9px] text-violet-500 dark:text-violet-400 font-bold">{week.label}</span>}
                    {/* hover tooltip */}
                    {week.hours > 0 && (
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        {formatHours(week.hours)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-slate-400">12 weeks ago</span>
              <span className="text-[9px] text-violet-500 font-semibold">Now</span>
            </div>
          </div>

        </div>

        {/* RIGHT: stats + patterns + activities */}
        <div className="w-72 xl:w-80 flex-shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto p-5 space-y-5">

          {/* All-time key metrics — list style, no boxes */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('all_time_label')}</p>
            <div>
              <div className="flex justify-between items-baseline py-2.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400">{t('total_logged_days')}</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white">{allTime.totalLoggedDays} {t('days_suffix')}</span>
              </div>
              <div className="flex justify-between items-baseline py-2.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400">{t('avg_active_day')}</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white">
                  {allTime.totalLoggedDays > 0 ? formatHours(allTime.allTimeTotal / allTime.totalLoggedDays) : '—'}
                </span>
              </div>
              <div className="flex justify-between items-baseline py-2.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400">{t('current_streak')}</span>
                <span className={`text-sm font-bold flex items-center gap-1 ${allTime.currentStreak > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-white'}`}>
                  {allTime.currentStreak >= 3 && <span className="material-symbols-outlined text-amber-500 text-sm">local_fire_department</span>}
                  {allTime.currentStreak} {t('days_suffix')}
                </span>
              </div>
              <div className="flex justify-between items-baseline py-2.5">
                <span className="text-xs text-slate-500 dark:text-slate-400">{t('longest_streak')}</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white">{allTime.longestStreak} {t('days_suffix')}</span>
              </div>
            </div>
          </div>

          {/* Period quick stats — same list style */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stats.rangeLabel}</p>
            <div>
              <div className="flex justify-between items-baseline py-2.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400">{t('daily_avg')}</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white">{formatHours(stats.avgDaily)}</span>
              </div>
              <div className="flex justify-between items-baseline py-2.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400">{t('best_day')}</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white">{formatHours(stats.bestDay)}</span>
              </div>
              <div className="flex justify-between items-baseline py-2.5">
                <span className="text-xs text-slate-500 dark:text-slate-400">{t('active_days')}</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white">{stats.activeDays} {t('days_suffix')}</span>
              </div>
            </div>
          </div>

          {/* Day-of-week pattern */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sky-500 text-base">calendar_view_week</span>
              {t('day_pattern')}
            </h4>
            <div className="space-y-1.5">
              {allTime.dowData.map((dow, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 w-7 flex-shrink-0">{dow.label}</span>
                  <div className="flex-1 h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-400 dark:bg-sky-500 rounded-full transition-all duration-700"
                      style={{ width: `${maxDow > 0 ? (dow.avg / maxDow) * 100 : 0}%` }} />
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 w-10 text-right flex-shrink-0">
                    {dow.avg > 0 ? `${Math.floor(dow.avg)}h${Math.round((dow.avg % 1) * 60) > 0 ? Math.round((dow.avg % 1) * 60) + 'm' : ''}` : '—'}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Average hours on days with activity</p>
          </div>

          {/* Top Activities */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-emerald-500 text-base">pie_chart</span>
              {t('top_activities')}
            </h4>
            {stats.topActivities.length > 0 ? (
              <div className="space-y-3">
                {stats.topActivities.map((activity, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[55%]" title={activity.name}>{activity.name}</span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-xs font-bold text-slate-400">{Math.round(activity.percentage)}%</span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatHours(activity.hours)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${activity.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic text-center py-6">{t('no_data')}</p>
            )}
          </div>

        </div>
      </div>

      {isCalculatorOpen && (
        <FinancialCalculatorModal entries={entries} onClose={() => setIsCalculatorOpen(false)}
          initialRange={range} initialCustomStart={customStart} initialCustomEnd={customEnd} />
      )}
      <StatisticsInfoPanel isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
    </div>
  );
};

export default DesktopStatistics;
