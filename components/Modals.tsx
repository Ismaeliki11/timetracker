import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Space, TimeEntry } from '../types';
import { SPACE_COLORS, ICONS } from '../constants';
import { useLocalization } from '../context/AppProviders';

// --- Reusable Modal Wrapper ---
interface ModalProps {
    onClose: () => void;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ onClose, children }) => (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
        <style>{`
            @keyframes fade-in {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            .animate-fade-in { animation: fade-in 0.2s ease-out; }
        `}</style>
        <div className="relative w-full max-w-md glass-pane rounded-xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            {children}
        </div>
    </div>
);

// --- Confirmation Modal for Deletes ---
export const ConfirmModal: React.FC<{
    title: string;
    message: string;
    onConfirm: () => void;
    onClose: () => void;
}> = ({ title, message, onConfirm, onClose }) => {
    const { t } = useLocalization();
    return (
        <Modal onClose={onClose}>
            <div className="p-6">
                <h2 className="text-xl font-bold text-center text-black dark:text-white">{title}</h2>
                <p className="text-center text-slate-600 dark:text-slate-300 mt-2 text-sm">{message}</p>
            </div>
            <div className="flex flex-wrap items-center justify-stretch gap-4 p-4 border-t border-slate-200 dark:border-slate-700">
                <button onClick={onClose} className="flex h-12 flex-1 rounded-lg bg-slate-200 dark:bg-slate-700 font-bold text-black dark:text-white items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">{t('cancel')}</button>
                <button onClick={onConfirm} className="flex h-12 flex-1 rounded-lg bg-red-600 font-bold text-white items-center justify-center hover:bg-red-700 transition-colors">{t('confirm_delete')}</button>
            </div>
        </Modal>
    );
};


// --- Space Modal (Create & Edit) ---

interface SpaceModalProps {
    onClose: () => void;
    onSave: (space: Omit<Space, 'id'>, spaceId?: string) => void;
    spaceToEdit?: Space | null;
}

export const SpaceModal: React.FC<SpaceModalProps> = ({ onClose, onSave, spaceToEdit }) => {
    const { t } = useLocalization();
    const [name, setName] = useState('');
    const [color, setColor] = useState(SPACE_COLORS[6]);
    const [icon, setIcon] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (spaceToEdit) {
            setName(spaceToEdit.name);
            setColor(spaceToEdit.color);
            setIcon(spaceToEdit.icon);
        }
    }, [spaceToEdit]);


    const handleSave = () => {
        if (name.trim()) {
            onSave({ name, color, icon }, spaceToEdit?.id);
        }
    };

    return (
        <Modal onClose={onClose}>
            <div className="p-6">
                <h2 className="text-2xl font-bold text-center text-black dark:text-white">{spaceToEdit ? t('edit_space') : t('create_new_space')}</h2>
            </div>
            <div className="flex flex-col gap-6 px-6 max-h-[60vh] overflow-y-auto scrollable-content">
                <label className="flex flex-col">
                    <p className="pb-2 text-base font-medium text-slate-800 dark:text-gray-300">{t('space_name')}</p>
                    <input
                        className="form-input flex h-14 w-full rounded-lg border bg-slate-100 p-4 text-base placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-gray-400"
                        placeholder={t('space_name_placeholder')}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </label>
                <div className="flex flex-col">
                    <p className="text-base font-medium text-slate-800 dark:text-gray-300">{t('space_color')}</p>
                    <div className="grid grid-cols-8 gap-2 pt-3">
                        {SPACE_COLORS.map(c => (
                            <div key={c} className="relative w-10 h-10 mx-auto">
                                <button onClick={() => setColor(c)} className={`w-full h-full rounded-full transition-transform hover:scale-110 ${c}`} />
                                {color === c && (
                                    <div className="absolute inset-0 rounded-full bg-primary/80 flex items-center justify-center pointer-events-none">
                                        <span className="material-symbols-outlined text-white text-xl">check</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col">
                    <div className="flex items-baseline gap-2">
                        <p className="text-base font-medium text-slate-800 dark:text-gray-300">{t('icon')}</p>
                        <span className="text-xs font-normal text-slate-500 dark:text-gray-400">{t('optional')}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2 pt-3 max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-2 scrollable-content">
                        {ICONS.map(i => (
                            <button key={i} onClick={() => setIcon(i === icon ? undefined : i)} className={`flex h-12 w-full cursor-pointer items-center justify-center rounded-lg ring-2 ring-inset transition-colors ${icon === i ? 'bg-primary/20 ring-primary' : 'bg-slate-100 dark:bg-slate-700/60 ring-transparent hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                                <span className="material-symbols-outlined text-slate-800 dark:text-slate-200 text-2xl">{i}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex flex-1 flex-wrap items-center justify-stretch gap-4 p-6 border-t border-slate-200 dark:border-slate-700 mt-4">
                <button onClick={onClose} className="flex h-12 flex-1 rounded-lg bg-slate-200 dark:bg-slate-700 font-bold text-black dark:text-white items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">{t('cancel')}</button>
                <button onClick={handleSave} disabled={!name.trim()} className="flex h-12 flex-1 rounded-lg bg-primary font-bold text-white items-center justify-center hover:bg-primary/90 disabled:bg-primary/40 disabled:cursor-not-allowed">{spaceToEdit ? t('save_changes') : t('create')}</button>
            </div>
        </Modal>
    );
};


// --- Log Time Modal ---
// --- LogTimeModal ---
interface LogTimeModalProps {
    date: Date;
    onClose: () => void;
    onSave: (entry: Omit<TimeEntry, 'id' | 'spaceId' | 'date'>, entryId?: string) => void;
    entryToEdit?: TimeEntry | null;
    availableTags?: string[];
}

export const LogTimeModal: React.FC<LogTimeModalProps> = ({ date, onClose, onSave, entryToEdit, availableTags = [] }) => {
    const { t, locale } = useLocalization();
    const [mode, setMode] = useState<'duration' | 'range'>('duration');
    const [durationStr, setDurationStr] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:30');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState<string | undefined>(undefined);

    // Tags State
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [filteredTags, setFilteredTags] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        if (entryToEdit) {
            const h = Math.floor(entryToEdit.duration);
            const m = Math.round((entryToEdit.duration - h) * 60);
            setDurationStr(`${h}:${String(m).padStart(2, '0')}`);
            setDescription(entryToEdit.description);
            setIcon(entryToEdit.icon);
            setTags(entryToEdit.tags || []);
            setMode('duration');
        }
    }, [entryToEdit]);

    useEffect(() => {
        const remainingTags = availableTags.filter(t => !tags.includes(t));
        if (tagInput.trim()) {
            const lowerInput = tagInput.toLowerCase();
            setFilteredTags(remainingTags.filter(t => t.toLowerCase().includes(lowerInput)));
            setShowSuggestions(true);
        } else {
            setFilteredTags(remainingTags);
            // Don't auto-hide here, let onBlur or selection handle it
        }
    }, [tagInput, availableTags, tags]);

    const handleAddTag = (tag: string) => {
        const trimmed = tag.trim();
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
            setTagInput('');
            setShowSuggestions(false);
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag(tagInput);
        }
    };

    const duration = useMemo(() => {
        if (mode === 'duration') {
            if (durationStr.includes(':')) {
                const [hours, minutes] = durationStr.split(':').map(Number);
                return (hours || 0) + ((minutes || 0) / 60);
            }
            const val = parseFloat(durationStr);
            return isNaN(val) ? 0 : val;
        } else { // Time Range
            try {
                const start = new Date(`1970-01-01T${startTime}:00`);
                const end = new Date(`1970-01-01T${endTime}:00`);
                if (end <= start) return 0;
                const diffMs = end.getTime() - start.getTime();
                return diffMs / (1000 * 60 * 60);
            } catch {
                return 0;
            }
        }
    }, [mode, durationStr, startTime, endTime]);

    const handleSave = () => {
        if (duration > 0) {
            onSave({ duration, description, icon, tags }, entryToEdit?.id);
        }
    };

    const formattedDate = date.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <Modal onClose={onClose}>
            <div className="flex items-center p-4 justify-between border-b border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 w-12 text-left">calendar_today</span>
                <h2 className="text-lg font-bold text-black dark:text-gray-100 flex-1 text-center">{entryToEdit ? t('edit_entry') : t('log_time')}</h2>
                <button onClick={onClose} className="flex items-center justify-center w-12 h-12 -mr-4 text-slate-900 dark:text-gray-200" aria-label={t('close')}>
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto scrollable-content" onClick={() => setShowSuggestions(false)}>
                <p className="text-base font-medium text-slate-900 dark:text-gray-200 pb-2">{formattedDate}</p>

                {/* Tags Section */}
                <div className="flex flex-col mb-4 relative z-10">
                    <p className="text-sm font-medium pb-2 text-slate-800 dark:text-gray-300">{t('tags')}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {tags.map(tag => (
                            <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm font-medium border border-primary/20">
                                {tag}
                                <button onClick={() => handleRemoveTag(tag)} className="hover:text-primary/70">
                                    <span className="material-symbols-outlined text-base">close</span>
                                </button>
                            </span>
                        ))}
                    </div>
                    <div className="relative">
                        <div className="flex gap-2">
                            <input
                                className="form-input flex-1 rounded-lg border bg-slate-100 p-3 text-base placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-gray-400"
                                placeholder={t('tag_placeholder')}
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => {
                                    setShowSuggestions(true);
                                }}
                            />
                            <button
                                onClick={() => handleAddTag(tagInput)}
                                disabled={!tagInput.trim()}
                                className="px-4 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-medium disabled:opacity-50"
                            >
                                {t('add_tag')}
                            </button>
                        </div>
                        {/* Auto-complete dropdown */}
                        {showSuggestions && filteredTags.length > 0 && (
                            <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-40 overflow-y-auto scrollable-content z-50">
                                {filteredTags.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddTag(tag);
                                        }}
                                        className="flex w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-gray-200"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-center p-1 rounded-lg bg-slate-100 dark:bg-slate-800 my-2">
                    <button onClick={() => setMode('duration')} className={`px-4 py-1.5 rounded-md text-sm font-medium flex-1 transition-all ${mode === 'duration' ? 'bg-white dark:bg-slate-700 shadow' : 'text-slate-700 dark:text-slate-200'}`}>{t('duration')}</button>
                    <button onClick={() => setMode('range')} className={`px-4 py-1.5 rounded-md text-sm font-medium flex-1 transition-all ${mode === 'range' ? 'bg-white dark:bg-slate-700 shadow' : 'text-slate-700 dark:text-slate-200'}`}>{t('time_range')}</button>
                </div>

                {mode === 'duration' ? (
                    <label className="flex flex-col w-full my-4">
                        <p className="text-sm font-medium pb-2 text-slate-800 dark:text-gray-300">{t('duration')}</p>
                        <input
                            className="form-input flex w-full rounded-lg border bg-slate-100 p-4 h-14 text-base placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-gray-400"
                            placeholder={t('duration_placeholder')}
                            value={durationStr}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (/^[0-9.:]*$/.test(value)) {
                                    setDurationStr(value);
                                }
                            }}
                        />
                    </label>
                ) : (
                    <div className="flex gap-4 my-4">
                        <label className="flex flex-col w-full">
                            <p className="text-sm font-medium pb-2 text-slate-800 dark:text-gray-300">{t('start_time')}</p>
                            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="form-input flex w-full rounded-lg border bg-slate-100 p-4 h-14 text-base border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                        </label>
                        <label className="flex flex-col w-full">
                            <p className="text-sm font-medium pb-2 text-slate-800 dark:text-gray-300">{t('end_time')}</p>
                            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="form-input flex w-full rounded-lg border bg-slate-100 p-4 h-14 text-base border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                        </label>
                    </div>
                )}

                <label className="flex flex-col w-full mb-4">
                    <p className="text-sm font-medium pb-2 text-slate-800 dark:text-gray-300">{t('description')}</p>
                    <textarea
                        className="form-textarea flex w-full min-h-24 rounded-lg border bg-slate-100 p-4 text-base placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-gray-400"
                        placeholder={t('description_placeholder')}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </label>
                <div className="flex flex-col">
                    <div className="flex items-baseline gap-2 mb-2">
                        <p className="text-sm font-medium text-slate-800 dark:text-gray-300">{t('icon')}</p>
                        <span className="text-xs font-normal text-slate-500 dark:text-gray-400">{t('optional')}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2 pt-1 max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-2 scrollable-content">
                        {ICONS.map(i => (
                            <button key={i} onClick={() => setIcon(i === icon ? undefined : i)} className={`flex h-12 w-full cursor-pointer items-center justify-center rounded-lg ring-2 ring-inset transition-colors ${icon === i ? 'bg-primary/20 ring-primary' : 'bg-slate-100 dark:bg-slate-700/60 ring-transparent hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                                <span className="material-symbols-outlined text-slate-800 dark:text-slate-200 text-2xl">{i}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-end gap-4 p-4 mt-2 border-t border-slate-200 dark:border-slate-700">
                <button onClick={onClose} className="flex items-center justify-center rounded-lg h-12 px-6 bg-slate-200 dark:bg-slate-700 text-black dark:text-gray-200 text-base font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">{t('cancel')}</button>
                <button onClick={handleSave} disabled={duration <= 0} className="flex items-center justify-center rounded-lg h-12 px-6 bg-primary text-white text-base font-bold hover:bg-primary/90 transition-colors disabled:bg-primary/40 disabled:cursor-not-allowed">{t('save')}</button>
            </div>
        </Modal>
    );
};

// --- Details Modal ---
interface DetailsModalProps {
    entry: TimeEntry;
    onClose: () => void;
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

export const DetailsModal: React.FC<DetailsModalProps> = ({ entry, onClose }) => {
    const { t, locale } = useLocalization();
    const formattedDate = new Date(entry.date + 'T12:00:00').toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <Modal onClose={onClose}>
            <div className="flex items-center p-4 justify-between border-b border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 w-12 text-left">{entry.icon || 'description'}</span>
                <h2 className="text-lg font-bold text-black dark:text-gray-100 flex-1 text-center">{t('entry_details')}</h2>
                <button onClick={onClose} className="flex items-center justify-center w-12 h-12 -mr-4 text-slate-900 dark:text-gray-200" aria-label={t('close')}>
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
            <div className="p-6 space-y-4">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-gray-400">{t('date')}</p>
                    <p className="text-base text-black dark:text-gray-200">{formattedDate}</p>
                </div>
                {entry.tags && entry.tags.length > 0 && (
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-gray-400">{t('tags')}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {entry.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm font-medium border border-primary/20">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-gray-400">{t('duration')}</p>
                    <p className="text-base text-black dark:text-gray-200">{formatDurationFromHours(entry.duration)}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-gray-400">{t('description')}</p>
                    <p className="text-base text-black dark:text-gray-200 whitespace-pre-wrap break-words max-h-48 overflow-y-auto scrollable-content">
                        {entry.description || t('no_description_provided')}
                    </p>
                </div>
            </div>
            <div className="flex items-center justify-end gap-4 p-4 mt-2 border-t border-slate-200 dark:border-slate-700">
                <button onClick={onClose} className="flex items-center justify-center rounded-lg h-12 px-6 bg-slate-200 dark:bg-slate-700 font-bold text-black dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">{t('close')}</button>
            </div>
        </Modal>
    );
};