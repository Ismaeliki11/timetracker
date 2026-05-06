import React, { useState, useMemo, useRef } from 'react';
import type { Space, TimeEntry } from '../types';
import { useLocalization } from '../context/AppProviders';
import { useIsDesktop } from '../hooks/useIsDesktop';

interface LabelsModalProps {
  space: Space;
  entries: TimeEntry[];
  onClose: () => void;
  onRenameTag: (oldTag: string, newTag: string) => void;
  onDeleteTag: (tag: string) => void;
  onBulkTag: (entryIds: string[], tag: string, action: 'add' | 'remove') => void;
}

const fmtDuration = (hours: number): string => {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
};

// ─── Manage Tab ──────────────────────────────────────────────────────────────

const ManageTab: React.FC<{
  tags: string[];
  onRename: (old: string, next: string) => void;
  onDelete: (tag: string) => void;
  t: (key: string, params?: any) => any;
}> = ({ tags, onRename, onDelete, t }) => {
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = (tag: string) => {
    setEditingTag(tag);
    setEditValue(tag);
    setConfirmingDelete(null);
    setTimeout(() => inputRef.current?.focus(), 30);
  };

  const confirmEdit = () => {
    const trimmed = editValue.trim();
    if (editingTag && trimmed && trimmed !== editingTag) {
      onRename(editingTag, trimmed);
    }
    setEditingTag(null);
  };

  if (tags.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
        <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">label_off</span>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[220px]">{t('no_labels_in_space')}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {tags.map(tag => {
        if (editingTag === tag) {
          return (
            <div key={tag} className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <span className="material-symbols-outlined text-primary flex-shrink-0 text-base">label</span>
              <input
                ref={inputRef}
                className="flex-1 min-w-0 bg-white dark:bg-slate-700 border border-primary rounded-lg px-3 py-1.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') confirmEdit();
                  if (e.key === 'Escape') setEditingTag(null);
                }}
              />
              <button
                onClick={confirmEdit}
                className="flex-shrink-0 p-2 rounded-lg bg-primary text-white hover:brightness-110 transition-all"
              >
                <span className="material-symbols-outlined text-sm">check</span>
              </button>
              <button
                onClick={() => setEditingTag(null)}
                className="flex-shrink-0 p-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined text-sm text-slate-500">close</span>
              </button>
            </div>
          );
        }

        if (confirmingDelete === tag) {
          return (
            <div key={tag} className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
              <span className="material-symbols-outlined text-red-500 flex-shrink-0 text-base">warning</span>
              <span className="flex-1 text-xs font-medium text-red-700 dark:text-red-400 min-w-0 truncate">
                {t('delete_label_confirm', { label: tag })}
              </span>
              <button
                onClick={() => { onDelete(tag); setConfirmingDelete(null); }}
                className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors"
              >
                {t('delete')}
              </button>
              <button
                onClick={() => setConfirmingDelete(null)}
                className="flex-shrink-0 p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <span className="material-symbols-outlined text-sm text-slate-400">close</span>
              </button>
            </div>
          );
        }

        return (
          <div key={tag} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <span className="material-symbols-outlined text-primary flex-shrink-0 text-base">label</span>
            <span className="flex-1 text-sm font-medium text-slate-900 dark:text-white truncate">{tag}</span>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => startEdit(tag)}
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label={t('edit_label')}
              >
                <span className="material-symbols-outlined text-sm text-slate-400 dark:text-slate-500">edit</span>
              </button>
              <button
                onClick={() => { setConfirmingDelete(tag); setEditingTag(null); }}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                aria-label={t('delete_label')}
              >
                <span className="material-symbols-outlined text-sm text-red-400">delete</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Bulk Tab ─────────────────────────────────────────────────────────────────

const BulkTab: React.FC<{
  tags: string[];
  entries: TimeEntry[];
  space: Space;
  onBulkTag: (entryIds: string[], tag: string, action: 'add' | 'remove') => void;
  t: (key: string, params?: any) => any;
  locale: string;
}> = ({ tags, entries, space, onBulkTag, t, locale }) => {
  const [selectedTag, setSelectedTag] = useState<string | null>(tags[0] ?? null);
  const [filter, setFilter] = useState<'all' | 'tagged' | 'untagged'>('all');
  const [flash, setFlash] = useState<string | null>(null);

  // IDs of entries that currently have the selected tag (source of truth from parent)
  const initialCheckedIds = useMemo(() => {
    if (!selectedTag) return new Set<string>();
    return new Set(entries.filter(e => e.tags?.includes(selectedTag)).map(e => e.id));
  }, [selectedTag, entries]);

  // User-editable checked state, pre-seeded from initial tag membership
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set(initialCheckedIds));

  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag);
    setFilter('all');
    setCheckedIds(new Set(entries.filter(e => e.tags?.includes(tag)).map(e => e.id)));
  };

  // Diff between initial state and current user intent
  const toAdd = useMemo(
    () => [...checkedIds].filter(id => !initialCheckedIds.has(id)),
    [checkedIds, initialCheckedIds]
  );
  const toRemove = useMemo(
    () => [...initialCheckedIds].filter(id => !checkedIds.has(id)),
    [checkedIds, initialCheckedIds]
  );
  const hasChanges = toAdd.length > 0 || toRemove.length > 0;

  const filteredEntries = useMemo(() => {
    if (filter === 'tagged') return entries.filter(e => initialCheckedIds.has(e.id));
    if (filter === 'untagged') return entries.filter(e => !initialCheckedIds.has(e.id));
    return entries;
  }, [entries, filter, initialCheckedIds]);

  const entriesByDate = useMemo(() => {
    const grouped: Record<string, TimeEntry[]> = {};
    filteredEntries.forEach(e => {
      if (!grouped[e.date]) grouped[e.date] = [];
      grouped[e.date].push(e);
    });
    return grouped;
  }, [filteredEntries]);

  const sortedDates = useMemo(
    () => Object.keys(entriesByDate).sort((a, b) => b.localeCompare(a)),
    [entriesByDate]
  );

  const toggleEntry = (id: string) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleDay = (date: string) => {
    const ids = (entriesByDate[date] ?? []).map(e => e.id);
    const allIn = ids.every(id => checkedIds.has(id));
    setCheckedIds(prev => {
      const next = new Set(prev);
      if (allIn) ids.forEach(id => next.delete(id));
      else ids.forEach(id => next.add(id));
      return next;
    });
  };

  const handleSelectAll = () =>
    setCheckedIds(prev => {
      const next = new Set(prev);
      filteredEntries.forEach(e => next.add(e.id));
      return next;
    });

  const handleDeselectAll = () =>
    setCheckedIds(prev => {
      const next = new Set(prev);
      filteredEntries.forEach(e => next.delete(e.id));
      return next;
    });

  const handleConfirm = () => {
    if (!selectedTag || !hasChanges) return;
    if (toAdd.length > 0) onBulkTag(toAdd, selectedTag, 'add');
    if (toRemove.length > 0) onBulkTag(toRemove, selectedTag, 'remove');
    const msg = toAdd.length > 0 && toRemove.length > 0
      ? t('bulk_mixed_done', { add: toAdd.length, remove: toRemove.length })
      : toAdd.length > 0
      ? t('tag_applied', { count: toAdd.length })
      : t('tag_removed_from', { count: toRemove.length });
    setFlash(msg);
    setTimeout(() => setFlash(null), 2500);
  };

  const confirmLabel = useMemo(() => {
    if (!hasChanges) return t('bulk_no_changes');
    if (toAdd.length > 0 && toRemove.length > 0) return t('bulk_mixed_action', { add: toAdd.length, remove: toRemove.length });
    if (toAdd.length > 0) return t('bulk_add_action', { count: toAdd.length });
    return t('bulk_remove_action', { count: toRemove.length });
  }, [hasChanges, toAdd, toRemove, t]);

  const fmtDate = (dateStr: string) =>
    new Date(dateStr + 'T12:00:00').toLocaleDateString(locale, {
      weekday: 'long', month: 'long', day: 'numeric',
    });

  if (tags.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
        <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">label_off</span>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[220px]">{t('no_labels_in_space')}</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
        <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">inbox</span>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('no_entries_in_space')}</p>
      </div>
    );
  }

  const taggedCount = initialCheckedIds.size;
  const untaggedCount = entries.length - taggedCount;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Tag selector — horizontal scroll, single row */}
      <div className="border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
        <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
          {tags.map(tag => {
            const count = entries.filter(e => e.tags?.includes(tag)).length;
            return (
              <button
                key={tag}
                onClick={() => handleTagSelect(tag)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all border flex items-center gap-1.5 ${
                  selectedTag === tag
                    ? `${space.color} text-white border-transparent shadow-sm`
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:text-primary'
                }`}
              >
                {tag}
                {count > 0 && (
                  <span className={`text-[10px] font-bold px-1 rounded-full ${
                    selectedTag === tag
                      ? 'bg-white/25 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter bar */}
      <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex gap-2 flex-shrink-0 overflow-x-auto">
        {(['all', 'tagged', 'untagged'] as const).map(f => {
          const label = f === 'all'
            ? `${t('filter_all')} · ${entries.length}`
            : f === 'tagged'
            ? `${t('filter_has_tag')} · ${taggedCount}`
            : `${t('filter_no_tag')} · ${untaggedCount}`;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === f
                  ? 'bg-primary/10 text-primary'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Entry list */}
      <div className="flex-1 overflow-y-auto">
        {/* Sticky bar: selection info + actions */}
        <div className="sticky top-0 z-10 px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {checkedIds.size > 0
              ? t('entries_selected', { count: checkedIds.size })
              : t('select_entries')}
          </span>
          <div className="flex gap-3">
            <button onClick={handleSelectAll} className="text-xs font-semibold text-primary hover:underline">
              {t('select_all')}
            </button>
            <button onClick={handleDeselectAll} className="text-xs font-semibold text-slate-400 hover:underline">
              {t('deselect_all')}
            </button>
          </div>
        </div>

        {/* Flash success message */}
        {flash && (
          <div className="mx-4 mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-700 dark:text-green-400 text-center font-medium">
            {flash}
          </div>
        )}

        {filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center gap-2">
            <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600">
              {filter === 'tagged' ? 'label_off' : 'label'}
            </span>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              {filter === 'tagged' ? t('no_entries_with_tag') : t('no_entries_without_tag')}
            </p>
          </div>
        ) : (
          sortedDates.map(date => {
            const dayEntries = entriesByDate[date];
            const dayIds = dayEntries.map(e => e.id);
            const allDayChecked = dayIds.length > 0 && dayIds.every(id => checkedIds.has(id));
            const someDayChecked = dayIds.some(id => checkedIds.has(id));

            return (
              <div key={date}>
                {/* Day header */}
                <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800/50 sticky top-[37px] z-[5]">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 capitalize">
                    {fmtDate(date)}
                  </span>
                  <button
                    onClick={() => toggleDay(date)}
                    className={`text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${
                      allDayChecked
                        ? 'text-primary bg-primary/10'
                        : someDayChecked
                        ? 'text-primary/70 bg-primary/5'
                        : 'text-slate-400 hover:text-primary hover:bg-primary/5'
                    }`}
                  >
                    {allDayChecked ? t('deselect_all') : t('day_select_all')}
                  </button>
                </div>

                {dayEntries.map(entry => {
                  const isChecked = checkedIds.has(entry.id);
                  const hadTag = initialCheckedIds.has(entry.id);
                  const willAdd = isChecked && !hadTag;
                  const willRemove = !isChecked && hadTag;

                  return (
                    <button
                      key={entry.id}
                      onClick={() => toggleEntry(entry.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        isChecked
                          ? 'bg-primary/5 dark:bg-primary/10'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Checkbox */}
                      <div className={`flex-shrink-0 size-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        isChecked
                          ? 'bg-primary border-primary'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {isChecked && (
                          <span className="material-symbols-outlined text-white" style={{ fontSize: 13 }}>check</span>
                        )}
                      </div>

                      {/* Icon */}
                      <div className="flex-shrink-0 size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400" style={{ fontSize: 15 }}>
                          {entry.icon ?? 'description'}
                        </span>
                      </div>

                      {/* Description + existing tags */}
                      <div className="flex-1 min-w-0 text-left">
                        <p className={`text-sm font-medium truncate ${
                          isChecked ? 'text-primary' : 'text-slate-900 dark:text-white'
                        }`}>
                          {entry.description || '—'}
                        </p>
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {entry.tags.slice(0, 4).map(tag => (
                              <span
                                key={tag}
                                className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                  tag === selectedTag
                                    ? 'bg-primary/20 text-primary'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                                }`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Pending change badge + duration */}
                      <div className="flex-shrink-0 flex flex-col items-end gap-0.5">
                        {willAdd && (
                          <span className="text-[9px] font-bold text-green-500 uppercase tracking-wide">+tag</span>
                        )}
                        {willRemove && (
                          <span className="text-[9px] font-bold text-red-400 uppercase tracking-wide">−tag</span>
                        )}
                        <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">
                          {entry.isOngoing
                            ? <span className="text-primary text-[10px] font-bold animate-pulse">●</span>
                            : fmtDuration(entry.duration)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })
        )}
      </div>

      {/* Confirm footer */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-4 flex-shrink-0 bg-white dark:bg-slate-900">
        <button
          onClick={handleConfirm}
          disabled={!hasChanges}
          className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            hasChanges
              ? toAdd.length > 0 && toRemove.length === 0
                ? `${space.color} text-white shadow-md hover:brightness-110`
                : toRemove.length > 0 && toAdd.length === 0
                ? 'bg-red-500 text-white shadow-md hover:bg-red-600'
                : 'bg-slate-700 dark:bg-slate-500 text-white shadow-md hover:brightness-110'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {toAdd.length > 0 && toRemove.length === 0
              ? 'label'
              : toRemove.length > 0 && toAdd.length === 0
              ? 'label_off'
              : 'sync'}
          </span>
          {confirmLabel}
        </button>
      </div>
    </div>
  );
};

// ─── Main Modal ───────────────────────────────────────────────────────────────

const LabelsModal: React.FC<LabelsModalProps> = ({
  space, entries, onClose, onRenameTag, onDeleteTag, onBulkTag,
}) => {
  const { t, locale } = useLocalization();
  const isDesktop = useIsDesktop();
  const [activeTab, setActiveTab] = useState<'manage' | 'bulk'>('manage');

  const allTags = useMemo(() => {
    const s = new Set<string>();
    entries.forEach(e => e.tags?.forEach(tag => s.add(tag)));
    return Array.from(s).sort();
  }, [entries]);

  const overlayClass = isDesktop
    ? 'fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6'
    : 'fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-end';

  const containerClass = isDesktop
    ? 'relative w-full max-w-2xl max-h-[82vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden'
    : 'relative w-full max-h-[90dvh] bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl flex flex-col overflow-hidden';

  return (
    <div className={overlayClass} onClick={onClose}>
      <div className={containerClass} onClick={e => e.stopPropagation()}>
        {/* Mobile drag handle */}
        {!isDesktop && (
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`size-8 rounded-lg ${space.color} flex items-center justify-center flex-shrink-0`}>
              {space.icon && (
                <span className="material-symbols-outlined text-white text-base">{space.icon}</span>
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{t('labels')}</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-[200px]">{space.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined text-slate-400">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          {(['manage', 'bulk'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {tab === 'manage' ? 'tune' : 'label'}
              </span>
              {tab === 'manage' ? t('manage_labels') : t('bulk_tag')}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'manage' ? (
          <ManageTab
            tags={allTags}
            onRename={onRenameTag}
            onDelete={onDeleteTag}
            t={t}
          />
        ) : (
          <BulkTab
            tags={allTags}
            entries={entries}
            space={space}
            onBulkTag={onBulkTag}
            t={t}
            locale={locale}
          />
        )}
      </div>
    </div>
  );
};

export default LabelsModal;
